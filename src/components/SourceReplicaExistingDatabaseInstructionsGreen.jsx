import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DatabaseZap, Copy, Check, Save, Search, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  config_name: "",
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.config_name.trim()) return;
    setSaving(true);
    await base44.entities.SourceReplicaConfig.create({ ...form });
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
        ? all.filter((r) => r.config_name?.toLowerCase().includes(term))
        : all
    );
    setSearching(false);
  };

  const loadConfig = (record) => {
    setForm({
      config_name: record.config_name || "",
      replica_entity_name: record.replica_entity_name || DEFAULTS.replica_entity_name,
      source_entity_name: record.source_entity_name || DEFAULTS.source_entity_name,
      sync_function_name: record.sync_function_name || DEFAULTS.sync_function_name,
      push_function_name: record.push_function_name || DEFAULTS.push_function_name,
      secret_name: record.secret_name || DEFAULTS.secret_name,
      replica_app_id: record.replica_app_id || DEFAULTS.replica_app_id,
    });
    setShowResults(false);
    setSearchTerm("");
  };

  const fields = [
    { label: "Replica Entity", key: "replica_entity_name" },
    { label: "Source Entity", key: "source_entity_name" },
    { label: "Sync Function", key: "sync_function_name" },
    { label: "Push Function", key: "push_function_name" },
    { label: "Secret Name", key: "secret_name" },
    { label: "Replica App ID", key: "replica_app_id" },
  ];

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
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Search Saved Configs</p>
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
                      <span className="font-medium">{r.config_name}</span>
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
              <span className="text-xs text-muted-foreground w-40 shrink-0">Config Name <span className="text-red-500">*</span></span>
              <Input
                value={form.config_name}
                onChange={(e) => set("config_name", e.target.value)}
                placeholder="e.g. UserSync v1"
                className="h-7 text-xs"
              />
            </div>

            {fields.map(({ label, key }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
                <Input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="h-7 text-xs font-mono"
                />
              </div>
            ))}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !form.config_name.trim()}
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
        </DialogContent>
      </Dialog>
    </>
  );
}