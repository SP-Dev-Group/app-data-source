import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function DataSourcetoReplicasAndAllocators() {
  const [uniqueId, setUniqueId] = useState("");
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ['SampleSSOT1'],
    queryFn: () => base44.entities.SampleSSOT1.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SampleSSOT1.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleSSOT1'] });
      setUniqueId("");
      setName("");
      toast.success("Record added");
    },
    onError: (error) => {
      toast.error("Failed to add record: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SampleSSOT1.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleSSOT1'] });
      toast.success("Record deleted");
    },
  });

  const handleAdd = () => {
    if (!uniqueId.trim() || !name.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    createMutation.mutate({ unique_id: uniqueId.trim(), Name: name.trim() });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Data Source to Replicas with Replica Allocator
        </h1>

        <div className="flex gap-3 mb-6 items-center">
          <Input
            placeholder="Unique ID"
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleAdd} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-1" />
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Sample"}
          </Button>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3">SSOT</h2>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unique ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No records found. Click "Add Sample" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                records?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(record.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}