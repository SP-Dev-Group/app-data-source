import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DataMasterListenerInstructions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Instructions</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Entity Automation Setup</DialogTitle>
          <DialogDescription>How the DataMasterListener sync works</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Type</p>
            <p className="text-sm text-muted-foreground">Entity</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Source Entity</p>
            <p className="text-sm text-muted-foreground">DataMasterListener</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Events</p>
            <p className="text-sm text-muted-foreground">create, update, delete</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Function</p>
            <p className="text-sm text-muted-foreground mb-2">
              A backend function POSTs the entity payload to the Receive App endpoint URL.
            </p>
            <p className="text-xs bg-muted p-2 rounded font-mono text-muted-foreground break-all">
              https://app.base44.com/apps/520c13746d8f46fc90a60bac992d287f/api/functions/syncToListener
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}