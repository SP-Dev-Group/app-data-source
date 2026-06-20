import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2, Send, Pencil, Archive, Tag, FileArchive } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import AddExternalSSOTDialog from "@/components/external/AddExternalSSOTDialog";
import AddReplicaConfigDialog from "@/components/external/AddReplicaConfigDialog";
import EditSSOTRecordDialog from "@/components/external/EditSSOTRecordDialog";
import ArchiveSSOTRecordDialog from "@/components/external/ArchiveSSOTRecordDialog";
import AllocateProjectsDialog from "@/components/external/AllocateProjectsDialog";
import ArchiveSSOTViewerDialog from "@/components/external/ArchiveSSOTViewerDialog";

export default function DataSourcetoReplicasandAllocatorsExternal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replicaDialogOpen, setReplicaDialogOpen] = useState(false);
  const [pushingId, setPushingId] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [archiveRecord, setArchiveRecord] = useState(null);
  const [allocateRecord, setAllocateRecord] = useState(null);
  const [archiveViewerOpen, setArchiveViewerOpen] = useState(false);

  const handlePush = async (config) => {
    setPushingId(config.id);
    try {
      const res = await base44.functions.invoke("pushToReplica10", { configId: config.id });
      const { pushed, errors } = res.data;
      if (errors && errors.length > 0) {
        toast.warning(`Pushed ${pushed} record(s) with ${errors.length} error(s)`);
      } else {
        toast.success(`Pushed ${pushed} record(s) to "${config.project_name}"`);
      }
    } catch (err) {
      toast.error(`Push failed: ${err.message}`);
    } finally {
      setPushingId(null);
    }
  };

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

  const handleReplicaSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["ReplicaAppConfig10"] });
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
          <div className="flex gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setArchiveViewerOpen(true)}>
                <FileArchive className="w-4 h-4 mr-1" /> View Archive
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Record
              </Button>
            </div>
          </div>
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
                <TableHead>Project</TableHead>
                <TableHead>Allocated Replicas</TableHead>
                <TableHead>Allocate</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Archive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : ssotRecords?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No records yet. Add a record to get started.
                  </TableCell>
                </TableRow>
              ) : (
                ssotRecords?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                    <TableCell>{record.Name}</TableCell>
                    <TableCell>
                      {record.allocated_projects?.length > 0
                        ? <div className="flex flex-wrap gap-1">
                            {record.allocated_projects.map((projectName) => (
                              <span key={projectName} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                                {projectName}
                              </span>
                            ))}
                          </div>
                        : <span className="text-xs text-muted-foreground">None</span>
                      }
                    </TableCell>
                    <TableCell>
                      {record.allocated_projects?.length > 0
                        ? <div className="flex flex-wrap gap-1">
                            {record.allocated_projects.map((projectName) => {
                              const replicaConfig = replicaConfigs?.find((c) => c.project_name === projectName);
                              return (
                                <span key={projectName} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full" title={replicaConfig?.replica_entity_name}>
                                  {replicaConfig?.replica_entity_name || projectName}
                                </span>
                              );
                            })}
                          </div>
                        : <span className="text-xs text-muted-foreground">None</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setAllocateRecord(record)}>
                        <Tag className="w-3.5 h-3.5" />
                        <span className="ml-1">Allocate</span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setEditRecord(record)}>
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="ml-1">Edit</span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setArchiveRecord(record)}>
                        <Archive className="w-3.5 h-3.5" />
                        <span className="ml-1">Archive</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-8 mb-1">
          <h2 className="text-lg font-semibold text-foreground">Replica App Configs — ReplicaAppConfig10</h2>
          <Button size="sm" onClick={() => setReplicaDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Config
          </Button>
        </div>
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
                <TableHead>Push</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {replicaLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : replicaConfigs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pushingId === config.id}
                        onClick={() => handlePush(config)}
                      >
                        {pushingId === config.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Send className="w-3.5 h-3.5" />}
                        <span className="ml-1">Push All</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddReplicaConfigDialog
        open={replicaDialogOpen}
        onClose={() => setReplicaDialogOpen(false)}
        onSuccess={handleReplicaSuccess}
      />

      <AddExternalSSOTDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditSSOTRecordDialog
        open={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSuccess={handleSuccess}
      />

      <ArchiveSSOTRecordDialog
        open={!!archiveRecord}
        record={archiveRecord}
        onClose={() => setArchiveRecord(null)}
        onSuccess={handleSuccess}
      />

      <AllocateProjectsDialog
        open={!!allocateRecord}
        record={allocateRecord}
        onClose={() => setAllocateRecord(null)}
        onSuccess={handleSuccess}
      />

      <ArchiveSSOTViewerDialog
        open={archiveViewerOpen}
        onClose={() => setArchiveViewerOpen(false)}
        onReinstate={handleSuccess}
      />
    </div>
  );
}