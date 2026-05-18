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
          <DialogTitle>Data Master Manual</DialogTitle>
          <DialogDescription>Manual refresh function for data management</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              This page allows you to manually create and manage Data Master records. 
              Use the "Add Record" button to create new entries or "Generate Sample" 
              to create test data. Click the refresh button to reload the latest data.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}