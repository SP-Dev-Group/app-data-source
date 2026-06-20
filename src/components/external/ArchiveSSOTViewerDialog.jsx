import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Archive, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

export default function ArchiveSSOTViewerDialog({ open, onClose, onReinstate }) {
  const [reinstatingId, setReinstatingId] = useState(null);

  const { data: archives, isLoading, refetch } = useQuery({
    queryKey: ["SourceSSOT10Archive"],
    queryFn: () => base44.entities.SourceSSOT10Archive.list(),
    enabled: open,
  });

  const handleReinstate = async (archiveRecord) => {
    setReinstatingId(archiveRecord.id);
    try {
      const res = await base44.functions.invoke("reinstateFromArchive10", { archiveId: archiveRecord.id });
      toast.success(res.data.message);
      onReinstate();
      refetch();
      onClose();
    } catch (err) {
      toast.error(`Failed to reinstate: ${err.message}`);
    } finally {
      setReinstatingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Archived SSOT Records
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-border overflow-hidden mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unique ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Reinstate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : archives?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No archived records found.
                  </TableCell>
                </TableRow>
              ) : (
                archives?.map((archive) => (
                  <TableRow key={archive.id}>
                    <TableCell className="font-mono text-sm">{archive.unique_id}</TableCell>
                    <TableCell>{archive.Name}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">
                        {archive.event_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{archive.version}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReinstate(archive)}
                        disabled={reinstatingId === archive.id}
                      >
                        {reinstatingId === archive.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCcw className="w-3.5 h-3.5" />
                        )}
                        <span className="ml-1">Reinstate</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}