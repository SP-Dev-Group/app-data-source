import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function ContractorsReplicaInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs h-7 px-2">
        <Info className="h-3 w-3" />
        Source Instructions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Contractors Replica — Source App Setup</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              The simplest method: The source app pushes data directly to the replica app's entity using the Base44 SDK whenever a record changes.
            </p>

            <div className="bg-muted/40 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Setup Steps:</h3>
              
              <div className="space-y-2">
                <p><strong className="text-foreground">Step 1:</strong> Entity created: <code className="bg-muted px-1 rounded">ContractorsReplica</code></p>
                <p><strong className="text-foreground">Step 2:</strong> Backend function created: <code className="bg-muted px-1 rounded">pushToContractorsReplica</code></p>
                <p><strong className="text-foreground">Step 3:</strong> Entity Automation configured:</p>
                <ul className="list-disc list-inside ml-4 text-muted-foreground">
                  <li>Entity: <code className="bg-muted px-1 rounded">ContractorsReplica</code></li>
                  <li>Events: <code className="bg-muted px-1 rounded">create, update</code></li>
                  <li>Function: <code className="bg-muted px-1 rounded">pushToContractorsReplica</code></li>
                </ul>
                <p><strong className="text-foreground">Step 4:</strong> No setup needed on the replica app side beyond having the ContractorsReplica entity and syncToContractorsSourceListener function ready.</p>
                <p><strong className="text-foreground">Step 5:</strong> No secrets needed — the Base44 SDK handles cross-app authentication via service role.</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="font-semibold text-purple-900">🔑 REPLICA APP ID: <code className="bg-white px-2 py-1 rounded">6983b33e16b92a3afffe0fb8</code></p>
              <p className="text-xs text-purple-700 mt-1">(Reference this ID in communications about this sync)</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}