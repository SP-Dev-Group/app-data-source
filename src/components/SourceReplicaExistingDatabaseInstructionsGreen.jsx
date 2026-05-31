import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { DatabaseZap, Copy, Check, Save, Search, X, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  project_name: "",
  replica_entity_name: "ReplicaEntityName",
  source_entity_name: "SourceEntityName",
  sync_function_name: "syncSourceEntityToSourceListener",
  push_function_name: "pushtoReplicaEntityName",
  secret_name: 'REPLICA_"  "_APP_ID',
  replica_app_id: "value-here",
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

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = () => {
    setForm({
      project_name: "",
      replica_entity_name: "ReplicaEntityName",
      source_entity_name: "SourceEntityName",
      sync_function_name: "syncSourceEntityToSourceListener",
      push_function_name: "pushtoReplicaEntityName",
      secret_name: 'REPLICA_"  "_APP_ID',
      replica_app_id: "value-here",
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
    setForm({
      project_name: record.project_name || "",
      replica_entity_name: record.replica_entity_name || DEFAULTS.replica_entity_name,
      source_entity_name: record.source_entity_name || DEFAULTS.source_entity_name,
      sync_function_name: record.sync_function_name || DEFAULTS.sync_function_name,
      push_function_name: record.push_function_name || DEFAULTS.push_function_name,
      secret_name: record.secret_name || DEFAULTS.secret_name,
      replica_app_id: record.replica_app_id || DEFAULTS.replica_app_id,
    });
    setLoadedRecordId(record.id);
    setShowResults(false);
    setSearchTerm("");
    setEditingField(null);
  };

  const fields = [
    { label: "Replica Entity", key: "replica_entity_name" },
    { label: "Source Entity", key: "source_entity_name" },
    { label: "Sync Function", key: "sync_function_name" },
    { label: "Push Function", key: "push_function_name" },
    { label: "Secret Name", key: "secret_name" },
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

  const generateSourceCode = (entityName, secretName, appId) => {
    const columnFields = generateColumnFields(entityName, 8);
    return `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
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
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Search Saved Configs</p>
              <Button size="sm" variant="outline" onClick={handleAdd} className="h-7 text-xs px-2">
                <Save className="w-3 h-3 mr-1" /> Add New
              </Button>
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
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Config Fields</p>

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

            {fields.map(({ label, key }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
                <Input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="h-7 text-xs font-mono flex-1"
                  disabled={editingField !== key}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingField(editingField === key ? null : key)}
                  className="h-7 text-xs px-2 shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            ))}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !form.project_name.trim()}
              className="w-full h-7 text-xs mt-2"
            >
              {saved ? <><Check className="w-3 h-3 mr-1 text-green-300" /> Saved!</> : saving ? "Saving..." : <><Save className="w-3 h-3 mr-1" /> Save Config</>}
            </Button>
          </div>

          {/* Copy Reference Panel */}
          <div className="border rounded-lg p-3 space-y-2 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Copy Reference Values</p>
            <CopyField label="Replica Entity" value={form.replica_entity_name} />
            <CopyField label="Source Entity" value={form.source_entity_name} />
            <CopyField label="Sync Function" value={form.sync_function_name} />
            <CopyField label="Push Function" value={form.push_function_name} />
            <CopyField label="Secret Name" value={form.secret_name} />
            <CopyField label="Replica App ID" value={form.replica_app_id} />
          </div>

          {/* Source Entity Schema */}
          <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source Entity Schema: {form.source_entity_name}</p>
            <div className="text-[10px] text-muted-foreground">Required fields for entity: {form.source_entity_name}</div>
            <p className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-800">
              <strong>Instruction:</strong> In this Replica app, create entity using the provided schema from Source App and name it <code className="bg-blue-100 px-1 rounded">{form.replica_entity_name}</code>
            </p>
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

          {/* Source App Code */}
          <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source App: {form.push_function_name} Function</p>
            <div className="text-[10px] text-muted-foreground">Code generated from your config: {form.project_name}</div>
            <pre className="bg-black text-green-400 p-3 rounded text-[10px] overflow-x-auto max-h-96 overflow-y-auto">
              {generateSourceCode(form.replica_entity_name, form.secret_name, form.replica_app_id)}
            </pre>
          </div>

          {/* Replica App Instructions */}
          <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Replica App Instructions</p>
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

            <div className="mt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Step 5: Live Table Updates (Frontend Subscription)</p>
              <pre className="bg-black text-blue-400 p-3 rounded text-[10px] overflow-x-auto">
                {generateSubscriptionCode(form.replica_entity_name)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}