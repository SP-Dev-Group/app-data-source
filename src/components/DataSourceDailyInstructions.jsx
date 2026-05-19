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

export default function DataSourceDailyInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        title="Instructions"
      >
        <Info className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data Source Daily at 2am</DialogTitle>
            <DialogDescription>
              Automated daily data synchronization scheduled at 2:00 AM
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What is this?</h3>
              <p className="text-sm text-muted-foreground">
                The Data Source Daily at 2am is an automated process that runs every day at 2:00 AM to synchronize data from this application to a destination system.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How it works</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Triggered automatically at 2:00 AM daily</li>
                <li>Fetches all records from DataSource2am entity</li>
                <li>Syncs data to the destination app via webhooks</li>
                <li>No manual intervention required</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Entity Details</h3>
              <p className="text-sm text-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                Entity: DataSource2am
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Actions</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Click "Generate Sample" to create test records</li>
                <li>Click "Refresh" to reload the current data</li>
                <li>View all synchronized records in the table below</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}