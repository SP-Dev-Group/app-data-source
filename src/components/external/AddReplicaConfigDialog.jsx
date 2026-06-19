import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  project_name: "",
  replica_app_id: "",
  replica_entity_name: "",
  source_entity_name: "",
  secret_name: "",
  secret_value: "",
  notes: "",
};

const Field = ({ label, value, onChange, placeholder, required }) => (
  <div>
    <label className="text-sm font-medium mb-1 block">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const ReviewRow = ({ label, value }) => (
  <div>
    <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
    <p className="text-sm font-medium mt-0.5 font-mono break-all">{value || "—"}</p>
  </div>
);

export default function AddReplicaConfigDialog({ open, onClose, onSuccess }) {
  const [stage, setStage] = useState("form");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const reset = () => {
    setStage("form");
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleNext = () => {
    if (!form.project_name.trim() || !form.replica_app_id.trim() || !form.replica_entity_name.trim() || !form.source_entity_name.trim() || !form.secret_name.trim() || !form.secret_value.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStage("review");
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.ReplicaAppConfig10.create({
      project_name: form.project_name.trim(),
      replica_app_id: form.replica_app_id.trim(),
      replica_entity_name: form.replica_entity_name.trim(),
      source_entity_name: form.source_entity_name.trim(),
      secret_name: form.secret_name.trim(),
      secret_value: form.secret_value.trim(),
      notes: form.notes.trim(),
    });
    setSaving(false);
    toast.success("Replica config saved");
    onSuccess();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {stage === "form" ? "Add Replica App Config" : "Review Config"}
          </DialogTitle>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-3 pt-2">
            <Field label="Project Name" value={form.project_name} onChange={set("project_name")} placeholder="e.g. NewsBookSite Staff" required />
            <Field label="Replica App ID" value={form.replica_app_id} onChange={set("replica_app_id")} placeholder="Base44 App ID of the replica app" required />
            <Field label="Replica Entity Name" value={form.replica_entity_name} onChange={set("replica_entity_name")} placeholder="e.g. ReplicaStaffforNewsBookSite" required />
            <Field label="Source Entity Name" value={form.source_entity_name} onChange={set("source_entity_name")} placeholder="e.g. SourceSSOT10" required />
            <Field label="Secret Name" value={form.secret_name} onChange={set("secret_name")} placeholder="e.g. DEST_APP_SERVICE_ROLE_KEY" required />
            <Field label="Secret Value" value={form.secret_value} onChange={set("secret_value")} placeholder="Service role key for the replica app" required />
            <Field label="Notes (optional)" value={form.notes} onChange={set("notes")} placeholder="Any notes about this config" />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleNext}>
                <Plus className="w-4 h-4 mr-1" /> Review
              </Button>
            </div>
          </div>
        )}

        {stage === "review" && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Review before saving:</p>
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <ReviewRow label="Project Name" value={form.project_name} />
              <ReviewRow label="Replica App ID" value={form.replica_app_id} />
              <ReviewRow label="Replica Entity Name" value={form.replica_entity_name} />
              <ReviewRow label="Source Entity Name" value={form.source_entity_name} />
              <ReviewRow label="Secret Name" value={form.secret_name} />
              <ReviewRow label="Secret Value" value={"••••••••"} />
              {form.notes && <ReviewRow label="Notes" value={form.notes} />}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStage("form")}>Back</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Save Config
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}