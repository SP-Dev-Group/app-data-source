import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Archive } from "lucide-react";
import { toast } from "sonner";

export default function ArchiveSSOTRecordDialog({ open, record, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setSaving(false);
    onClose();
  };

  const handleArchive = async () => {
    setSaving(true);

    // Get current version count
    const existing = await base44.entities.SourceSSOT10Archive.filter({ source_id: record.id });
    const version = (existing?.length || 0) + 1;

    // Write archive entry
    await base44.entities.SourceSSOT10Archive.create({
      source_id: record.id,
      unique_id: record.unique_id,
      Name: record.Name,
      event_type: "archived",
      version,
    });

    // Also write to version history
    const vhExisting = await base44.entities.SourceSSOT10VersionHistory.filter({ source_id: record.id });
    const vhVersion = (vhExisting?.length || 0) + 1;
    await base44.entities.SourceSSOT10VersionHistory.create({
      source_id: record.id,
      unique_id: record.unique_id,
      Name: record.Name,
      event_type: "archived",
      version: vhVersion,
    });

    // Delete the source record
    await base44.entities.SourceSSOT10.delete(record.id);

    setSaving(false);
    toast.success(`Record "${record.Name}" archived`);
    onSuccess();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archive Record</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            This will archive the record and remove it from the active SSOT list. It will be saved to <strong>SourceSSOT10Archive</strong>.
          </p>
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Unique ID</span>
              <p className="font-mono text-sm font-medium mt-0.5">{record?.unique_id}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Name</span>
              <p className="text-sm font-medium mt-0.5">{record?.Name}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button variant="destructive" onClick={handleArchive} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Archive className="w-4 h-4 mr-1" />}
              Archive Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}