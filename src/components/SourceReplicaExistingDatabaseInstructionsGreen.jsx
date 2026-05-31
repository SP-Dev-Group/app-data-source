import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { DatabaseZap, Copy, Check, Save, Search, X, Pencil, ClipboardCopy, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  project_name: "",
  replica_entity_name: "",
  source_entity_name: "SourceEntityName",
  sync_function_name: "syncSourceEntityNameToSourceListener",
  push_function_name: "",
  secret_name: "",
  replica_app_id: "value-here",
  database_root_name: "people",
};

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-40 shrink-0 text-xs">{label}</span>
      <span className="font-mono text-xs flex-1 truncate">{value}</span>
      <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function CopyInputField({ label, value, onChange, disabled, onEdit, showCopy }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
      <Input
        value={value}
        onChange={onChange}
        className="h-7 text-xs font-mono flex-1"
        disabled={disabled}
      />
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
      {onEdit && (
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="h-7 text-xs px-2 shrink-0"
        >
          <Pencil className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

export default function SourceReplicaExistingDatabaseInstructionsGreen() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULTS);
  const [loadedRecordId, setLoadedRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [sourcePopupOpen, setSourcePopupOpen] = useState(false);
  const [replicaPopupOpen, setReplicaPopupOpen] = useState(false);

  const set = (field, value) => {
    if (field === "database_root_name") {
      // Remove spaces and special characters, keep only alphanumeric
      const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
      // Capitalize first character
      const newDbRoot = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
      const newReplicaEntity = "Replica" + newDbRoot;
      const newPushFunction = "pushto" + newReplicaEntity;
      const newSecretName = "REPLICA_" + newDbRoot.toUpperCase() + "_APP_ID";
      setForm((f) => ({ 
        ...f, 
        [field]: newDbRoot,
        replica_entity_name: newReplicaEntity,
        push_function_name: newPushFunction,
        secret_name: newSecretName
      }));
    } else if (field === "source_entity_name") {
      // Generate sync function name based on source entity: sync{SourceEntity}ToSourceListener
      const newSyncFunction = "sync" + value + "ToSourceListener";
      setForm((f) => ({ 
        ...f, 
        [field]: value,
        sync_function_name: newSyncFunction
      }));
    } else {
      setForm((f) => ({ ...f, [field]: value }));
    }
  };

  const handleCopyAll = () => {
    const columnFields = generateColumnFields(form.replica_entity_name, 8);
    const sourceCode = generateSourceCode(form.replica_entity_name, form.secret_name, form.replica_app_id);
    const replicaCode = generateReplicaCode(form.replica_entity_name);
    const subscriptionCode = generateSubscriptionCode(form.replica_entity_name);

    const allContent = `CONFIG FIELDS
===============
Project Name: ${form.project_name}
Database Root Name: ${form.database_root_name}
Replica Entity: ${form.replica_entity_name}
Source Entity: ${form.source_entity_name}
Sync Function: ${form.sync_function_name}
Push Function: ${form.push_function_name}
Secret Name: ${form.secret_name}
Replica App ID: ${form.replica_app_id}

SOURCE ENTITY SCHEMA
====================
Instruction: In this Replica app, create entity using the provided schema from Source App and name it ${form.replica_entity_name}

Schema:
{
  "unique_id": "string (required)",
  "column1": "string",
  "column2": "string",
  "column3": "string",
  "column4": "string",
  "column5": "string",${form.source_entity_name.includes("Two") ? `
  "column6": "string",
  "column7": "string",
  "column8": "string",` : ""}
}

SOURCE APP: ${form.push_function_name} FUNCTION
========================================
${sourceCode}

REPLICA APP INSTRUCTIONS
========================
Step 1: Create backend function ${form.sync_function_name}
Step 2: Use entity ${form.replica_entity_name} with fields: unique_id (string, required), column1, column2, column3, column4, column5
Step 3: No automation needed on replica side
Step 4: In source app, set up ${form.push_function_name} function and entity automation
Step 5: Add frontend subscription to table page
🔑🔑 REPLICA APP ID: ${form.replica_app_id}

Step 1: Backend Function (${form.sync_function_name})
${replicaCode}

Step 5: Live Table Updates (Frontend Subscription)
${subscriptionCode}`;

    navigator.clipboard.writeText(allContent);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleAdd = () => {
    setForm({
      project_name: "",
      replica_entity_name: "Replicapeople",
      source_entity_name: "SourceEntityName",
      sync_function_name: "syncSourceEntityToSourceListener",
      push_function_name: "pushtoReplicapeople",
      secret_name: "REPLICA_people_APP_ID",
      replica_app_id: "value-here",
      database_root_name: "People",
    });
    setLoadedRecordId(null);
    setEditingField("project_name");
    setShowResults(false);
    setSearchTerm("");
  };

  const handleSave = async () => {
    if (!form.project_name.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      unique_id: form.project_name.trim(),
    };
    if (loadedRecordId) {
      await base44.entities.SourceReplicaConfig.update(loadedRecordId, payload);
    } else {
      await base44.entities.SourceReplicaConfig.create(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSearch = async () => {
    setSearching(true);
    setShowResults(true);
    const all = await base44.entities.SourceReplicaConfig.list();
    const term = searchTerm.toLowerCase();
    setSearchResults(
      term
        ? all.filter((r) => r.project_name?.toLowerCase().includes(term))
        : all.slice(0, 3)
    );
    setSearching(false);
  };

  useEffect(() => {
    if (open) {
      handleSearch();
    }
  }, [open]);

  const loadConfig = (record) => {
    const dbRoot = record.database_root_name || DEFAULTS.database_root_name;
    setForm({
      project_name: record.project_name || "",
      replica_entity_name: record.replica_entity_name || ("Replica" + dbRoot),
      source_entity_name: record.source_entity_name || DEFAULTS.source_entity_name,
      sync_function_name: record.sync_function_name || DEFAULTS.sync_function_name,
      push_function_name: record.push_function_name || ("pushto" + "Replica" + dbRoot),
      secret_name: record.secret_name || ("REPLICA_" + dbRoot + "_APP_ID"),
      replica_app_id: record.replica_app_id || DEFAULTS.replica_app_id,
      database_root_name: dbRoot,
    });
    setLoadedRecordId(record.id);
    setShowResults(false);
    setSearchTerm("");
    setEditingField(null);
  };

  const fields = [
    { label: "Database Root Name", key: "database_root_name" },
    { label: "Replica Entity", key: "replica_entity_name", editable: false },
    { label: "Source Entity", key: "source_entity_name" },
    { label: "Sync Function", key: "sync_function_name" },
    { label: "Push Function", key: "push_function_name", editable: false },
    { label: "Replica Secret Name", key: "secret_name", editable: false },
    { label: "Replica App ID", key: "replica_app_id" },
  ];

  // Map entity names to their column count
  const getEntityColumns = (entityName) => {
    const entityColumnMap = {
      "ReplicaEntitySample": 5,
      "ReplicaEntitySampleTwo": 8,
      "SourceEntitySample": 5,
      "SourceEntitySampleTwo": 8,
    };
    // Default to 8 if not found, or try to detect from entity name
    if (entityName.includes("Two")) return 8;
    if (entityName.includes("One") || (entityName.includes("Sample") && !entityName.includes("Two"))) return 5;
    return entityColumnMap[entityName] || 8;
  };

  const generateColumnFields = (entityName, indent = 8) => {
    const columnCount = getEntityColumns(entityName);
    const indentStr = " ".repeat(indent);
    let fields = "";
    for (let i = 1; i <= columnCount; i++) {
      fields += `${indentStr}column${i}: record.column${i},\n`;
    }
    return fields;
  };

  const generateSourceCode = (functionName, entityName, secretName, appId) => {
    const columnFields = generateColumnFields(entityName, 8);
    return `// Function Name: ${functionName}

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@base44/sdk@0.8.25';

const ${secretName} = "${appId || ''}";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const record = payload.data || payload;

    const replicaClient = createClient({ 
      appId: ${secretName}, 
      serviceRole: true 
    });

    const existing = await replicaClient.entities.${entityName}.filter({ 
      unique_id: record.unique_id || record.id 
    });

    if (existing && existing.length > 0) {
      await replicaClient.entities.${entityName}.update(existing[0].id, {
        unique_id: record.unique_id,
${columnFields}      });
    } else {
      await replicaClient.entities.${entityName}.create({
        unique_id: record.unique_id,
${columnFields}      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;
  };

  const generateReplicaCode = (entityName) => {
    const columnFields = generateColumnFields(entityName, 8);
    return `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const record = payload.data || payload;

    const existing = await base44.entities.${entityName}.filter({ 
      unique_id: record.unique_id 
    });

    if (existing && existing.length > 0) {
      await base44.entities.${entityName}.update(existing[0].id, {
        unique_id: record.unique_id,
${columnFields}      });
    } else {
      await base44.entities.${entityName}.create({
        unique_id: record.unique_id,
${columnFields}      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;
  };

  const generateSubscriptionCode = (entityName) => `useEffect(() => {
  const unsubscribe = base44.entities.${entityName}.subscribe((event) => {
    console.log(\`${entityName} \${event.type}:\`, event.data);
    refetch();
  });

  return () => unsubscribe();
}, [refetch]);`;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs h-8 justify-start text-green-600 hover:text-green-700"
      >
        <DatabaseZap className="h-3 w-3" />
        Source-Replica: Exisiting - Form version
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Source-Replica: Existing — Form Version</DialogTitle>
          </DialogHeader>

          {/* Search / Recall */}
          <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Search Saved Configs</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded">Step 1: Create New</span>
                <Button size="sm" variant="outline" onClick={handleAdd} className="h-7 text-xs px-2">
                  <Save className="w-3 h-3 mr-1" /> Add New
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search by config name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button size="sm" variant="outline" onClick={handleSearch} disabled={searching} className="h-7 text-xs px-3">
                <Search className="w-3 h-3 mr-1" /> Search
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Showing first 3 saved configs. Search to find more.</p>
            {showResults && (
              <div className="border rounded bg-background text-xs max-h-40 overflow-y-auto">
                {searching ? (
                  <p className="p-2 text-muted-foreground">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="p-2 text-muted-foreground">No results found.</p>
                ) : (
                  searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between px-3 py-1.5 hover:bg-muted cursor-pointer border-b last:border-0"
                      onClick={() => loadConfig(r)}
                    >
                      <span className="font-medium">{r.project_name}</span>
                      <span className="text-muted-foreground text-[10px]">{r.replica_entity_name}</span>
                    </div>
                  ))
                )}
                <button
                  onClick={() => setShowResults(false)}
                  className="w-full text-center py-1 text-muted-foreground hover:text-foreground text-[10px] border-t"
                >
                  <X className="w-3 h-3 inline mr-1" />Close
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="border rounded-lg p-3 space-y-3">
            <div className="mb-2">
              <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded">Step 2: Fill in Form</span>
            </div>

            {/* Source Popup Dialog */}
            <Dialog open={sourcePopupOpen} onOpenChange={setSourcePopupOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-green-600">SOURCE</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* SOURCE Copy Instruction Box at Top */}
                  <div className="border rounded-lg p-3 bg-green-50 border-green-200 flex items-center justify-between">
                    <p className="text-xs text-green-800 font-medium">Click and Copy this message and paste to the chat message Base44 in the Replica App</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const sourceContent = `For this current page, use the following code to set up this app and page to receive data from a source app.

SOURCE
=====
SOURCE APP FUNCTION: ${form.push_function_name}

${generateSourceCode(form.push_function_name, form.replica_entity_name, form.secret_name, form.replica_app_id)}

Source App Instructions

Step 1: Create backend function ${form.sync_function_name}
Step 2: Use entity ${form.replica_entity_name} with fields: unique_id (string, required), column1, column2, column3, column4, column5
Step 3: No automation needed on replica side
Step 4: In source app, set up ${form.push_function_name} function and entity automation
Step 5: Add frontend subscription to table page
🔑🔑 REPLICA APP ID: ${form.replica_app_id}

Step 1: Backend Function (${form.sync_function_name})

${generateReplicaCode(form.replica_entity_name)}

SOURCE APP INSTRUCTION: Live Table Updates (Frontend Subscription)

Instruction: For any page which uses this entity (${form.replica_entity_name}), add this frontend subscription code to the page containing the table / data for the ${form.replica_entity_name}.

${generateSubscriptionCode(form.replica_entity_name)}`;
                        navigator.clipboard.writeText(sourceContent);
                        setCopiedAll(true);
                        setTimeout(() => setCopiedAll(false), 2000);
                      }}
                      className="h-7 text-xs px-2 shrink-0"
                    >
                      <ClipboardCopy className="w-3 h-3 mr-1" />
                      {copiedAll ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  {/* Source App Instructions */}
                  <div className="border rounded-lg p-3 space-y-3">
                    <p className="text-xs font-bold text-green-600 tracking-wide mb-2">SOURCE</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source App Instructions</p>
                    <div className="text-xs space-y-2">
                      <p><strong>Step 1:</strong> Create backend function <code className="bg-black text-green-400 px-1 rounded">{form.sync_function_name}</code></p>
                      <p><strong>Step 2:</strong> Use entity <code className="bg-black text-green-400 px-1 rounded">{form.replica_entity_name}</code> with fields: unique_id (string, required), column1, column2, column3, column4, column5</p>
                      <p><strong>Step 3:</strong> No automation needed on replica side</p>
                      <p><strong>Step 4:</strong> In source app, set up {form.push_function_name} function and entity automation</p>
                      <p><strong>Step 5:</strong> Add frontend subscription to table page</p>
                      <p className="text-red-500 font-semibold">🔑🔑 REPLICA APP ID: {form.replica_app_id}</p>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Step 1: Backend Function ({form.sync_function_name})</p>
                      <pre className="bg-black text-green-400 p-3 rounded text-[10px] overflow-x-auto max-h-96 overflow-y-auto">
                        {generateReplicaCode(form.replica_entity_name)}
                      </pre>
                    </div>
                  </div>
                  {/* Source App Code */}
                  <div className="border rounded-lg p-3 space-y-3">
                    <p className="text-xs font-bold text-green-600 tracking-wide mb-2">SOURCE</p>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">SOURCE APP FUNCTION: {form.push_function_name}</p>
                    <pre className="bg-black text-green-400 p-3 rounded text-[10px] overflow-x-auto max-h-96 overflow-y-auto">
                      {generateSourceCode(form.push_function_name, form.replica_entity_name, form.secret_name, form.replica_app_id)}
                    </pre>
                  </div>

                  {/* SOURCE APP INSTRUCTION: Live Table Updates (Frontend Subscription) */}
                  <div className="border rounded-lg p-3 space-y-3">
                    <p className="text-xs font-bold text-green-600 tracking-wide mb-2">SOURCE</p>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">SOURCE APP INSTRUCTION: Live Table Updates (Frontend Subscription)</p>
                    <p className="text-xs bg-green-50 border border-green-200 rounded p-2 text-green-800">
                      <strong>Instruction:</strong> For any page which uses this entity (<code className="bg-green-100 px-1 rounded">{form.replica_entity_name}</code>), add this frontend subscription code to the page containing the table / data for the {form.replica_entity_name}.
                    </p>
                    <pre className="bg-black text-green-400 p-3 rounded text-[10px] overflow-x-auto">
                      {generateSubscriptionCode(form.replica_entity_name)}
                    </pre>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Replica Popup Dialog */}
            <Dialog open={replicaPopupOpen} onOpenChange={setReplicaPopupOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-blue-600">REPLICA</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* REPLICA APP INSTRUCTIONS Box */}
                  <div className="border rounded-lg p-3 bg-blue-50 border-blue-200 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">REPLICA APP INSTRUCTIONS</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const replicaContent = `REPLICA APP INSTRUCTIONS
========================
"Use the following to create entity and page code to host the table displaying the entity".

Source Entity Schema: ${form.source_entity_name}

Instruction: In this Replica app, create entity using the provided schema from Source App and name it ${form.replica_entity_name}

Schema:
{
  "unique_id": "string (required)",
  "column1": "string",
  "column2": "string",
  "column3": "string",
  "column4": "string",
  "column5": "string",${form.source_entity_name.includes("Two") ? `
  "column6": "string",
  "column7": "string",
  "column8": "string",` : ""}
}

REPLICA APP INSTRUCTION Step 5: Live Table Updates (Frontend Subscription)

Instruction: For any page which uses this entity (${form.replica_entity_name}), add this frontend subscription code to the page containing the table / data for the ${form.replica_entity_name}.

${generateSubscriptionCode(form.replica_entity_name)}`;
                          navigator.clipboard.writeText(replicaContent);
                          setCopiedAll(true);
                          setTimeout(() => setCopiedAll(false), 2000);
                        }}
                        className="h-7 text-xs px-2"
                      >
                        <ClipboardCopy className="w-3 h-3 mr-1" />
                        {copiedAll ? "Copied!" : "Copy All"}
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700">"Use the following to create entity and page code to host the table displaying the entity".</p>
                  </div>

                  {/* Source Entity Schema */}
                  <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <p className="text-xs font-bold text-blue-600 tracking-wide mb-2">REPLICA</p>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">Source Entity Schema: {form.source_entity_name}</p>
                    <div className="text-[10px] text-muted-foreground">Required fields for entity: {form.source_entity_name}</div>
                    <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-800 leading-relaxed">
                      <strong>Instruction:</strong> In this Replica app, create entity using the provided schema from Source App and name it{' '}
                      <span className="bg-blue-100 px-1 rounded break-words font-mono text-[10px] w-full inline-block">{form.replica_entity_name}</span>
                    </div>
                    <pre className="bg-black text-blue-400 p-3 rounded text-[10px] overflow-x-auto">
{`{
  "unique_id": "string (required)",
  "column1": "string",
  "column2": "string",
  "column3": "string",
  "column4": "string",
  "column5": "string",${form.source_entity_name.includes("Two") ? `
  "column6": "string",
  "column7": "string",
  "column8": "string",` : ""}
}`}
                    </pre>
                  </div>

                  {/* REPLICA APP INSTRUCTION Step 5 */}
                  <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <p className="text-xs font-bold text-blue-600 tracking-wide mb-2">REPLICA</p>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">REPLICA APP INSTRUCTION: Live Table Updates (Frontend Subscription)</p>
                    <p className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-800">
                      <strong>Instruction:</strong> For any page which uses this entity (<code className="bg-blue-100 px-1 rounded">{form.replica_entity_name}</code>), add this frontend subscription code to the page containing the table / data for the {form.replica_entity_name}.
                    </p>
                    <pre className="bg-black text-blue-400 p-3 rounded text-[10px] overflow-x-auto">
                      {generateSubscriptionCode(form.replica_entity_name)}
                    </pre>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Config Fields</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-40 shrink-0">Project Name <span className="text-red-500">*</span></span>
              <Input
                value={form.project_name}
                onChange={(e) => set("project_name", e.target.value)}
                placeholder="e.g. DataSync Project"
                className="h-7 text-xs flex-1"
                disabled={editingField !== "project_name"}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingField(editingField === "project_name" ? null : "project_name")}
                className="h-7 text-xs px-2 shrink-0"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </div>

            {fields.slice(0, 5).map(({ label, key, editable }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
                <Input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="h-7 text-xs font-mono flex-1"
                  disabled={editable === false || editingField !== key}
                />
                {editable !== false && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingField(editingField === key ? null : key)}
                    className="h-7 text-xs px-2 shrink-0"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}

            {/* Step 3 Label */}
            <div className="mb-2">
              <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded">Step 3: Complete these with Replica App</span>
            </div>

            {/* Replica App Configuration Section */}
            <div className="border rounded-lg p-3 bg-blue-50 border-blue-200 space-y-3 mt-3">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Replica App Configuration</p>
              <ol className="text-[10px] text-blue-700 space-y-1 ml-4 list-decimal">
                <li>Click <strong>Copy</strong> the Replica Secret Name from here</li>
                <li>Go to the Replica App, Dashboard / Secret / Add Secret</li>
                <li>Paste value in the <strong>Secret Name</strong> box</li>
                <li>In Replica App, Dashboard / API copy the appID from the code snippet</li>
                <li>Replica App, Dashboard / Secret / Secret Value, paste in the <strong>appID string</strong></li>
                <li>Paste the appID here in the <strong>Replica App ID</strong> form here below</li>
              </ol>
            </div>

            {fields.slice(5).map(({ label, key, editable }) => (
              <CopyInputField
                key={key}
                label={label}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                disabled={editable === false || editingField !== key}
                onEdit={editable !== false ? () => setEditingField(editingField === key ? null : key) : null}
                showCopy={key === "secret_name"}
              />
            ))}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !form.project_name.trim()}
              className="w-full h-7 text-xs mt-2"
            >
              {saved ? <><Check className="w-3 h-3 mr-1 text-green-300" /> Saved!</> : saving ? "Saving..." : <><Save className="w-3 h-3 mr-1" /> Save Config</>}
            </Button>

            {/* Step 4 Label */}
            <div className="mb-2">
              <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded">Step 4</span>
            </div>

            {/* Popup Buttons Box */}
            <div className="border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">View and Copy REPLICA Instructions</p>
              </div>
              
              {/* Step 4 Sub-steps */}
              <div className="mb-3 text-[10px] text-muted-foreground space-y-1">
                <p><strong>Step 1:</strong> Click and open <button onClick={(e) => { e.stopPropagation(); setReplicaPopupOpen(true); }} className="text-xs font-bold text-white uppercase tracking-wide px-2 py-0.5 rounded bg-blue-600 border border-blue-600 hover:bg-blue-700 transition-colors cursor-pointer">REPLICA</button></p>
                <p><strong>Step 2:</strong> Click copy the body</p>
                <p><strong>Step 3:</strong> Open the Replica App on the page which will display the table with the data from the database entity</p>
                <p><strong>Step 4:</strong> Paste the click copy into the chat message for the Base44 AI to do the build</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSourcePopupOpen(true)}
                  className="flex-1 text-sm font-bold text-white uppercase tracking-wide px-3 py-2 rounded bg-green-600 border border-green-600 hover:bg-green-700 transition-colors cursor-pointer"
                >
                  SOURCE
                </button>
                <button
                  onClick={() => setReplicaPopupOpen(true)}
                  className="flex-1 text-sm font-bold text-white uppercase tracking-wide px-3 py-2 rounded bg-blue-600 border border-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  REPLICA
                </button>
              </div>
            </div>
          </div>

          {/* Copy Reference Panel */}
          <div className="border rounded-lg p-3 space-y-2 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Copy Reference Values</p>
            <CopyField label="Database Root Name" value={form.database_root_name} />
            <CopyField label="Replica Entity" value={form.replica_entity_name} />
            <CopyField label="Source Entity" value={form.source_entity_name} />
            <CopyField label="Sync Function" value={form.sync_function_name} />
            <CopyField label="Push Function" value={form.push_function_name} />
            <CopyField label="Secret Name" value={form.secret_name} />
            <CopyField label="Replica App ID" value={form.replica_app_id} />
          </div>

          {/* REPLICA Section */}
          <div className="space-y-3 mt-4">
            {/* Source Entity Schema */}
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-blue-600 tracking-wide mb-2">REPLICA</p>
              <p className="text-xs font-semibold text-muted-foreground tracking-wide">Source Entity Schema: {form.source_entity_name}</p>
              <div className="text-[10px] text-muted-foreground">Required fields for entity: {form.source_entity_name}</div>
              <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-800 leading-relaxed">
                <strong>Instruction:</strong> In this Replica app, create entity using the provided schema from Source App and name it{' '}
                <span className="bg-blue-100 px-1 rounded break-words font-mono text-[10px] w-full inline-block">{form.replica_entity_name}</span>
              </div>
              <pre className="bg-black text-blue-400 p-3 rounded text-[10px] overflow-x-auto">
{`{
  "unique_id": "string (required)",
  "column1": "string",
  "column2": "string",
  "column3": "string",
  "column4": "string",
  "column5": "string",${form.source_entity_name.includes("Two") ? `
  "column6": "string",
  "column7": "string",
  "column8": "string",` : ""}
}`}
              </pre>
            </div>

            {/* REPLICA APP INSTRUCTION Step 5 */}
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-blue-600 tracking-wide mb-2">REPLICA</p>
              <p className="text-xs font-semibold text-muted-foreground mb-2">REPLICA APP INSTRUCTION: Live Table Updates (Frontend Subscription)</p>
              <p className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-800">
                <strong>Instruction:</strong> For any page which uses this entity (<code className="bg-blue-100 px-1 rounded">{form.replica_entity_name}</code>), add this frontend subscription code to the page containing the table / data for the {form.replica_entity_name}.
              </p>
              <pre className="bg-black text-blue-400 p-3 rounded text-[10px] overflow-x-auto">
                {generateSubscriptionCode(form.replica_entity_name)}
              </pre>
            </div>
          </div>

          {/* SOURCE Section */}
          <div className="space-y-3">
            {/* Source App Code */}
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-green-600 tracking-wide mb-2">SOURCE</p>
              <p className="text-xs font-semibold text-muted-foreground tracking-wide">SOURCE APP FUNCTION: {form.push_function_name}</p>
              <div className="text-[10px] text-muted-foreground">Code generated from your config: {form.project_name}</div>
              <pre className="bg-black text-green-400 p-3 rounded text-[10px] overflow-x-auto max-h-96 overflow-y-auto">
                {generateSourceCode(form.push_function_name, form.replica_entity_name, form.secret_name, form.replica_app_id)}
              </pre>
            </div>

            {/* Source App Instructions */}
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-green-600 tracking-wide mb-2">SOURCE</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source App Instructions</p>
              <div className="text-xs space-y-2">
                <p><strong>Step 1:</strong> Create backend function <code className="bg-black text-green-400 px-1 rounded">{form.sync_function_name}</code></p>
                <p><strong>Step 2:</strong> Use entity <code className="bg-black text-green-400 px-1 rounded">{form.replica_entity_name}</code> with fields: unique_id (string, required), column1, column2, column3, column4, column5</p>
                <p><strong>Step 3:</strong> No automation needed on replica side</p>
                <p><strong>Step 4:</strong> In source app, set up {form.push_function_name} function and entity automation</p>
                <p><strong>Step 5:</strong> Add frontend subscription to table page</p>
                <p className="text-red-500 font-semibold">🔑🔑 REPLICA APP ID: {form.replica_app_id}</p>
              </div>
              
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Step 1: Backend Function ({form.sync_function_name})</p>
                <pre className="bg-black text-green-400 p-3 rounded text-[10px] overflow-x-auto max-h-96 overflow-y-auto">
                  {generateReplicaCode(form.replica_entity_name)}
                </pre>
              </div>

              {/* SOURCE APP INSTRUCTION Step 5: Live Table Updates (Frontend Subscription) */}
              <div className="border rounded-lg p-3 space-y-3 mt-3">
                <p className="text-xs font-bold text-green-600 tracking-wide mb-2">SOURCE</p>
                <p className="text-xs font-semibold text-muted-foreground mb-2">SOURCE APP INSTRUCTION: Live Table Updates (Frontend Subscription)</p>
                <p className="text-xs bg-green-50 border border-green-200 rounded p-2 text-green-800">
                  <strong>Instruction:</strong> For any page which uses this entity (<code className="bg-green-100 px-1 rounded">{form.replica_entity_name}</code>), add this frontend subscription code to the page containing the table / data for the {form.replica_entity_name}.
                </p>
                <pre className="bg-black text-green-400 p-3 rounded text-[10px] overflow-x-auto">
                  {generateSubscriptionCode(form.replica_entity_name)}
                </pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}