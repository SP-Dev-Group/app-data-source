import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Code, Database, Zap } from "lucide-react";

export default function PageDocumentationDialog({ open, onClose }) {
  const entities = [
    {
      name: "SourceSSOT10",
      type: "Source Entity",
      description: "Main source of truth entity storing records that sync to replicas",
      fields: ["unique_id", "Name", "allocated_projects"]
    },
    {
      name: "ReplicaAppConfig10",
      type: "Configuration Entity",
      description: "Stores replica app configurations including app IDs, entity names, and credentials",
      fields: ["project_name", "replica_app_id", "replica_entity_name", "secret_name", "secret_value", "source_entity_name"]
    },
    {
      name: "SourceSSOT10Archive",
      type: "Archive Entity",
      description: "Stores archived versions of SourceSSOT10 records",
      fields: ["source_id", "unique_id", "Name", "event_type", "version"]
    },
    {
      name: "SourceSSOT10VersionHistory",
      type: "Version Tracking Entity",
      description: "Tracks all versions and changes to SourceSSOT10 records",
      fields: ["source_id", "unique_id", "Name", "event_type", "version"]
    }
  ];

  const functions = [
    {
      name: "pushAllocatedRecord10",
      type: "Backend Function",
      description: "Pushes a single record to all allocated replica apps based on config IDs",
      usage: "Called when allocating records to sync data to selected replicas"
    },
    {
      name: "pushToReplica10",
      type: "Backend Function",
      description: "Pushes all source records to a specific replica configuration",
      usage: "Called from 'Push All' button on replica configs"
    },
    {
      name: "deleteFromReplicas10",
      type: "Backend Function",
      description: "Deletes a record from all allocated replica apps",
      usage: "Called when archiving records to remove from replicas"
    }
  ];

  const processes = [
    {
      name: "Record Allocation",
      steps: [
        "User clicks 'Allocate' button on a record",
        "Selects target replicas via checkboxes",
        "Config IDs saved to allocated_projects field",
        "pushAllocatedRecord10 invoked to sync record to selected replicas"
      ]
    },
    {
      name: "Record Editing",
      steps: [
        "User clicks 'Edit' button on a record",
        "Updates record name in SourceSSOT10",
        "Creates version history entry",
        "pushAllocatedRecord10 invoked to propagate changes to replicas"
      ]
    },
    {
      name: "Record Archiving",
      steps: [
        "User clicks 'Archive' button on a record",
        "Creates archive entry in SourceSSOT10Archive",
        "Creates version history entry",
        "deleteFromReplicas10 invoked to remove from all allocated replicas",
        "Source record deleted from SourceSSOT10"
      ]
    },
    {
      name: "Manual Push to Replica",
      steps: [
        "User clicks 'Push All' on a replica config",
        "pushToReplica10 fetches all source records",
        "Records upserted (created/updated) in replica app",
        "Field names normalized to match replica schema"
      ]
    },
    {
      name: "Record Reinstatement",
      steps: [
        "User clicks 'View Archive' button",
        "Selects archived record to reinstate",
        "reinstateFromArchive10 creates new active record",
        "Record must be re-allocated to replicas manually"
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Page Documentation — Data Source to Replicas
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Entities Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Entities Used
              </h3>
              <div className="grid gap-3">
                {entities.map((entity) => (
                  <div key={entity.name} className="rounded-lg border border-border p-3 bg-muted/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{entity.name}</span>
                      <Badge variant="outline" className="text-xs">{entity.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{entity.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {entity.fields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs font-mono">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Functions Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Backend Functions
              </h3>
              <div className="grid gap-3">
                {functions.map((fn) => (
                  <div key={fn.name} className="rounded-lg border border-border p-3 bg-muted/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{fn.name}</span>
                      <Badge variant="outline" className="text-xs">{fn.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{fn.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Usage:</span> {fn.usage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Processes Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Key Processes
              </h3>
              <div className="grid gap-3">
                {processes.map((process) => (
                  <div key={process.name} className="rounded-lg border border-border p-3 bg-muted/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{process.name}</Badge>
                    </div>
                    <ol className="space-y-1">
                      {process.steps.map((step, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                          <span className="font-mono text-muted-foreground/70">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}