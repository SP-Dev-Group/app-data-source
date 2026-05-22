import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export default function GoogleFirebaseInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        How it works
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Firebase / Firestore Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>This page reads and writes directly to <strong className="text-foreground">Google Firestore</strong> — Firebase's NoSQL cloud database.</p>
            <div>
              <p className="font-medium text-foreground mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Records are stored in the <code className="bg-muted px-1 rounded">records</code> collection in Firestore.</li>
                <li>Each record has a auto-generated <code className="bg-muted px-1 rounded">unique_id</code>, a <code className="bg-muted px-1 rounded">name</code>, and a <code className="bg-muted px-1 rounded">created_at</code> timestamp.</li>
                <li>Data is fetched directly from Firestore on page load — no backend function needed.</li>
                <li>Use <strong className="text-foreground">Add Sample</strong> to quickly insert test data.</li>
              </ol>
            </div>
            <p>You can view all records in the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a> under Firestore Database → records.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}