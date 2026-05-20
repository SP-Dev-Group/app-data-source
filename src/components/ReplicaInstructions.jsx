import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Info } from "lucide-react";

export default function ReplicaInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Info className="h-4 w-4" />
        Replica Instructions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Replica Instructions</DialogTitle>
            <DialogDescription>
              Replica data synchronization and mirroring
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">What is this?</h3>
              <p>
                The Replica system mirrors and synchronizes data from the source application to maintain consistency across environments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">How it works</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Source data changes are captured</li>
                <li>Changes are transmitted to the replica application</li>
                <li>Replica records are created or updated to match source</li>
                <li>Data remains synchronized across systems</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Actions</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Monitor replica synchronization status</li>
                <li>View replicated records and their status</li>
                <li>Verify data consistency between source and replica</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}