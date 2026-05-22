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
        Setup Guide
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Firebase Firestore Setup Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Set up a Firebase Project</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">console.firebase.google.com</a></li>
                <li>Create a new project (or use an existing one)</li>
                <li>Go to <strong>Firestore Database</strong> → <strong>Create database</strong> (start in test mode for now)</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Get Your Firebase Config</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>In Firebase Console → <strong>Project Settings</strong> (gear icon) → <strong>Your apps</strong></li>
                <li>Click <strong>Web</strong> (&lt;/&gt;) to register a web app</li>
                <li>Copy the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">firebaseConfig</code> object</li>
                <li>You'll need these values:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs">
                    <li><code className="bg-muted px-1 rounded">apiKey</code></li>
                    <li><code className="bg-muted px-1 rounded">authDomain</code></li>
                    <li><code className="bg-muted px-1 rounded">projectId</code></li>
                    <li><code className="bg-muted px-1 rounded">storageBucket</code></li>
                    <li><code className="bg-muted px-1 rounded">messagingSenderId</code></li>
                    <li><code className="bg-muted px-1 rounded">appId</code></li>
                  </ul>
                </li>
              </ol>
              <p className="mt-2 text-xs">Your config will look like:</p>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words mt-1">
{`// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC6...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
  measurementId: "G-XXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Set Up Firestore Rules (for testing)</h3>
              <p className="mb-2">In <strong>Firestore → Rules</strong> tab, temporarily set:</p>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Choose Your Collection Name</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Decide on a Firestore collection name (e.g. <code className="bg-muted px-1 rounded text-xs">records</code>, <code className="bg-muted px-1 rounded text-xs">entries</code>, <code className="bg-muted px-1 rounded text-xs">items</code>)</li>
                <li>Each document will store: <code className="bg-muted px-1 rounded text-xs">unique_id</code> and <code className="bg-muted px-1 rounded text-xs">name</code> fields</li>
              </ul>
            </div>

            <div className="bg-accent/30 p-3 rounded text-xs">
              <p className="font-medium text-foreground mb-1">Next Step:</p>
              <p>Once you have your Firebase config values and collection name ready, provide them and I'll update the page to connect to your database.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}