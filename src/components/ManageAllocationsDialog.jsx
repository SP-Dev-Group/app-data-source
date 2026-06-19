import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const REPLICAS = [
  { key: "SampleReplica1_1", label: "Replica 1-1 — SampleReplica1_1" },
  { key: "SampleReplica1_2", label: "Replica 1-2 — SampleReplica1_2" },
];

export default function ManageAllocationsDialog({ open, onClose, record, onSuccess }) {
  const [selected, setSelected] = useState([]);
  const [existing, setExisting] = useState({}); // { replicaKey: entityId | null }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // On open, check which replicas already have this record
  useEffect(() => {
    if (!open || !record) return;

    const checkReplicas = async () => {
      setLoading(true);
      const results = {};
      for (const r of REPLICAS) {
        const matches = await base44.entities[r.key].filter({ unique_id: record.unique_id });
        results[r.key] = matches.length > 0 ? matches[0].id : null;
      }
      setExisting(results);
      // Pre-tick whichever replicas already have the record
      setSelected(REPLICAS.filter((r) => results[r.key] !== null).map((r) => r.key));
      setLoading(false);
    };

    checkReplicas();
  }, [open, record]);

  const toggleReplica = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleConfirm = async () => {
    setSaving(true);
    for (const r of REPLICAS) {
      const isSelected = selected.includes(r.key);
      const existingId = existing[r.key];

      if (isSelected && !existingId) {
        // Add to replica
        await base44.entities[r.key].create({
          unique_id: record.unique_id,
          Name: record.Name,
        });
      } else if (!isSelected && existingId) {
        // Remove from replica
        await base44.entities[r.key].delete(existingId);
      }
      // If already there and still selected, or not there and not selected — do nothing
    }
    setSaving(false);
    toast.success("Allocations updated");
    onSuccess();
    onClose();
  };

  const hasChanges = () => {
    for (const r of REPLICAS) {
      const wasSelected = existing[r.key] !== null && existing[r.key] !== undefined;
      const isSelected = selected.includes(r.key);
      if (wasSelected !== isSelected) return true;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Replica Allocations</DialogTitle>
        </DialogHeader>

        {record && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">SSOT Record</p>
            <p className="font-mono text-sm font-medium">{record.unique_id}</p>
            <p className="text-sm text-foreground">{record.Name}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which replicas this record should exist in. Untick to remove, tick to add.
            </p>
            <div className="space-y-3">
              {REPLICAS.map((r) => {
                const alreadyExists = existing[r.key] !== null && existing[r.key] !== undefined;
                const isSelected = selected.includes(r.key);
                const changed = alreadyExists !== isSelected;
                return (
                  <label
                    key={r.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      changed
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleReplica(r.key)}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{r.label}</span>
                      {alreadyExists && !isSelected && (
                        <span className="ml-2 text-xs text-destructive">(will be removed)</span>
                      )}
                      {!alreadyExists && isSelected && (
                        <span className="ml-2 text-xs text-primary">(will be added)</span>
                      )}
                      {alreadyExists && isSelected && (
                        <span className="ml-2 text-xs text-muted-foreground">(already here)</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {selected.length === 0
                ? "None selected — record will only exist in SSOT."
                : `Record will exist in ${selected.length} replica(s).`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleConfirm} disabled={saving || !hasChanges()}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Confirm
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}