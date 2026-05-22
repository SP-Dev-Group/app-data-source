import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from 'lucide-react';

export default function GoogleSheetsHardcodeIdInstructions() {
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
          <DialogTitle>Google Sheets — Hard-coded Sheet ID</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm overflow-y-auto flex-1 pr-4">
          <div>
            <h3 className="font-semibold mb-2">How to Use</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>This page is pre-configured with a fixed spreadsheet ID</li>
              <li>Data automatically loads when you open the page</li>
              <li>Add records manually or click "Add Sample" for test data</li>
              <li>Click the refresh button to reload the latest data</li>
              <li>Click "Archive" to view the full audit history</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">When to Use</h3>
            <p className="text-muted-foreground">
              Use this approach when your spreadsheet ID is fixed and you want to simplify user experience by eliminating the need to enter configuration details.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Archive System</h3>
            <p className="text-muted-foreground mb-2">Every create, update, and delete is logged to a paired archive Google Sheet (<code className="bg-muted px-1 rounded text-xs">1PtjThbFY89u7_z7fowTsfm-xDV03I4IqFuTN_h_G18w</code>). The archive sheet has columns:</p>
            <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
              <li><strong>Unique ID</strong> — the record's ID</li>
              <li><strong>Name</strong> — value at time of event</li>
              <li><strong>Ver</strong> — version number (1 = created, 2+ = edits)</li>
              <li><strong>Event</strong> — created / updated / deleted</li>
              <li><strong>Date</strong> — ISO timestamp of the event</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How to Wire Archiving</h3>
            <ol className="list-decimal ml-5 space-y-1 text-muted-foreground">
              <li>After every add, call <code className="bg-muted px-1 rounded text-xs">sheetsArchiveRow</code> with event = "created" and ver = 1</li>
              <li>After every edit, call <code className="bg-muted px-1 rounded text-xs">sheetsArchiveRow</code> with event = "updated" and the next ver number</li>
              <li>After every delete, call <code className="bg-muted px-1 rounded text-xs">sheetsArchiveRow</code> with event = "deleted"</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}