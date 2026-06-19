import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddExternalSSOTDialog from "@/components/external/AddExternalSSOTDialog";

export default function DataSourcetoReplicasandAllocatorsExternal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: ssotRecords, isLoading } = useQuery({
    queryKey: ["SourceSSOT10"],
    queryFn: () => base44.entities.SourceSSOT10.list(),
  });

  const { data: replicaConfigs, isLoading: replicaLoading } = useQuery({
    queryKey: ["ReplicaAppConfig10"],
    queryFn: () => base44.entities.ReplicaAppConfig10.list(),
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["SourceSSOT10"] });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Data Source to Replicas — External
            </h1>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Record
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-1">SSOT — SourceSSOT10</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Records stored locally as the source of truth. Use push functionality to sync to external replica apps.
        </p>

        <div className="rounded-lg border border-border overflow-hidden">
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
              ) : ssotRecords?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No records yet. Add a record to get started.
                  </TableCell>
                </TableRow>
              ) : (
                ssotRecords?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <h2 className="text-lg font-semibold text-foreground mt-8 mb-1">Replica App Configs — ReplicaAppConfig10</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Registered external replica apps that records can be pushed to.
        </p>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Replica App ID</TableHead>
                <TableHead>Replica Entity</TableHead>
                <TableHead>Source Entity</TableHead>
                <TableHead>Secret Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {replicaLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : replicaConfigs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No replica configs yet.
                  </TableCell>
                </TableRow>
              ) : (
                replicaConfigs?.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.project_name}</TableCell>
                    <TableCell className="font-mono text-sm">{config.replica_app_id}</TableCell>
                    <TableCell>{config.replica_entity_name}</TableCell>
                    <TableCell>{config.source_entity_name}</TableCell>
                    <TableCell className="font-mono text-sm">{config.secret_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddExternalSSOTDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}