import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Send, Pencil, Archive, Tag, RotateCcw, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Project24Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [records, setRecords] = useState([]);
  const [pushingId, setPushingId] = useState(null);

  // Dialog states
  const [allocateDialog, setAllocateDialog] = useState(null); // record
  const [editDialog, setEditDialog] = useState(null); // record
  const [archiveDialog, setArchiveDialog] = useState(null); // record
  const [editName, setEditName] = useState("");
  const [allocatedIds, setAllocatedIds] = useState([]);
  const [addDialog, setAddDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUniqueId, setNewUniqueId] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: configs = [], refetch: refetchConfigs } = useQuery({
    queryKey: ["ReplicaAppConfigProject24"],
    queryFn: () => base44.entities.ReplicaAppConfigProject24.list(),
  });

  const { data: archives = [], refetch: refetchArchives } = useQuery({
    queryKey: ["SSOT24Archive"],
    queryFn: () => base44.entities.SSOT24Archive.list("-created_date"),
  });

  // Load records
  useEffect(() => {
    base44.entities.SSOT24.list().then(setRecords);
  }, []);

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.SSOT24.subscribe((event) => {
      if (event.type === "create") setRecords((p) => [...p, event.data]);
      else if (event.type === "update") setRecords((p) => p.map((r) => (r.id === event.id ? event.data : r)));
      else if (event.type === "delete") setRecords((p) => p.filter((r) => r.id !== event.id));
    });
    return unsub;
  }, []);

  // --- ADD ---
  const handleAdd = async () => {
    if (!newName || !newUniqueId) return toast.error("Name and Unique ID required");
    setSaving(true);
    const record = await base44.entities.SSOT24.create({ unique_id: newUniqueId, Name: newName, allocated_projects: [] });
    // version history
    await base44.entities.SSOT24VersionHistory.create({ source_id: record.id, unique_id: record.unique_id, Name: record.Name, event_type: "created", version: 1 });
    setSaving(false);
    setAddDialog(false);
    setNewName("");
    setNewUniqueId("");
    toast.success("Record added");
  };

  // --- EDIT ---
  const openEdit = (record) => { setEditDialog(record); setEditName(record.Name); };
  const handleEdit = async () => {
    setSaving(true);
    await base44.entities.SSOT24.update(editDialog.id, { Name: editName });
    // version history
    const history = await base44.entities.SSOT24VersionHistory.filter({ source_id: editDialog.id });
    await base44.entities.SSOT24VersionHistory.create({ source_id: editDialog.id, unique_id: editDialog.unique_id, Name: editName, event_type: "updated", version: history.length + 1 });
    // push to allocated replicas
    await base44.functions.invoke("pushAllocatedRecordProject24", { recordId: editDialog.id });
    setSaving(false);
    setEditDialog(null);
    toast.success("Record updated and pushed to replicas");
  };

  // --- ALLOCATE ---
  const openAllocate = (record) => { setAllocateDialog(record); setAllocatedIds(record.allocated_projects || []); };
  const handleAllocate = async () => {
    setSaving(true);
    await base44.entities.SSOT24.update(allocateDialog.id, { allocated_projects: allocatedIds });
    // push to newly allocated replicas
    await base44.functions.invoke("pushAllocatedRecordProject24", { recordId: allocateDialog.id });
    setSaving(false);
    setAllocateDialog(null);
    toast.success("Allocation saved and synced");
  };

  // --- ARCHIVE ---
  const handleArchive = async () => {
    setSaving(true);
    const record = archiveDialog;
    const history = await base44.entities.SSOT24Archive.filter({ source_id: record.id });
    await base44.entities.SSOT24Archive.create({ source_id: record.id, unique_id: record.unique_id, Name: record.Name, event_type: "archived", version: history.length + 1 });
    await base44.entities.SSOT24VersionHistory.create({ source_id: record.id, unique_id: record.unique_id, Name: record.Name, event_type: "archived", version: history.length + 1 });
    await base44.functions.invoke("deleteFromReplicasProject24", { recordUniqueId: record.unique_id });
    await base44.entities.SSOT24.delete(record.id);
    setSaving(false);
    setArchiveDialog(null);
    refetchArchives();
    toast.success("Record archived and removed from replicas");
  };

  // --- PUSH ALL ---
  const handlePushAll = async (config) => {
    setPushingId(config.id);
    try {
      const res = await base44.functions.invoke("pushToReplicaProject24", { configId: config.id });
      toast.success(`Pushed ${res.data.pushed} record(s)`);
    } catch (err) {
      toast.error(`Push failed: ${err.message}`);
    } finally {
      setPushingId(null);
    }
  };

  // --- REINSTATE ---
  const handleReinstate = async (archive) => {
    setSaving(true);
    try {
      await base44.functions.invoke("reinstateFromArchiveProject24", { archiveId: archive.id });
      refetchArchives();
      toast.success("Record reinstated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Project24</h1>
        </div>

        <Tabs defaultValue="records">
          <TabsList className="mb-4">
            <TabsTrigger value="records">SSOT24 Records</TabsTrigger>
            <TabsTrigger value="replicas">Replica Configs</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          {/* RECORDS TAB */}
          <TabsContent value="records">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">SSOT24</h2>
              <Button size="sm" onClick={() => setAddDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Record
              </Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unique ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Allocated To</TableHead>
                    <TableHead>Allocate</TableHead>
                    <TableHead>Edit</TableHead>
                    <TableHead>Archive</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.unique_id}</TableCell>
                      <TableCell>{record.Name}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{(record.allocated_projects || []).length} replica(s)</span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openAllocate(record)}>
                          <Tag className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openEdit(record)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => setArchiveDialog(record)}>
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {records.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No records yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* REPLICAS TAB */}
          <TabsContent value="replicas">
            <h2 className="text-lg font-semibold mb-3">Replica Configs</h2>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Replica Entity</TableHead>
                    <TableHead>App ID</TableHead>
                    <TableHead>Push All</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>{config.project_name}</TableCell>
                      <TableCell className="font-mono text-sm">{config.replica_entity_name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{config.replica_app_id}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" disabled={pushingId === config.id} onClick={() => handlePushAll(config)}>
                          {pushingId === config.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Push All
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {configs.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No replica configs yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ARCHIVE TAB */}
          <TabsContent value="archive">
            <h2 className="text-lg font-semibold mb-3">Archived Records</h2>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unique ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Reinstate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archives.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-sm">{a.unique_id}</TableCell>
                      <TableCell>{a.Name}</TableCell>
                      <TableCell><Badge variant="outline">v{a.version}</Badge></TableCell>
                      <TableCell><Badge>{a.event_type}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" disabled={saving} onClick={() => handleReinstate(a)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reinstate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {archives.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No archived records</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ADD DIALOG */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add SSOT24 Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Unique ID *</Label>
              <Input value={newUniqueId} onChange={(e) => setNewUniqueId(e.target.value)} placeholder="e.g. uid-001" />
            </div>
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button disabled={saving} onClick={handleAdd}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Record</DialogTitle></DialogHeader>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button disabled={saving} onClick={handleEdit}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Push"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALLOCATE DIALOG */}
      <Dialog open={!!allocateDialog} onOpenChange={() => setAllocateDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Allocate to Replicas</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Select which replica configs to sync <strong>{allocateDialog?.Name}</strong> to:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {configs.map((config) => (
              <div key={config.id} className="flex items-center gap-2">
                <Checkbox
                  id={config.id}
                  checked={allocatedIds.includes(config.id)}
                  onCheckedChange={(checked) =>
                    setAllocatedIds((prev) => checked ? [...prev, config.id] : prev.filter((id) => id !== config.id))
                  }
                />
                <Label htmlFor={config.id}>{config.project_name}</Label>
              </div>
            ))}
            {configs.length === 0 && <p className="text-sm text-muted-foreground">No replica configs configured.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialog(null)}>Cancel</Button>
            <Button disabled={saving} onClick={handleAllocate}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Sync"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ARCHIVE CONFIRM DIALOG */}
      <Dialog open={!!archiveDialog} onOpenChange={() => setArchiveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Archive Record</DialogTitle></DialogHeader>
          <p className="text-sm">Are you sure you want to archive <strong>{archiveDialog?.Name}</strong>? It will be removed from all replicas.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialog(null)}>Cancel</Button>
            <Button variant="destructive" disabled={saving} onClick={handleArchive}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Archive"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}