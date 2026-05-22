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
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Data Source Daily at 2am</DialogTitle>
            <DialogDescription>
              This app entity serves as SSOT (single source of truth), a source database and on the replica app's database, it is an Automated daily data synchronization scheduled at 2:00 AM.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground overflow-y-auto flex-1 pr-4">
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
                <li>Click "Archive" to view the full audit history and reinstate deleted records</li>
                <li>View all synchronized records in the table below</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Archive Database</h3>
              <p className="mb-1">Each live database has a paired archive (DataSource2amArchive). The archive is a full audit trail:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Create</strong> — a copy of the new record is added as version 1</li>
                <li><strong>Edit</strong> — each edit adds a new entry (version 2, 3, …)</li>
                <li><strong>Delete</strong> — a final entry is written with event_type "deleted"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Reinstating Deleted Records</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Archive" to open the archive viewer</li>
                <li>Search for the deleted record by name, email, or unique ID</li>
                <li>Find the entry with event type <strong>deleted</strong> — a Reinstate button will appear</li>
                <li>Click Reinstate, then confirm — the record is re-created in the live database</li>
                <li>A new archive entry is written with event type <strong>reinstated</strong></li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}