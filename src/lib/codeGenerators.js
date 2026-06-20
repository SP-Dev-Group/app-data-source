export function generateSourceSchema(sourceEntityName, sourceFields) {
  const schema = {
    name: sourceEntityName,
    type: "object",
    properties: {},
    required: ["unique_id"],
  };

  schema.properties.unique_id = {
    type: "string",
    description: "Unique identifier for the record",
  };

  sourceFields.forEach(field => {
    if (field.name) {
      schema.properties[field.name] = {
        type: field.type,
        description: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      };
    }
  });

  return JSON.stringify(schema, null, 2);
}

export function generateArchiveSchema(sourceEntityName) {
  return `{
  "name": "${sourceEntityName}Archive",
  "type": "object",
  "properties": {
    "source_id": {
      "type": "string",
      "description": "The ID of the original ${sourceEntityName} record"
    },
    "unique_id": {
      "type": "string",
      "description": "The unique_id field from the original record"
    },
    "event_type": {
      "type": "string",
      "enum": ["created", "updated", "deleted", "reinstated"],
      "description": "What action triggered this archive entry"
    },
    "version": {
      "type": "number",
      "description": "Version number (1 = first created, 2+ = edits, or deleted marker)"
    }
  },
  "required": ["source_id", "unique_id", "event_type", "version"]
}`;
}

export function generateVersionHistorySchema(sourceEntityName) {
  return `{
  "name": "${sourceEntityName}VersionHistory",
  "type": "object",
  "properties": {
    "source_id": {
      "type": "string",
      "description": "The ID of the original ${sourceEntityName} record"
    },
    "unique_id": {
      "type": "string",
      "description": "The unique_id field from the original record"
    },
    "event_type": {
      "type": "string",
      "enum": ["created", "updated", "archived"],
      "description": "What action triggered this version entry"
    },
    "version": {
      "type": "number",
      "description": "Version number (1 = first created, increments on each update)"
    }
  },
  "required": ["source_id", "unique_id", "event_type", "version"]
}`;
}

export function generateReplicaConfigSchema(projectName, sourceEntityName) {
  const projectNameClean = projectName.replace(/\s+/g, '');
  return `{
  "name": "ReplicaAppConfig${projectNameClean}",
  "type": "object",
  "properties": {
    "project_name": {
      "type": "string",
      "description": "Human-readable project name (e.g. ${projectName})"
    },
    "replica_app_id": {
      "type": "string",
      "description": "The Base44 App ID of the external replica app"
    },
    "replica_entity_name": {
      "type": "string",
      "description": "Entity name in the replica app to push data into"
    },
    "secret_name": {
      "type": "string",
      "description": "Name of the secret stored in this app's environment"
    },
    "secret_value": {
      "type": "string",
      "description": "The actual service role key value for the replica app"
    },
    "source_entity_name": {
      "type": "string",
      "description": "Source entity name in this (SSOT) app"
    },
    "notes": {
      "type": "string",
      "description": "Optional notes about this replica configuration"
    }
  },
  "required": ["project_name", "replica_app_id", "replica_entity_name", "secret_name", "secret_value", "source_entity_name"]
}`;
}

export function generatePushFunction(formData, replicaIndex = 0) {
  const { projectName, sourceEntityName, sourceFields, replicas } = formData;
  const replica = replicas[replicaIndex] || replicas[0];
  const projectNameClean = projectName.replace(/\s+/g, '');
  const fieldMappings = sourceFields
    .filter(f => f.name)
    .map(f => `${f.name}: record.${f.name}`)
    .join(',\n                    ');

  return `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { configId } = await req.json();
        if (!configId) {
            return Response.json({ error: 'configId required' }, { status: 400 });
        }

        const configs = await base44.entities.ReplicaAppConfig${projectNameClean}.filter({ id: configId });
        const config = configs[0];

        if (!config) {
            return Response.json({ error: 'Config not found' }, { status: 404 });
        }

        const records = await base44.entities.${sourceEntityName}.filter({});
        let pushed = 0;
        const errors = [];

        for (const record of records) {
            try {
                const replicaBase44 = createClient(config.replica_app_id, config.secret_value);
                const normalizedRecord = {
                    unique_id: record.unique_id,
                    ${fieldMappings || '...record'}
                };

                const existing = await replicaBase44.entities.${sourceEntityName}.filter({ unique_id: record.unique_id });

                if (existing && existing.length > 0) {
                    await replicaBase44.entities.${sourceEntityName}.update(existing[0].id, normalizedRecord);
                } else {
                    await replicaBase44.entities.${sourceEntityName}.create(normalizedRecord);
                }
                pushed++;
            } catch (err) {
                errors.push({ unique_id: record.unique_id, error: err.message });
            }
        }

        return Response.json({ pushed, errors });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function createClient(appId, serviceRoleKey) {
    const base44 = createClientFromRequest(req);
    return base44.asServiceRole;
}`;
}

export function generateDeleteFunction(formData, replicaIndex = 0) {
  const { projectName, sourceEntityName, replicas } = formData;
  const projectNameClean = projectName.replace(/\s+/g, '');
  return `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { recordId } = await req.json();
        if (!recordId) {
            return Response.json({ error: 'recordId required' }, { status: 400 });
        }

        const configs = await base44.entities.ReplicaAppConfig${projectNameClean}.filter({});
        const record = await base44.entities.${sourceEntityName}.filter({ id: recordId });
        
        if (!record || record.length === 0) {
            return Response.json({ error: 'Record not found' }, { status: 404 });
        }

        let deleted = 0;
        const errors = [];

        for (const config of configs) {
            try {
                const replicaBase44 = createClient(config.replica_app_id, config.secret_value);
                const existing = await replicaBase44.entities.${sourceEntityName}.filter({ unique_id: record[0].unique_id });

                if (existing && existing.length > 0) {
                    await replicaBase44.entities.${sourceEntityName}.delete(existing[0].id);
                    deleted++;
                }
            } catch (err) {
                errors.push({ config: config.project_name, error: err.message });
            }
        }

        return Response.json({ deleted, errors });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function createClient(appId, serviceRoleKey) {
    const base44 = createClientFromRequest(req);
    return base44.asServiceRole;
}`;
}

export function generateAllocateFunction(formData, replicaIndex = 0) {
  const { projectName, sourceEntityName, sourceFields, replicas } = formData;
  const projectNameClean = projectName.replace(/\s+/g, '');
  const fieldMappings = sourceFields
    .filter(f => f.name)
    .map(f => `${f.name}: record[0].${f.name}`)
    .join(',\n                    ');

  return `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recordId } = await req.json();
        if (!recordId) {
            return Response.json({ error: 'recordId required' }, { status: 400 });
        }

        const record = await base44.entities.${sourceEntityName}.filter({ id: recordId });
        if (!record || record.length === 0) {
            return Response.json({ error: 'Record not found' }, { status: 404 });
        }

        const allocatedProjectIds = record[0].allocated_projects || [];
        const configs = await base44.entities.ReplicaAppConfig${projectNameClean}.filter({ id: { $in: allocatedProjectIds } });

        let pushed = 0;
        const errors = [];

        for (const config of configs) {
            try {
                const replicaBase44 = createClient(config.replica_app_id, config.secret_value);
                const normalizedRecord = {
                    unique_id: record[0].unique_id,
                    ${fieldMappings || '...record[0]'}
                };

                const existing = await replicaBase44.entities.${sourceEntityName}.filter({ unique_id: record[0].unique_id });

                if (existing && existing.length > 0) {
                    await replicaBase44.entities.${sourceEntityName}.update(existing[0].id, normalizedRecord);
                } else {
                    await replicaBase44.entities.${sourceEntityName}.create(normalizedRecord);
                }
                pushed++;
            } catch (err) {
                errors.push({ config: config.project_name, error: err.message });
            }
        }

        return Response.json({ pushed, errors });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function createClient(appId, serviceRoleKey) {
    const base44 = createClientFromRequest(req);
    return base44.asServiceRole;
}`;
}

export function generateReinstateFunction(formData, replicaIndex = 0) {
  const { projectName, sourceEntityName } = formData;
  const projectNameClean = projectName.replace(/\s+/g, '');
  return `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { archiveId } = await req.json();
        if (!archiveId) {
            return Response.json({ error: 'archiveId required' }, { status: 400 });
        }

        const archive = await base44.entities.${sourceEntityName}Archive.filter({ id: archiveId });
        if (!archive || archive.length === 0) {
            return Response.json({ error: 'Archive record not found' }, { status: 404 });
        }

        const existing = await base44.entities.${sourceEntityName}.filter({ unique_id: archive[0].unique_id });
        if (existing && existing.length > 0) {
            return Response.json({ error: 'Record with this unique_id already exists' }, { status: 409 });
        }

        const newRecord = await base44.entities.${sourceEntityName}.create({
            unique_id: archive[0].unique_id,
        });

        return Response.json({ success: true, record: newRecord });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});`;
}

export function generateSourceInstructions(formData) {
  const { projectName, sourceEntityName, createArchiveEntities } = formData;
  const projectNameClean = projectName.replace(/\s+/g, '');
  return `### SOURCE App Setup Instructions for ${projectName}

## Step 1: Create Entities

### 1.1 Source Entity: ${sourceEntityName}
- Create entity with schema (paste into entities/${sourceEntityName}.json)
- Use the generated JSON schema from the Source Schema section

${createArchiveEntities ? `### 1.2 Archive Entity: ${sourceEntityName}Archive
- Create entity for tracking archived records
- Use the generated Archive schema

### 1.3 Version History Entity: ${sourceEntityName}VersionHistory
- Create entity for version tracking
- Use the generated Version History schema` : ''}

### 1.4 Replica Config Entity: ReplicaAppConfig${projectNameClean}
- Store replica app configurations
- Use the generated ReplicaConfig schema

## Step 2: Create Backend Functions

Create the following functions in the functions/ directory:

1. pushToReplica${projectNameClean} - Sync all records to a replica
2. deleteFromReplicas${projectNameClean} - Remove record from all replicas
3. pushAllocatedRecord${projectNameClean} - Sync allocated records
4. reinstateFromArchive${projectNameClean} - Restore archived records

## Step 3: Create Page

${formData.sourcePage?.mode === 'existing'
  ? `Use existing page: **${formData.sourcePage?.fileName ? formData.sourcePage.fileName : '⚠️ FILE NAME NOT SET — enter it in Page Configuration above'}**
  - Integrate the ${sourceEntityName} table and Replica Config panel into this existing page.`
  : `Create a new page: **${formData.sourcePage?.fileName ? formData.sourcePage.fileName : '⚠️ FILE NAME NOT SET — enter it in Page Configuration above'}**
  - Table display for ${sourceEntityName} records including:
  - Record list with Allocate, Edit, Archive buttons
  - Replica configs table with Push All button
  - Archive viewer for reinstatement`
}

## Workflows

### Record Allocation
1. User clicks 'Allocate' button on a record
2. Selects target replicas via checkboxes
3. Config IDs saved to allocated_projects field
4. pushAllocatedRecord${projectNameClean} invoked to sync record to selected replicas

### Record Editing
1. User clicks 'Edit' button on a record
2. Updates record name in ${sourceEntityName}
3. Creates version history entry
4. pushAllocatedRecord${projectNameClean} invoked to propagate changes to replicas

### Record Archiving
1. User clicks 'Archive' button on a record
2. Creates archive entry in ${sourceEntityName}Archive
3. Creates version history entry
4. deleteFromReplicas${projectNameClean} invoked to remove from all allocated replicas
5. Source record deleted from ${sourceEntityName}

### Manual Push to Replica
1. User clicks 'Push All' on a replica config
2. pushToReplica${projectNameClean} fetches all source records
3. Records upserted (created/updated) in replica app
4. Field names normalized to match replica schema

### Record Reinstatement
1. User clicks 'View Archive' button
2. Selects archived record to reinstate
3. reinstateFromArchive${projectNameClean} creates new active record
4. Record must be re-allocated to replicas manually
`;
}

export function generateReplicaInstructions(formData) {
  const { projectName, sourceEntityName, replicas } = formData;
  const firstReplica = replicas?.[0];
  const replicaEntityName = firstReplica?.replicaEntityName || (firstReplica?.replicaAppName ? `Replica${firstReplica.replicaAppName.replace(/\s+/g, '')}` : 'ReplicaEntity');
  return `### REPLICA App Setup Instructions for ${projectName}

## Step 1: Create Entity

### Replica Entity: ${replicaEntityName}
- Create entity with same schema as SOURCE's ${sourceEntityName}
- All fields should match exactly
- unique_id is the key field for matching records

## Step 2: Create Page

${formData.replicaPage?.mode === 'existing'
  ? `Use existing page: **${formData.replicaPage?.fileName ? formData.replicaPage.fileName : '⚠️ FILE NAME NOT SET — enter it in Page Configuration above'}**
  - Integrate the ${replicaEntityName} read-only table into this existing page.`
  : `Create a new page: **${formData.replicaPage?.fileName ? formData.replicaPage.fileName : '⚠️ FILE NAME NOT SET — enter it in Page Configuration above'}**
  - Table with all fields from the entity
- Read-only view (data is pushed from SOURCE app)
- Optional: Add search/filter functionality`
}

## Step 3: Configure Connection

1. Get your App ID from Base44 dashboard
2. Generate a Service Role Key
3. Provide these to the SOURCE app administrator
4. The SOURCE app will use these credentials to push data

## Notes

- This replica app receives data from the SOURCE app
- Do not manually create/edit records in this app
- All data changes should come through the push mechanism
- The replica entity schema must match the source entity schema
`;
}

export function generateSourcePageCode(formData) {
  const { projectName, sourceEntityName } = formData;
  const projectNameClean = projectName.replace(/\s+/g, '');
  return `// Source App Page for ${projectName}
// File: pages/${projectName.replace(/\s+/g, '')}.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2, Send, Pencil, Archive, Tag, FileArchive } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function ${projectName.replace(/\s+/g, '')}Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pushingId, setPushingId] = useState(null);

  const handlePush = async (config) => {
    setPushingId(config.id);
    try {
      const res = await base44.functions.invoke("pushToReplica${projectNameClean}", { configId: config.id });
      toast.success(\`Pushed \${res.data.pushed} record(s)\`);
    } catch (err) {
      toast.error(\`Push failed: \${err.message}\`);
    } finally {
      setPushingId(null);
    }
  };

  const { data: records } = useQuery({
    queryKey: ["${sourceEntityName}"],
    queryFn: () => base44.entities.${sourceEntityName}.list(),
  });

  const { data: configs } = useQuery({
    queryKey: ["ReplicaAppConfig${projectNameClean}"],
    queryFn: () => base44.entities.ReplicaAppConfig${projectNameClean}.list(),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">${projectName}</h1>
        </div>

        {/* Source Records Table */}
        <h2 className="text-lg font-semibold mb-2">${sourceEntityName}</h2>
        <div className="rounded-lg border overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unique ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Allocate</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Archive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono">{record.unique_id}</TableCell>
                  <TableCell>{record.Name}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Tag className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="text-destructive">
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Replica Configs Table */}
        <h2 className="text-lg font-semibold mb-2">Replica Configs</h2>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>Push</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs?.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.project_name}</TableCell>
                  <TableCell className="font-mono text-sm">{config.replica_app_id}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pushingId === config.id}
                      onClick={() => handlePush(config)}
                    >
                      {pushingId === config.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Push All
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateReplicaPageCode(formData) {
  const { projectName, sourceEntityName, replicas } = formData;
  const firstReplica = replicas?.[0];
  const replicaEntityName = firstReplica?.replicaEntityName || (firstReplica?.replicaAppName ? `Replica${firstReplica.replicaAppName.replace(/\s+/g, '')}` : 'ReplicaEntity');
  return `// Replica App Page for ${projectName}
// File: pages/${projectName.replace(/\s+/g, '')}.jsx

import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ${projectName.replace(/\s+/g, '')}ReplicaPage() {
  const navigate = useNavigate();

  const { data: records, isLoading } = useQuery({
    queryKey: ["${replicaEntityName}"],
    queryFn: () => base44.entities.${replicaEntityName}.list(),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">${projectName} - Replica Data</h1>
        </div>

        <h2 className="text-lg font-semibold mb-2">${replicaEntityName}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Data is synced from the SOURCE app. Do not manually edit records.
        </p>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unique ID</TableHead>
                <TableHead>Name</TableHead>
                {/* Add more columns based on your entity fields */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No records yet. Waiting for data from SOURCE app.
                  </TableCell>
                </TableRow>
              ) : (
                records?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}`;
}