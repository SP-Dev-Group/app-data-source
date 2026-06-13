import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { DatabaseZap, Copy, Check, Save, Search, X, Pencil, ClipboardCopy } from "lucide-react";

function CopyableCode({ children }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <pre className="bg-black text-red-400 p-3 rounded text-[10px] overflow-x-auto max-h-96 overflow-y-auto pr-10">{children}</pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-red-400 hover:text-white transition-colors opacity-60 group-hover:opacity-100"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
import { base44 } from "@/api/base44Client";

const getTodayAUS = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const DEFAULTS = {
  project_name: "",
  replica_entity_name: "",
  source_entity_name: "",
  sync_function_name: "",
  push_function_name: "",
  secret_name: "",
  replica_app_id: "",
  database_root_name: "",
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
        {copied ? <Check className="w-3.5 h-3.5 text-red-500" /> : <Copy className="w-3.5 h-3.5" />}
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
          {copied ? <Check className="w-3.5 h-3.5 text-red-500" /> : <Copy className="w-3.5 h-3.5" />}
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

export default function SourceReplicaExistingDatabaseInstructionsRed() {
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
  const [ssotSchema, setSsotSchema] = useState("");
  const [savingSchema, setSavingSchema] = useState(false);
  const [schemaSaved, setSchemaSaved] = useState(false);

  const set = (field, value) => {
    if (field === "database_root_name") {
      const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
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
      const newSyncFunction = "sync" + value + "ToSourceListenerFor" + form.project_name + "-" + getTodayAUS();
      setForm((f) => ({
        ...f,
        [field]: value,
        sync_function_name: newSyncFunction
      }));
    } else if (field === "replica_entity_name") {
      setForm((f) => ({
        ...f,
        [field]: value,
        push_function_name: "pushto" + value
      }));
    } else if (field === "project_name") {
      setForm((f) => {
        const srcEntity = f.source_entity_name;
        const newSyncFunction = srcEntity
          ? "sync" + srcEntity + "ToSourceListenerFor" + value + "-" + getTodayAUS()
          : f.sync_function_name;
        return { ...f, [field]: value, sync_function_name: newSyncFunction };
      });
    } else {
      setForm((f) => ({ ...f, [field]: value }));
    }
  };

  const handleAdd = () => {
    setForm({
      project_name: "",
      replica_entity_name: "",
      source_entity_name: "",
      sync_function_name: "",
      push_function_name: "",
      secret_name: "",
      replica_app_id: "",
      database_root_name: "",
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
      ssot_schema: ssotSchema.trim(),
    };
    if (loadedRecordId) {
      await base44.entities.SourceReplicaConfig.update(loadedRecordId, payload);
    } else {
      await base44.entities.SourceReplicaConfig.create(payload);
    }
    setSaving(false);
    setSaved(true);
    setSchemaSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSchemaSaved(false);
    }, 2000);
  };

  const handleSearch = async () => {
    setSearching(true);
    setShowResults(true);
    const all = await base44.entities.SourceReplicaConfig.list();
    const term = searchTerm.toLowerCase();
    setSearchResults(
      term
        ? all.filter((r) => r.project_name?.toLowerCase().includes(term))
        : all
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
    setSsotSchema(record.ssot_schema || "");
    setLoadedRecordId(record.id);
    setShowResults(false);
    setSearchTerm("");
    setEditingField(null);
    setSchemaSaved(false);
  };

  const fields = [
    { label: "Allocate a Root Name", key: "database_root_name" },
    { label: "Source Entity", key: "source_entity_name" },
    { label: "Replica Entity", key: "replica_entity_name" },
    { label: "Sync Function", key: "sync_function_name" },
    { label: "Push Function", key: "push_function_name", editable: false },
    { label: "Replica Secret Name", key: "secret_name", editable: false },
    { label: "Replica App ID", key: "replica_app_id" },
  ];

  const generateSourceCode = (functionName, entityName, secretName, appId) => {
    return `// Function Name: ${functionName}
// Schema-agnostic: all source fields are pushed automatically — no changes needed when new fields are added

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

    // Strip Base44 internal fields — all remaining fields synced automatically (schema drift safe)
    const { id, created_date, updated_date, created_by_id, ...fields } = record;

    const replicaClient = createClient({ 
      appId: ${secretName}, 
      serviceRole: true 
    });

    const existing = await replicaClient.entities.${entityName}.filter({ 
      unique_id: record.unique_id || record.id 
    });

    if (existing && existing.length > 0) {
      await replicaClient.entities.${entityName}.update(existing[0].id, { ...fields });
    } else {
      await replicaClient.entities.${entityName}.create({ ...fields });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;
  };

  const generateReplicaCode = (entityName) => {
    return `// Schema-agnostic: all incoming fields are synced automatically — no changes needed when new fields are added
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const record = payload.data || payload;

    // Strip Base44 internal fields — all remaining fields synced automatically (schema drift safe)
    const { id, created_date, updated_date, created_by_id, ...fields } = record;

    const existing = await base44.entities.${entityName}.filter({ 
      unique_id: record.unique_id 
    });

    if (existing && existing.length > 0) {
      await base44.entities.${entityName}.update(existing[0].id, { ...fields });
    } else {
      await base44.entities.${entityName}.create({ ...fields });
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
        className="flex items-center gap-2 text-xs h-8 justify-start text-red-600 hover:text-red-700"
      >
        <DatabaseZap className="h-3 w-3" />
        Master: Source - Replica [EXP]
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">Master: Source - Replica [EXPERIMENTAL]</DialogTitle>
          </DialogHeader>

          {/* Search / Recall */}
          <div className="border border-red-200 rounded-lg p-3 bg-red-50/50 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Search Saved Configs</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded">Step 1: Create New</span>
                <Button size="sm" variant="outline" onClick={handleAdd} className="h-7 text-xs px-2 border-red-300 text-red-700 hover:bg-red-50">
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
              <Button size="sm" variant="outline" onClick={handleSearch} disabled={searching} className="h-7 text-xs px-3 border-red-300 text-red-700 hover:bg-red-50">
                <Search className="w-3 h-3 mr-1" /> Search
              </Button>
            </div>
            <p className="text-[10px] text-red-500">All saved configs shown. Search to filter.</p>
            {showResults && (
              <div className="border border-red-200 rounded bg-background text-xs max-h-40 overflow-y-auto">
                {searching ? (
                  <p className="p-2 text-muted-foreground">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="p-2 text-muted-foreground">No results found.</p>
                ) : (
                  searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between px-3 py-1.5 hover:bg-red-50 cursor-pointer border-b last:border-0"
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
          <div className="border border-red-200 rounded-lg p-3 space-y-3">
            <div className="mb-2">
              <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded">Step 2: Fill in Form</span>
            </div>

            {/* Source Popup Dialog */}
            <Dialog open={sourcePopupOpen} onOpenChange={setSourcePopupOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-red-600">SOURCE [EXP]</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 bg-red-50 border-red-200 flex items-center justify-between">
                    <p className="text-xs text-red-800 font-medium">Click and Copy this message and paste to the chat message Base44 in the Source App</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const sourceContent = `For this current page, use the following code to set up this app and page to receive data from a source app.

SOURCE
=====
Source App Instructions

IMPORTANT: DO NOT CREATE ${form.replica_entity_name} the replica entity in this app as it is intended for the external receiving app.

Step 1: Create backend function ${form.sync_function_name}
Step 2: No automation needed on replica side
Step 3: In this, the source app, set up ${form.push_function_name} function and entity automation
Step 4: Add frontend subscription to table page
🔑🔑 REPLICA APP ID: ${form.replica_app_id}

Step 1: Backend Function (${form.sync_function_name})

${generateReplicaCode(form.replica_entity_name)}

SOURCE APP FUNCTION: ${form.push_function_name}

${generateSourceCode(form.push_function_name, form.replica_entity_name, form.secret_name, form.replica_app_id)}`;
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
                  <div className="border rounded-lg p-3 space-y-3">
                    <p className="text-xs font-bold text-red-600 tracking-wide mb-2">SOURCE</p>
                    <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-2">Instructions for the SOURCE APP, this app.</p>
                    <div className="text-xs space-y-2 text-muted-foreground">
                      <p><strong>Overview:</strong> There are two apps, a source app and a replica app. This app is the source app and contains one entity specifically as a SSOT - single source of truth entity. The SSOT source app entity will be listened to and on change will trigger the push to the external base44 app, referred to as the replica app. You will use the two function code blocks to create a new unique listening function and a new unique push to style function.</p>
                      <p className="text-[10px] text-muted-foreground">The following instructions are specifically for this app, referred to as the source app. These instructions are not meant for the external base44 app, referred to as the replica app.</p>
                    </div>
                    <div className="text-xs space-y-2 text-red-700 bg-red-50 border border-red-200 rounded p-2">
                      <p><strong>Instruction 1:</strong> Follow the steps exactly as instructed, don't assume or change anything.</p>
                      <p><strong>Instruction 2:</strong> There is to be no automation in the external app.</p>
                      <p><strong>Instruction 3:</strong> Do not create the replica entity <code className="bg-red-100 px-1 rounded">{form.replica_entity_name}</code> in this app, as this is the source app. The replica entity will be created in the external app using other code, not available here.</p>
                      <p><strong>Instruction 4:</strong> Use / reference only the source entity <code className="bg-red-100 px-1 rounded">{form.source_entity_name}</code> and the replica entity <code className="bg-red-100 px-1 rounded">{form.replica_entity_name}</code> named in the code, therefore, do not use another entity from within this app or the external app.</p>
                      <p><strong>Instruction 5:</strong> Use only the Replica Secret Name <code className="bg-red-100 px-1 rounded">{form.secret_name}</code> and Replica App ID <code className="bg-red-100 px-1 rounded">{form.replica_app_id}</code>, as provided in these notes and code blocks.</p>
                    </div>
                    <div className="text-xs space-y-2 text-muted-foreground border-t pt-2 mt-2">
                      <p className="font-semibold text-red-700">2 STEPS for the SOURCE APP, this app.</p>
                      <p><strong>Step 1:</strong> Create a new backend function and call it <code className="bg-black text-red-400 px-1 rounded">{form.sync_function_name}</code>. (Do not use existing backend functions in this app under any circumstance, do not use this code to overwrite any other function already existing in this app).</p>
                      <p><strong>Step 2:</strong> Create the other function: For the push function, use the push function name provided which is <code className="bg-black text-red-400 px-1 rounded">{form.push_function_name}</code>. Do not use any other push function or function that may already exist in this app. Do not use this push function code to overwrite any other function or code already in this app.</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Step 1: Backend Function ({form.sync_function_name})</p>
                      <CopyableCode>{generateReplicaCode(form.replica_entity_name)}</CopyableCode>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3 space-y-3">
                    <p className="text-xs font-bold text-red-600 tracking-wide mb-2">SOURCE</p>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">SOURCE APP FUNCTION: {form.push_function_name}</p>
                    <CopyableCode>{generateSourceCode(form.push_function_name, form.replica_entity_name, form.secret_name, form.replica_app_id)}</CopyableCode>
                  </div>

                </div>
              </DialogContent>
            </Dialog>

            {/* Replica Popup Dialog */}
            <Dialog open={replicaPopupOpen} onOpenChange={setReplicaPopupOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-red-600">REPLICA [EXP]</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 bg-red-50 border-red-200 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">REPLICA APP INSTRUCTIONS</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const replicaContent = `"Use the following to create entity and page code to host the table displaying the entity".

REPLICA
Source Entity Schema: ${form.source_entity_name}

Instruction: In this Replica app, create entity using the provided schema from Source App and name it ${form.replica_entity_name}

${ssotSchema.trim() || '(No schema pasted yet — go back and paste in Step INSERT)'}

REPLICA
REPLICA APP INSTRUCTION: Live Table Updates (Frontend Subscription)

Instruction: For any page which uses this entity (${form.replica_entity_name}), add this frontend subscription code.

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
                    <p className="text-xs text-red-700">"Use the following to create entity and page code to host the table displaying the entity".</p>
                  </div>

                  <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <p className="text-xs font-bold text-red-600 tracking-wide mb-2">REPLICA</p>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">Source Entity Schema: {form.source_entity_name}</p>
                    <div className="text-xs bg-red-50 border border-red-200 rounded p-2 text-red-800 leading-relaxed">
                      <strong>Instruction:</strong> In this Replica app, create entity using the provided schema from Source App and name it{' '}
                      <span className="bg-red-100 px-1 rounded break-words font-mono text-[10px] w-full inline-block">{form.replica_entity_name}</span>
                    </div>
                    <CopyableCode>{ssotSchema.trim() || '(No schema pasted yet — go back and paste in Step INSERT)'}</CopyableCode>
                  </div>

                  <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <p className="text-xs font-bold text-red-600 tracking-wide mb-2">REPLICA</p>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">REPLICA APP INSTRUCTION: Live Table Updates (Frontend Subscription)</p>
                    <p className="text-xs bg-red-50 border border-red-200 rounded p-2 text-red-800">
                      <strong>Instruction:</strong> For any page which uses this entity (<code className="bg-red-100 px-1 rounded">{form.replica_entity_name}</code>), add this frontend subscription code.
                    </p>
                    <CopyableCode>{generateSubscriptionCode(form.replica_entity_name)}</CopyableCode>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Config Fields</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-muted-foreground italic">provide a unique name that describes i.e "WorkersNotes4"</p>
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
            </div>

            {fields.slice(0, 5).map(({ label, key, editable }) => (
              <div key={key} className="flex flex-col gap-1">
                {key === "replica_entity_name" && (
                  <p className="text-[10px] text-muted-foreground italic">Create Name or use default name as shown</p>
                )}
                {key === "database_root_name" && (
                  <p className="text-[10px] text-muted-foreground italic">allocate a root name / theme name to run throughout</p>
                )}
                {key === "source_entity_name" && (
                  <p className="text-[10px] text-muted-foreground italic">use an existing database entity name, or create a new one if starting from scratch</p>
                )}
              <div className="flex items-center gap-2">
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
              </div>
            ))}

            <div className="mb-2">
              <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded">Step 3: Complete these with Replica App</span>
            </div>

            <div className="border rounded-lg p-3 bg-red-50 border-red-200 space-y-3 mt-3">
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Replica App Configuration</p>
              <ol className="text-[10px] text-red-700 space-y-1 ml-4 list-decimal">
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
              className="w-full h-7 text-xs mt-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {saved ? <><Check className="w-3 h-3 mr-1" /> Saved!</> : saving ? "Saving..." : <><Save className="w-3 h-3 mr-1" /> Save Config</>}
            </Button>

            {/* Step INSERT: SSOT Entity Schema */}
            <div className="border rounded-lg p-3 bg-yellow-50 border-yellow-300 space-y-2 mt-1">
              <div className="mb-1">
                <span className="text-xs font-bold text-white bg-yellow-500 px-3 py-1 rounded">Step INSERT: Paste SSOT Entity Schema</span>
              </div>
              <p className="text-[10px] text-yellow-800">In the Source App, go to the entity (three dots menu → Copy Schema / View Schema) and paste the full JSON schema here.</p>
              <textarea
                value={ssotSchema}
                onChange={(e) => setSsotSchema(e.target.value)}
                placeholder={`Paste entity schema JSON here, e.g.\n{\n  "name": "MyEntity",\n  "properties": {\n    "unique_id": { "type": "string" },\n    ...\n  }\n}`}
                className="w-full h-32 text-[10px] font-mono border border-yellow-300 rounded p-2 bg-white resize-y focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
              {ssotSchema.trim() && schemaSaved && (
                <p className="text-[10px] text-green-700 font-medium">✓ Schema saved to config</p>
              )}
              {ssotSchema.trim() && !schemaSaved && (
                <p className="text-[10px] text-yellow-700 font-medium">⚠ Schema entered but not saved yet — click Save Config</p>
              )}
            </div>

            <div className="mb-2">
              <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded">Step 4</span>
            </div>

            {/* Popup Buttons Box */}
            <div className="border border-red-200 rounded-lg p-3 bg-red-50/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">View and Copy Instructions</p>
              </div>

              <div className="mb-3 text-[10px] text-muted-foreground space-y-1">
                <p className="font-semibold text-red-800 mb-1">VIEW AND COPY REPLICA INSTRUCTIONS</p>
                <p><strong>Step 1:</strong> Click and open <button onClick={(e) => { e.stopPropagation(); setReplicaPopupOpen(true); }} className="text-xs font-bold text-white uppercase tracking-wide px-2 py-0.5 rounded bg-red-600 border border-red-600 hover:bg-red-700 transition-colors cursor-pointer">REPLICA</button></p>
                <p><strong>Step 2:</strong> Click copy the body</p>
                <p><strong>Step 3:</strong> Open the Replica App on the page which will display the table</p>
                <p><strong>Step 4:</strong> Paste into the chat message for the Base44 AI to do the build</p>
              </div>

              <div className="mb-3 text-[10px] text-muted-foreground space-y-1 border-t pt-3">
                <p className="font-semibold text-red-800 mb-1">VIEW AND COPY SOURCE INSTRUCTIONS</p>
                <p><strong>Step 1:</strong> Click and open <button onClick={(e) => { e.stopPropagation(); setSourcePopupOpen(true); }} className="text-xs font-bold text-white uppercase tracking-wide px-2 py-0.5 rounded bg-red-500 border border-red-500 hover:bg-red-600 transition-colors cursor-pointer">SOURCE</button></p>
                <p><strong>Step 2:</strong> Click copy the body</p>
                <p><strong>Step 3:</strong> In this Source App open the page which will host the data table</p>
                <p><strong>Step 4:</strong> Paste into the Base44 chat message for the AI to do the build</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSourcePopupOpen(true)}
                  className="flex-1 text-sm font-bold text-white uppercase tracking-wide px-3 py-2 rounded bg-red-500 border border-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  SOURCE
                </button>
                <button
                  onClick={() => setReplicaPopupOpen(true)}
                  className="flex-1 text-sm font-bold text-white uppercase tracking-wide px-3 py-2 rounded bg-red-700 border border-red-700 hover:bg-red-800 transition-colors cursor-pointer"
                >
                  REPLICA
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-red-50 border-red-200">
              <div className="mb-2">
                <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded">Step 5: Test the Source and Replica function</span>
              </div>
              <p className="text-[10px] text-red-700">After setting up both apps, test the synchronization by creating or updating records in the Source app and verifying they appear in the Replica app.</p>
            </div>
          </div>

          {/* Copy Reference Panel */}
          <div className="border border-red-200 rounded-lg p-3 space-y-2 bg-red-50/20">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Copy Reference Values</p>
            <CopyField label="Allocate a Root Name" value={form.database_root_name} />
            <CopyField label="Replica Entity" value={form.replica_entity_name} />
            <CopyField label="Source Entity" value={form.source_entity_name} />
            <CopyField label="Sync Function" value={form.sync_function_name} />
            <CopyField label="Push Function" value={form.push_function_name} />
            <CopyField label="Secret Name" value={form.secret_name} />
            <CopyField label="Replica App ID" value={form.replica_app_id} />
          </div>

          {/* REPLICA Section */}
          <div className="space-y-3 mt-4">
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-red-600 tracking-wide mb-2">REPLICA</p>
              <p className="text-xs font-semibold text-muted-foreground tracking-wide">Source Entity Schema: {form.source_entity_name}</p>
              <div className="text-xs bg-red-50 border border-red-200 rounded p-2 text-red-800 leading-relaxed">
                <strong>Instruction:</strong> In this Replica app, create entity using the provided schema from Source App and name it{' '}
                <span className="bg-red-100 px-1 rounded break-words font-mono text-[10px] w-full inline-block">{form.replica_entity_name}</span>
              </div>
              <CopyableCode>{ssotSchema.trim() || '(No schema pasted yet — go back and paste in Step INSERT)'}</CopyableCode>
            </div>

            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-red-600 tracking-wide mb-2">REPLICA</p>
              <p className="text-xs font-semibold text-muted-foreground mb-2">REPLICA APP INSTRUCTION: Live Table Updates (Frontend Subscription)</p>
              <p className="text-xs bg-red-50 border border-red-200 rounded p-2 text-red-800">
                <strong>Instruction:</strong> For any page which uses this entity (<code className="bg-red-100 px-1 rounded">{form.replica_entity_name}</code>), add this frontend subscription code.
              </p>
              <CopyableCode>{generateSubscriptionCode(form.replica_entity_name)}</CopyableCode>
            </div>
          </div>

          {/* SOURCE Section */}
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-red-600 tracking-wide mb-2">SOURCE</p>
              <p className="text-xs font-semibold text-muted-foreground tracking-wide">SOURCE APP FUNCTION: {form.push_function_name}</p>
              <div className="text-[10px] text-muted-foreground">Code generated from your config: {form.project_name}</div>
              <CopyableCode>{generateSourceCode(form.push_function_name, form.replica_entity_name, form.secret_name, form.replica_app_id)}</CopyableCode>
            </div>

            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <p className="text-xs font-bold text-red-600 tracking-wide mb-2">SOURCE</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source App Instructions</p>
              <div className="text-xs space-y-2">
                <p><strong>Step 1:</strong> Create backend function <code className="bg-black text-red-400 px-1 rounded">{form.sync_function_name}</code></p>
                <p><strong>Step 2:</strong> Create entity <code className="bg-black text-red-400 px-1 rounded">{form.replica_entity_name}</code> in the Replica app</p>
                <p><strong>Step 3:</strong> No automation needed on replica side</p>
                <p><strong>Step 4:</strong> In source app, set up {form.push_function_name} function and entity automation</p>
                <p><strong>Step 5:</strong> Add frontend subscription to table page</p>
                <p className="text-red-500 font-semibold">🔑🔑 REPLICA APP ID: {form.replica_app_id}</p>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Step 1: Backend Function ({form.sync_function_name})</p>
                <CopyableCode>{generateReplicaCode(form.replica_entity_name)}</CopyableCode>
              </div>


            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}