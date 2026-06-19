import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Check, X, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import AddSampleDialog from "@/components/AddSampleDialog";
import ManageAllocationsDialog from "@/components/ManageAllocationsDialog";

export default function DataSourcetoReplicasAndAllocators() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manageRecord, setManageRecord] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const queryClient = useQueryClient();

  // SSOT
  const { data: ssotRecords, isLoading: ssotLoading } = useQuery({
    queryKey: ['SampleSSOT1'],
    queryFn: () => base44.entities.SampleSSOT1.list(),
  });

  const ssotDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SampleSSOT1.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleSSOT1'] });
      toast.success("Record deleted");
    },
  });

  // Replica 1-1
  const { data: replica1_1Records, isLoading: replica1_1Loading } = useQuery({
    queryKey: ['SampleReplica1_1'],
    queryFn: () => base44.entities.SampleReplica1_1.list(),
  });

  const replica1_1DeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SampleReplica1_1.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleReplica1_1'] });
      toast.success("Record deleted");
    },
  });

  // Replica 1-2
  const { data: replica1_2Records, isLoading: replica1_2Loading } = useQuery({
    queryKey: ['SampleReplica1_2'],
    queryFn: () => base44.entities.SampleReplica1_2.list(),
  });

  const replica1_2DeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SampleReplica1_2.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleReplica1_2'] });
      toast.success("Record deleted");
    },
  });

  const handleDialogSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['SampleSSOT1'] });
    queryClient.invalidateQueries({ queryKey: ['SampleReplica1_1'] });
    queryClient.invalidateQueries({ queryKey: ['SampleReplica1_2'] });
  };

  const EntityTable = ({ records, isLoading }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unique ID</TableHead>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </TableCell>
          </TableRow>
        ) : records?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
              No records found.
            </TableCell>
          </TableRow>
        ) : (
          records?.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
              <TableCell>{record.Name}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Data Source to Replicas with Replica Allocator
            </h1>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Sample
          </Button>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3">SSOT - SampleSSOT1</h2>
        <p className="text-xs text-muted-foreground mb-3">Click a row to manage its replica allocations.</p>
        <div className="rounded-lg border border-border overflow-hidden mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unique ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ssotLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : ssotRecords?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                ssotRecords?.map((record) => (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => { if (deleteConfirmId !== record.id) setManageRecord(record); }}
                  >
                    <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {ssotDeleteMutation.isPending && deleteConfirmId === record.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : deleteConfirmId === record.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => { ssotDeleteMutation.mutate(record.id); setDeleteConfirmId(null); }}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(record.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3">Replica 1-1 - SampleReplica1_1</h2>
        <div className="rounded-lg border border-border overflow-hidden mb-8">
          <EntityTable
            records={replica1_1Records}
            isLoading={replica1_1Loading}
          />
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3">Replica 1-2 - SampleReplica1_2</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <EntityTable
            records={replica1_2Records}
            isLoading={replica1_2Loading}
          />
        </div>
      </div>

      <AddSampleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      <ManageAllocationsDialog
        open={!!manageRecord}
        onClose={() => setManageRecord(null)}
        record={manageRecord}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}