import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function GoogleObjectStorageInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs h-7 px-2">
        <Info className="h-3 w-3" />
        Instructions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Google Object Storage - Instructions</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Overview</h3>
              <p className="text-muted-foreground">
                This page allows you to upload, view, and manage files (images, audio, video) in your Google Drive.
                Files are uploaded to Base44 storage first, then transferred to Google Drive.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Upload Files</h3>
              <ol className="list-decimal ml-5 space-y-1 text-muted-foreground">
                <li>Select a file type tab (Images, Audio, or Video)</li>
                <li>Choose a destination folder from the dropdown (optional)</li>
                <li>Click the Upload button and select a file from your device</li>
                <li>The file will be uploaded to Google Drive automatically</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Drive Folder Selection</h3>
              <p className="text-muted-foreground mb-2">
                Use the dropdown to select where files will be uploaded:
              </p>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li><strong>Base44 Uploads Folder</strong> - Files go to a specific folder (ID: 1yfCUKNYgcbhIkT8pFlEMkFr1hT7ZeJNu)</li>
                <li><strong>Root (My Drive)</strong> - Files go to the root of your Google Drive</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Search Files</h3>
              <p className="text-muted-foreground">
                Use the search box to filter files by name. The search is case-insensitive and matches partial text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Manage Files</h3>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li><strong>View</strong> - Click the external link icon to open a file in Google Drive</li>
                <li><strong>Delete</strong> - Click the trash icon to remove a file from Google Drive</li>
                <li><strong>Refresh</strong> - Click the refresh icon to reload the file list</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Supported File Types</h3>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li><strong>Images</strong> - All image formats (jpg, png, gif, etc.)</li>
                <li><strong>Audio</strong> - All audio formats (mp3, wav, etc.)</li>
                <li><strong>Video</strong> - All video formats (mp4, mov, etc.)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}