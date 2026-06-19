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

  // SSOT
  const { data: ssotRecords, isLoading: ssotLoading } = useQuery({
    queryKey: ['SampleSSOT1'],
    queryFn: () => base44.entities.SampleSSOT1.list(),
  });

  const ssotCreateMutation = useMutation({
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

  const replica1_1CreateMutation = useMutation({
    mutationFn: (data) => base44.entities.SampleReplica1_1.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleReplica1_1'] });
      toast.success("Record added to Replica 1-1");
    },
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

  const replica1_2CreateMutation = useMutation({
    mutationFn: (data) => base44.entities.SampleReplica1_2.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleReplica1_2'] });
      toast.success("Record added to Replica 1-2");
    },
  });

  const replica1_2DeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SampleReplica1_2.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['SampleReplica1_2'] });
      toast.success("Record deleted");
    },
  });

  const handleAddSSOT = () => {
    if (!uniqueId.trim() || !name.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    ssotCreateMutation.mutate({ unique_id: uniqueId.trim(), Name: name.trim() });
  };

  const handleAddReplica1_1 = () => {
    const uid = `R1-1-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const names = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
    const name = names[Math.floor(Math.random() * names.length)];
    replica1_1CreateMutation.mutate({ unique_id: uid, Name: name });
  };

  const handleAddReplica1_2 = () => {
    const uid = `R1-2-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const names = ["One", "Two", "Three", "Four", "Five"];
    const name = names[Math.floor(Math.random() * names.length)];
    replica1_2CreateMutation.mutate({ unique_id: uid, Name: name });
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
          <Button onClick={handleAddSSOT} disabled={ssotCreateMutation.isPending}>
            <Plus className="w-4 h-4 mr-1" />
            {ssotCreateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Sample"}
          </Button>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3">SSOT - SampleSSOT1</h2>

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
                    No records found. Click "Add Sample" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                ssotRecords?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => ssotDeleteMutation.mutate(record.id)}
                        disabled={ssotDeleteMutation.isPending}
                      >
                        {ssotDeleteMutation.isPending ? (
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

        <div className="flex justify-end mb-3">
          <Button onClick={handleAddReplica1_1} disabled={replica1_1CreateMutation.isPending} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {replica1_1CreateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Sample"}
          </Button>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3">Replica 1-1 - SampleReplica1_1</h2>

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
              {replica1_1Loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : replica1_1Records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                replica1_1Records?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => replica1_1DeleteMutation.mutate(record.id)}
                        disabled={replica1_1DeleteMutation.isPending}
                      >
                        {replica1_1DeleteMutation.isPending ? (
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

        <div className="flex justify-end mb-3">
          <Button onClick={handleAddReplica1_2} disabled={replica1_2CreateMutation.isPending} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {replica1_2CreateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Sample"}
          </Button>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3">Replica 1-2 - SampleReplica1_2</h2>

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
              {replica1_2Loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : replica1_2Records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                replica1_2Records?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => replica1_2DeleteMutation.mutate(record.id)}
                        disabled={replica1_2DeleteMutation.isPending}
                      >
                        {replica1_2DeleteMutation.isPending ? (
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