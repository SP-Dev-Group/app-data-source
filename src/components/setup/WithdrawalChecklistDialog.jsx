import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function WithdrawalChecklistDialog({ open, onClose, onConfirm, template }) {
  const [checklist, setChecklist] = useState({});
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1); // 1 = checklist, 2 = confirm

  if (!template) return null;

  const p = template.project_name?.replace(/\s+/g, '') || '';
  const src = template.source_entity_name || '';

  const sourceItems = [
    { key: "del_source_entity", label: `DELETE entity: ${src}`, group: "Source Entities" },
    { key: "keep_source_entity", label: `KEEP entity: ${src} (keep data)`, group: "Source Entities" },
    { key: "del_archive_entity", label: `DELETE entity: ${src}Archive`, group: "Source Entities" },
    { key: "del_version_entity", label: `DELETE entity: ${src}VersionHistory`, group: "Source Entities" },
    { key: "del_config_entity", label: `DELETE entity: ReplicaAppConfig${p}`, group: "Source Entities" },
    { key: "del_push_fn", label: `DELETE function: pushToReplica${p}`, group: "Source Functions" },
    { key: "del_delete_fn", label: `DELETE function: deleteFromReplicas${p}`, group: "Source Functions" },
    { key: "del_allocate_fn", label: `DELETE function: pushAllocatedRecord${p}`, group: "Source Functions" },
    { key: "del_reinstate_fn", label: `DELETE function: reinstateFromArchive${p}`, group: "Source Functions" },
    { key: "del_source_page", label: `DELETE/remove source page: ${template.source_page_file_name || 'source page'}`, group: "Source Page" },
  ];

  const replicaItems = (template.replica_configs || []).flatMap((r, i) => [
    { key: `del_replica_entity_${i}`, label: `DELETE replica entity: ${r.replica_entity_name || `Replica${i+1}`} (in replica app)`, group: `Replica ${i+1}: ${r.replica_entity_name || ''}` },
    { key: `keep_replica_entity_${i}`, label: `KEEP replica entity: ${r.replica_entity_name || `Replica${i+1}`} (keep data in replica)`, group: `Replica ${i+1}: ${r.replica_entity_name || ''}` },
    { key: `del_secret_${i}`, label: `REMOVE secret: ${r.secret_name || 'secret'} from source app env`, group: `Replica ${i+1}: ${r.replica_entity_name || ''}` },
    { key: `del_replica_page_${i}`, label: `DELETE/remove replica page in replica app`, group: `Replica ${i+1}: ${r.replica_entity_name || ''}` },
  ]);

  const allItems = [...sourceItems, ...replicaItems];
  const groups = [...new Set(allItems.map(i => i.group))];
  const totalChecked = Object.values(checklist).filter(Boolean).length;

  const toggle = (key) => setChecklist(p => ({ ...p, [key]: !p[key] }));

  const handleConfirm = () => {
    const checkedLabels = allItems.filter(i => checklist[i.key]).map(i => i.label);
    onConfirm({ checkedActions: checkedLabels, notes });
    setChecklist({});
    setNotes("");
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setStep(1); setChecklist({}); setNotes(""); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" /> Withdraw Project: {template.project_name}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Review and tick each item you have actioned. This is a manual checklist — you action these directly in your apps. Ticked items will be recorded in the withdrawal notes.
            </p>
            <div className="space-y-5">
              {groups.map(group => (
                <div key={group}>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">{group}</p>
                  <div className="space-y-2 pl-2">
                    {allItems.filter(i => i.group === group).map(item => (
                      <div key={item.key} className="flex items-start gap-2">
                        <Checkbox
                          id={item.key}
                          checked={!!checklist[item.key]}
                          onCheckedChange={() => toggle(item.key)}
                          className="mt-0.5"
                        />
                        <Label htmlFor={item.key} className="text-sm leading-snug cursor-pointer">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <Label className="text-xs">Additional notes (optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. kept archive data for audit purposes..." className="h-20 text-sm" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{totalChecked} of {allItems.length} items ticked</div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">You are about to archive and withdraw <strong>{template.project_name}</strong>.</p>
            <p className="text-sm text-muted-foreground">This will archive the template and mark it as withdrawn. The checklist you completed ({totalChecked} items ticked) will be saved in the withdrawal record.</p>
            <Badge variant="destructive">This action cannot be undone from this UI</Badge>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => { if (step === 2) setStep(1); else { onClose(); setChecklist({}); setNotes(""); setStep(1); } }}>
            {step === 2 ? "Back" : "Cancel"}
          </Button>
          {step === 1 && (
            <Button variant="destructive" onClick={() => setStep(2)}>
              Continue to Confirm
            </Button>
          )}
          {step === 2 && (
            <Button variant="destructive" onClick={handleConfirm}>
              Confirm Withdrawal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}