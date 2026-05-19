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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Data Source 5 min Refetch Instructions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
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
              <li><strong>Entity Name:</strong> DataSourceListener2</li>
              <li><strong>Fields:</strong> unique_id, name</li>
              <li><strong>Refetch Interval:</strong> Every 5 minutes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Usage</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Use "Create Sample" to generate test records</li>
              <li>Click "Refresh" to manually reload the latest data</li>
              <li>Monitor this page to verify data updates are being captured</li>
              <li>The system automatically refetches every 5 minutes for updates</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}