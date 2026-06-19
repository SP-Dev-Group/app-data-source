import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditSSOTRecordDialog({ open, record, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) setName(record.Name || "");
  }, [record]);

  const handleClose = () => {
    setName("");
    setSaving(false);
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    setSaving(true);

    // Get current version count for this record
    const existing = await base44.entities.SourceSSOT10VersionHistory.filter({ source_id: record.id });
    const version = (existing?.length || 0) + 1;

    // Save version history entry BEFORE updating
    await base44.entities.SourceSSOT10VersionHistory.create({
      source_id: record.id,
      unique_id: record.unique_id,
      Name: record.Name,
      event_type: version === 1 ? "created" : "updated",
      version,
    });

    // Update the source record
    await base44.entities.SourceSSOT10.update(record.id, { Name: name.trim() });

    // Push to all replica configs
    const configs = await base44.entities.ReplicaAppConfig10.list();
    await Promise.all(configs.map((config) =>
      base44.functions.invoke("pushToReplica10", { configId: config.id }).catch(() => {})
    ));

    setSaving(false);
    toast.success("Record updated and pushed to all replicas");
    onSuccess();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Unique ID</label>
            <p className="font-mono text-sm text-muted-foreground bg-muted rounded px-3 py-2">{record?.unique_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}