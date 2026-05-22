import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function DataSourceListener2Instructions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          Instructions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Data Source 5 min Refetch Instructions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground overflow-y-auto flex-1 pr-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">Purpose</h3>
            <p>
              This entity serves as a Single Source of Truth (Source) database that is refetched every 5 minutes from the Replica app.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-2">How It Works</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>External systems update data in DataReplica5mins entity</li>
              <li>In the Replica app a scheduled automation refetches data every 5 minutes</li>
              <li>Changes are detected and processed automatically</li>
              <li>Updated records are synchronized to downstream systems</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Entity Details</h3>
            <ul className="space-y-1">
              <li><strong>Entity Name:</strong> DataSourceRefresh5mins</li>
              <li><strong>Fields:</strong> unique_id, name</li>
              <li><strong>Refetch Interval:</strong> Every 5 minutes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Usage</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Use "Create Sample" to generate test records</li>
              <li>Click "Refresh" to manually reload the latest data</li>
              <li>Click "Archive" to view the full audit history and reinstate deleted records</li>
              <li>Monitor this page to verify data updates are being captured</li>
              <li>The system automatically refetches every 5 minutes for updates</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Archive Database</h3>
            <p className="mb-1">Each live database has a paired archive (DataSourceRefresh5minsArchive). The archive is a full audit trail:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Create</strong> — a copy of the new record is added as version 1</li>
              <li><strong>Edit</strong> — each edit adds a new entry (version 2, 3, …)</li>
              <li><strong>Delete</strong> — a final entry is written with event_type "deleted"</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Reinstating Deleted Records</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Archive" to open the archive viewer</li>
              <li>Search for the deleted record by name or unique ID</li>
              <li>Find the entry with event type <strong>deleted</strong> — a Reinstate button will appear</li>
              <li>Click Reinstate, then confirm — the record is re-created in the live database</li>
              <li>A new archive entry is written with event type <strong>reinstated</strong></li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}