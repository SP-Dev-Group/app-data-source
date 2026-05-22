import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DataMasterListenerInstructions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Instructions</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Data Source Manual</DialogTitle>
          <DialogDescription>Manually create and manage data records</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto flex-1 pr-4">
          <div>
            <h3 className="font-semibold mb-2">What is this?</h3>
            <p className="text-sm text-muted-foreground">
              The Data Source Manual page allows you to manually create and manage records in the DataSourceManual entity. Add custom data entries or generate sample test data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Database Requirements</h3>
            <p className="text-sm text-muted-foreground mb-1">Every database used in this pattern must support all three write methods:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Create</strong> — add new records</li>
              <li><strong>Edit (Update)</strong> — modify existing records in-place</li>
              <li><strong>Delete</strong> — remove records from the live database</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-1">Ensure the Base44 entity permissions allow all three operations before wiring automations.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Archive Database</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Each live database has a paired archive database (e.g. <strong>DataSourceManualArchive</strong>). The archive acts as a full audit trail:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Create</strong> — a copy of the new record is added to the archive as version 1</li>
              <li><strong>Edit</strong> — each edit adds a new archive entry (version 2, 3, …) with the updated values</li>
              <li><strong>Delete</strong> — a final archive entry is written with event_type "deleted" so the record's removal is permanently recorded</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-1">The archive is write-only from the live side — records in the archive are never edited or deleted.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Setup Steps</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create the live entity (e.g. <code>DataSourceManual</code>) with all required fields</li>
              <li>Create the archive entity (e.g. <code>DataSourceManualArchive</code>) with matching fields plus <code>source_id</code>, <code>event_type</code>, and <code>version</code></li>
              <li>Create a backend function (<code>archiveDataSourceManual</code>) that writes an archive entry on each event</li>
              <li>Create an entity automation on <code>DataSourceManual</code> triggering on create, update, and delete — pointing to the archive function</li>
              <li>Add an "Archive" button to the page that opens a searchable popup of all archive records</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Reinstating Deleted Records</h3>
            <p className="text-sm text-muted-foreground mb-1">
              If a record is accidentally deleted from the live database, it can be recovered from the Archive:
            </p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click the "Archive" button to open the archive viewer</li>
              <li>Search for the deleted record by name, email, or unique ID</li>
              <li>Find the entry with event type <strong>deleted</strong> — a <strong>↺ reinstate</strong> button will appear on that row</li>
              <li>Click the reinstate button, then confirm with ✓ — the record is re-created in the live database with its last known values</li>
              <li>A new archive entry is written with event type <strong>reinstated</strong> so the recovery is fully audited</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-1">Note: Only the most recent "deleted" entry per record shows the reinstate button — earlier versions do not.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Actions</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Click "Add Record" to manually enter new data</li>
              <li>Click "Generate Sample" to create random test records</li>
              <li>Click "Archive" to view the full audit history with search and reinstate deleted records</li>
              <li>View all live records in the table</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}