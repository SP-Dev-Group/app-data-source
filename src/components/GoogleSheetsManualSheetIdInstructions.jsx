import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from 'lucide-react';

export default function GoogleSheetsManualSheetIdInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <HelpCircle className="h-4 w-4 mr-2" />
          Information
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Google Sheets — Manual Sheet ID</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">How to Use</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Get your Google Sheets Spreadsheet ID from the URL</li>
              <li>Paste it in the "Spreadsheet ID" field</li>
              <li>Enter the sheet name (default: Sheet1)</li>
              <li>Click "Load" to fetch the sheet data</li>
              <li>Add records manually or click "Add Sample" for test data</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Finding Your Spreadsheet ID</h3>
            <p className="text-muted-foreground">
              Open your Google Sheet in a browser. The URL looks like:
              <br />
              <code className="bg-muted px-2 py-1 rounded text-xs">
                docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
              </code>
              <br />
              Copy the ID between <code className="bg-muted px-1 rounded text-xs">/d/</code> and <code className="bg-muted px-1 rounded text-xs">/edit</code>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}