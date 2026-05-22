import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from 'lucide-react';

export default function GoogleSheetsHardcodeIdInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed top-6 right-6">
          <HelpCircle className="h-4 w-4 mr-2" />
          Information
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Google Sheets — Hard-coded Sheet ID</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">How to Use</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>This page is pre-configured with a fixed spreadsheet ID</li>
              <li>Data automatically loads when you open the page</li>
              <li>Add records manually or click "Add Sample" for test data</li>
              <li>Click the refresh button to reload the latest data</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">When to Use</h3>
            <p className="text-muted-foreground">
              Use this approach when your spreadsheet ID is fixed and you want to simplify user experience by eliminating the need to enter configuration details.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}