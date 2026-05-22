import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from 'lucide-react';

export default function GoogleSheetsHardcodeArchiveInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <HelpCircle className="h-4 w-4 mr-2" />
          Information
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Archive — Google Sheets Hard-coded</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm overflow-y-auto flex-1 pr-4">
          <div>
            <h3 className="font-semibold mb-2">Archive Setup</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Create a new Google Sheet for the archive with headers in the first row</li>
              <li>Required headers: <strong>Unique ID</strong>, <strong>Name</strong>, <strong>Ver</strong>, <strong>Event</strong>, <strong>Date</strong></li>
              <li>Base44 will use the top row as headers and skip it when loading data</li>
              <li>The archive spreadsheet ID is: <code className="bg-muted px-1 rounded text-xs">1Gxc4hxadg7XYfMv_NvD9O-rsfLx7kc-8a04YjXbsNdY</code></li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Archive Columns</h3>
            <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
              <li><strong>Unique ID</strong> — the record's ID</li>
              <li><strong>Name</strong> — value at time of event</li>
              <li><strong>Ver</strong> — version number (1 = created, 2+ = edits)</li>
              <li><strong>Event</strong> — created / updated / deleted / reinstated</li>
              <li><strong>Date</strong> — ISO timestamp of the event</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How to Use</h3>
            <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
              <li>View all historical changes to your records</li>
              <li>Search by name, ID, or event type</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}