import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Pencil, Archive, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function TemplatesPanel({ onView, onEdit }) {
  const queryClient = useQueryClient();
  const [minimised, setMinimised] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(null); // template id awaiting 2nd confirm

  const { data: templates = [] } = useQuery({
    queryKey: ["SourceReplicaTemplateMakeReady"],
    queryFn: () => base44.entities.SourceReplicaTemplateMakeReady.list(),
  });

  const handleArchive = async (tpl) => {
    if (archiveConfirm !== tpl.id) {
      setArchiveConfirm(tpl.id);
      return;
    }
    // 2nd click — do archive
    setArchiveConfirm(null);
    try {
      // get current version count
      const history = await base44.entities.SourceReplicaTemplateVersionHistory.filter({ template_id: tpl.id });
      const version = history.length + 1;

      // write archive record
      await base44.entities.SourceReplicaTemplateArchive.create({
        template_id: tpl.id,
        project_name: tpl.project_name,
        version,
        snapshot: JSON.stringify(tpl),
      });

      // write version history entry
      await base44.entities.SourceReplicaTemplateVersionHistory.create({
        template_id: tpl.id,
        project_name: tpl.project_name,
        event_type: "archived",
        version,
        snapshot: JSON.stringify(tpl),
      });

      // delete live record
      await base44.entities.SourceReplicaTemplateMakeReady.delete(tpl.id);
      queryClient.invalidateQueries({ queryKey: ["SourceReplicaTemplateMakeReady"] });
      toast.success("Template archived.");
    } catch (err) {
      toast.error(`Archive failed: ${err.message}`);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
      {/* Header */}
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

      {/* Table */}
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
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr
                    key={tpl.id}
                    className="border-b border-border last:border-0 hover:bg-muted/10 cursor-pointer"
                    onClick={() => onView(tpl)}
                  >
                    <td className="px-4 py-2 font-medium">{tpl.project_name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{tpl.description}</td>
                    <td className="px-4 py-2 text-muted-foreground">{tpl.source_entity_name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{tpl.replica_configs?.length ?? 0}</td>
                    <td className="px-4 py-2 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(tpl)}
                          title="Edit"
                        >
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant={archiveConfirm === tpl.id ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleArchive(tpl)}
                          title={archiveConfirm === tpl.id ? "Click again to confirm archive" : "Archive"}
                        >
                          <Archive className="w-3 h-3 mr-1" />
                          {archiveConfirm === tpl.id ? "Confirm?" : "Archive"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}