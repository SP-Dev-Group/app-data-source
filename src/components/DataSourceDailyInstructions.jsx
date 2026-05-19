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
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Info className="h-4 w-4" />
        Information
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Data Source Daily at 2am</DialogTitle>
            <DialogDescription>
              This app entity serves as SSOT (single source of truth), a source database and on the replica app's database, it is an Automated daily data synchronization scheduled at 2:00 AM.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">What is this?</h3>
              <p>
                The Data Source Daily at 2am is an automated process that runs every day at 2:00 AM to synchronize data from this application to a destination system. The automation happens on the replica downstream app.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">How it works</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Automation on replica app is Triggered automatically at 2:00 AM daily</li>
                <li>Fetches all records from DataSource2am entity on this app</li>
                <li>Syncs data to the destination app via webhooks</li>
                <li>No manual intervention required</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Entity Details</h3>
              <p>Entity: DataSource2am</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Actions</h3>
              <ul className="list-disc list-inside space-y-1">
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