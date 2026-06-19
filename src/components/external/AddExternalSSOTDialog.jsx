import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Stages: "form" | "review" | "done"
export default function AddExternalSSOTDialog({ open, onClose, onSuccess }) {
  const [stage, setStage] = useState("form");
  const [name, setName] = useState("");
  const [generatedRecord, setGeneratedRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setStage("form");
    setName("");
    setGeneratedRecord(null);
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedRecord({ unique_id: uid, Name: name.trim() });
    setStage("review");
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.SourceSSOT1.create(generatedRecord);
    setSaving(false);
    toast.success("Record saved to SourceSSOT-1");
    onSuccess();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage === "form" ? "Add Record to SourceSSOT-1" : "Review Record"}
          </DialogTitle>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A Unique ID will be auto-generated for this record.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleGenerate}>
                <Plus className="w-4 h-4 mr-1" /> Generate Record
              </Button>
            </div>
          </div>
        )}

        {stage === "review" && generatedRecord && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Review before saving:</p>
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Unique ID (auto-generated)</span>
                <p className="font-mono text-sm font-medium mt-0.5">{generatedRecord.unique_id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Name</span>
                <p className="text-sm font-medium mt-0.5">{generatedRecord.Name}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStage("form")}>Back</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Save to SSOT
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}