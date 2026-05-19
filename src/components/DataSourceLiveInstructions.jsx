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

export default function DataSourceLiveInstructions() {
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Data Source Live</DialogTitle>
            <DialogDescription>
              Event-based data tracking and real-time synchronization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">What is this?</h3>
              <p>
                Data Source Live captures and tracks real-time data changes as they occur in the system. This entity serves as a live data source that responds immediately to changes without scheduled intervals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">How it works</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Changes are captured in real-time as they happen</li>
                <li>Records are immediately available in the DataSourceLive entity</li>
                <li>Data syncs instantaneously to connected systems</li>
                <li>No delays or scheduled intervals required</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Entity Details</h3>
              <p>Entity: DataSourceLive</p>
              <p className="mt-1">Fields: unique_id, name</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Actions</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Click "Create Sample" to add test records</li>
                <li>View all live tracked records in the table below</li>
                <li>Monitor real-time data changes as they occur</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}