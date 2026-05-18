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
          <DialogTitle>DataSourceListener2 Setup Instructions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-2">Purpose</h3>
            <p>
              This entity serves as a data source listener that receives synchronized data 
              from the DataMaster entity via the syncToListener automation.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-2">How It Works</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>When records are created, updated, or deleted in DataMasterListener</li>
              <li>The syncToListener automation triggers automatically</li>
              <li>Data is sent to the destination app's syncToListener function</li>
              <li>Records are synchronized to this DataSourceListener2 entity</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Entity Details</h3>
            <ul className="space-y-1">
              <li><strong>Entity Name:</strong> DataSourceListener2</li>
              <li><strong>Fields:</strong> unique_id, name</li>
              <li><strong>Trigger Events:</strong> create, update, delete</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Usage</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Use "Create Sample" to generate test records</li>
              <li>Click "Refresh" to reload the latest data</li>
              <li>Monitor this page to verify synchronization is working correctly</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}