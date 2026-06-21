import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Pencil, Archive, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import WithdrawalChecklistDialog from "@/components/setup/WithdrawalChecklistDialog";

export default function TemplatesPanel({ onView, onEdit }) {
  const queryClient = useQueryClient();
  const [minimised, setMinimised] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ["SourceReplicaTemplateMakeReady"],
    queryFn: () => base44.entities.SourceReplicaTemplateMakeReady.list(),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["SourceReplicaTemplateStatus"],
    queryFn: () => base44.entities.SourceReplicaTemplateStatus.list(),
  });

  const getStatus = (tplId) => statuses.find(s => s.template_id === tplId);

  const handleConfirmInUse = async (tpl) => {
    setConfirmingId(tpl.id);
    try {
      const existing = statuses.find(s => s.template_id === tpl.id);
      const now = new Date().toISOString();
      const me = await base44.auth.me();
      if (existing) {
        await base44.entities.SourceReplicaTemplateStatus.update(existing.id, {
          confirmed_in_use: true,
          confirmed_by: me?.full_name || me?.email || "unknown",
          confirmed_at: now,
        });
      } else {
        await base44.entities.SourceReplicaTemplateStatus.create({
          template_id: tpl.id,
          project_name: tpl.project_name,
          confirmed_in_use: true,
          confirmed_by: me?.full_name || me?.email || "unknown",
          confirmed_at: now,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["SourceReplicaTemplateStatus"] });
      toast.success("Marked as confirmed in use!");
    } catch (err) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleWithdraw = async ({ checkedActions, notes }) => {
    const tpl = withdrawDialog;
    setWithdrawDialog(null);
    try {
      const history = await base44.entities.SourceReplicaTemplateVersionHistory.filter({ template_id: tpl.id });
      const version = history.length + 1;

      await base44.entities.SourceReplicaTemplateArchive.create({
        template_id: tpl.id,
        project_name: tpl.project_name,
        version,
        snapshot: JSON.stringify(tpl),
      });

      await base44.entities.SourceReplicaTemplateVersionHistory.create({
        template_id: tpl.id,
        project_name: tpl.project_name,
        event_type: "archived",
        version,
        snapshot: JSON.stringify(tpl),
      });

      const existing = statuses.find(s => s.template_id === tpl.id);
      const withdrawalNote = `Withdrawal checklist (${checkedActions.length} items): ${checkedActions.join('; ')}${notes ? ` | Notes: ${notes}` : ''}`;
      if (existing) {
        await base44.entities.SourceReplicaTemplateStatus.update(existing.id, {
          withdrawn: true,
          withdrawn_at: new Date().toISOString(),
          withdrawal_notes: withdrawalNote,
        });
      } else {
        await base44.entities.SourceReplicaTemplateStatus.create({
          template_id: tpl.id,
          project_name: tpl.project_name,
          withdrawn: true,
          withdrawn_at: new Date().toISOString(),
          withdrawal_notes: withdrawalNote,
        });
      }

      // Mark SSOTmasterRECORDS as withdrawn
      const masterRecords = await base44.entities.SSOTmasterRECORDS.filter({ template_id: tpl.id });
      for (const mr of masterRecords) {
        await base44.entities.SSOTmasterRECORDS.update(mr.id, { status: "withdrawn" });
      }

      await base44.entities.SourceReplicaTemplateMakeReady.delete(tpl.id);
      queryClient.invalidateQueries({ queryKey: ["SourceReplicaTemplateMakeReady"] });
      queryClient.invalidateQueries({ queryKey: ["SourceReplicaTemplateStatus"] });
      queryClient.invalidateQueries({ queryKey: ["SSOTmasterRECORDS"] });
      toast.success("Template withdrawn and archived.");
    } catch (err) {
      toast.error(`Withdrawal failed: ${err.message}`);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
        <span className="font-semibold text-sm">Saved Templates ({templates.length})</span>
        <button
          onClick={() => setMinimised(m => !m)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={minimised ? "Expand" : "Minimise"}
        >
          {minimised ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
        </button>
      </div>

      {!minimised && (
        <div className="overflow-x-auto">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No templates saved yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Project Name</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Source Entity</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Replicas</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => {
                  const status = getStatus(tpl.id);
                  const isConfirmed = status?.confirmed_in_use;
                  return (
                    <tr
                      key={tpl.id}
                      className="border-b border-border last:border-0 hover:bg-muted/10 cursor-pointer"
                      onClick={() => onView(tpl)}
                    >
                      <td className="px-4 py-2 font-medium">{tpl.project_name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{tpl.description}</td>
                      <td className="px-4 py-2 text-muted-foreground">{tpl.source_entity_name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{tpl.replica_configs?.length ?? 0}</td>
                      <td className="px-4 py-2">
                        {isConfirmed ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> In Use
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Not confirmed</Badge>
                        )}
                        {status?.confirmed_at && (
                          <p className="text-xs text-muted-foreground mt-0.5">by {status.confirmed_by}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => onEdit(tpl)} title="Edit">
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          {!isConfirmed && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={confirmingId === tpl.id}
                              onClick={() => handleConfirmInUse(tpl)}
                              title="Confirm this template has been actioned and is in use"
                            >
                              {confirmingId === tpl.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                              Confirm In Use
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setWithdrawDialog(tpl)}
                            title="Withdraw & Archive"
                          >
                            <Archive className="w-3 h-3 mr-1" /> Withdraw
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <WithdrawalChecklistDialog
        open={!!withdrawDialog}
        template={withdrawDialog}
        onClose={() => setWithdrawDialog(null)}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}