import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function AllocateProjectsDialog({ open, record, onClose, onSuccess }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const initializedForId = useRef(null);

  const { data: configs, isLoading } = useQuery({
    queryKey: ["ReplicaAppConfig10"],
    queryFn: () => base44.entities.ReplicaAppConfig10.list(),
    enabled: open,
  });

  useEffect(() => {
    if (open && record && record.id !== initializedForId.current) {
      initializedForId.current = record.id;
      // Store selected as config IDs internally
      if (configs) {
        const matchedIds = configs
          .filter((c) => (record.allocated_projects || []).includes(c.project_name))
          .map((c) => c.id);
        setSelected(matchedIds);
      }
    }
    if (!open) {
      initializedForId.current = null;
    }
  }, [open, record?.id, configs]);

  const handleSave = async () => {
    setSaving(true);
    // Convert config IDs back to project names for storage
    const projectNames = (configs || [])
      .filter((c) => selected.includes(c.id))
      .map((c) => c.project_name);
    await base44.entities.SourceSSOT10.update(record.id, { allocated_projects: projectNames });

    // Push record to each checked replica
    if (projectNames.length > 0) {
      await base44.functions.invoke("pushAllocatedRecord10", { recordId: record.id });
    }

    setSaving(false);
    toast.success(`Allocations saved and pushed to ${projectNames.length} replica(s)`);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate "{record?.Name}" to Replicas</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">Select which replica projects this record should be pushed to.</p>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : configs?.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No replica configs found.</p>
        ) : (
          <div className="space-y-3 py-2">
            {configs?.map((config) => (
              <div key={config.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(config.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelected((prev) =>
                      checked ? [...prev, config.id] : prev.filter((id) => id !== config.id)
                    );
                  }}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium">{config.project_name}</p>
                  <p className="text-xs text-muted-foreground">{config.replica_entity_name} @ {config.replica_app_id}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || isLoading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save Allocations
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}