import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const REPLICAS = [
  { key: "SampleReplica1_1", label: "Replica 1-1 - SampleReplica1_1" },
  { key: "SampleReplica1_2", label: "Replica 1-2 - SampleReplica1_2" },
];

// Stages: "form" | "review" | "select" | "done"
export default function AddSampleDialog({ open, onClose, onSuccess }) {
  const [stage, setStage] = useState("form");
  const [name, setName] = useState("");
  const [generatedRecord, setGeneratedRecord] = useState(null);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);

  const reset = () => {
    setStage("form");
    setName("");
    setGeneratedRecord(null);
    setSelected([]);
    setSaving(false);
    setPushing(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Stage 1: Generate record preview
  const handleGenerate = () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedRecord({ unique_id: uid, Name: name.trim() });
    setStage("review");
  };

  // Stage 2: Save to SSOT, then move to replica selection
  const handleAddToSSOT = async () => {
    setSaving(true);
    const created = await base44.entities.SampleSSOT1.create(generatedRecord);
    setGeneratedRecord(created);
    setSaving(false);
    setStage("select");
    toast.success("Record saved to SSOT");
  };

  // Stage 3: Push to selected replicas
  const handleConfirmSelection = async () => {
    setPushing(true);
    for (const replicaKey of selected) {
      await base44.entities[replicaKey].create({
        unique_id: generatedRecord.unique_id,
        Name: generatedRecord.Name,
      });
    }
    setPushing(false);
    if (selected.length > 0) {
      toast.success(`Pushed to ${selected.length} replica(s)`);
    } else {
      toast.success("Saved to SSOT only (no replicas selected)");
    }
    onSuccess();
    handleClose();
  };

  const toggleReplica = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage === "form" && "Add Sample Record"}
            {stage === "review" && "Review Generated Record"}
            {stage === "select" && "Select Replicas to Push To"}
          </DialogTitle>
        </DialogHeader>

        {/* Stage 1: Form */}
        {stage === "form" && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
              <Input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleGenerate}>
                <Plus className="w-4 h-4 mr-1" /> Generate Record
              </Button>
            </div>
          </div>
        )}

        {/* Stage 2: Review */}
        {stage === "review" && generatedRecord && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Review the record before saving to SSOT:</p>
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Unique ID</span>
                <p className="font-mono text-sm font-medium mt-0.5">{generatedRecord.unique_id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Name</span>
                <p className="text-sm font-medium mt-0.5">{generatedRecord.Name}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStage("form")}>Back</Button>
              <Button onClick={handleAddToSSOT} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Add to SSOT
              </Button>
            </div>
          </div>
        )}

        {/* Stage 3: Replica selection */}
        {stage === "select" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Record saved</p>
              <p className="font-mono text-sm">{generatedRecord.unique_id} — {generatedRecord.Name}</p>
            </div>
            <p className="text-sm text-muted-foreground">Select which replicas to push this record to (optional):</p>
            <div className="space-y-3">
              {REPLICAS.map((r) => (
                <label
                  key={r.key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <Checkbox
                    checked={selected.includes(r.key)}
                    onCheckedChange={() => toggleReplica(r.key)}
                  />
                  <span className="text-sm font-medium">{r.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selected.length === 0
                ? "No replicas selected — record will only exist in SSOT."
                : `Will push to ${selected.length} replica(s).`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleConfirmSelection} disabled={pushing}>
                {pushing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Confirm Selection
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}