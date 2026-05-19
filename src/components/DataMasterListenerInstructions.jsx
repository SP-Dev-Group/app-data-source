import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DataMasterListenerInstructions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Instructions</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Data Source Manual</DialogTitle>
          <DialogDescription>Manually create and manage data records</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">What is this?</h3>
            <p className="text-sm text-muted-foreground">
              The Data Source Manual page allows you to manually create and manage records in the DataSourceManual entity. Add custom data entries or generate sample test data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Actions</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Click "Add Record" to manually enter new data</li>
              <li>Click "Generate Sample" to create random test records</li>
              <li>View all records in the table below</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}