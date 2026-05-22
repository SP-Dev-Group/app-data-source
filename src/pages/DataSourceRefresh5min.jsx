import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Copy, Pencil, Trash2, Check, X } from "lucide-react";
import DataSourceListener2Instructions from "@/components/DataSourceListener2Instructions";
import PageMeta from "@/components/PageMeta";

export default function DataSourceRefresh5min() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createSample = async () => {
    setCreating(true);
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const names = ["Alpha System", "Beta Platform", "Gamma Service", "Delta Module", "Epsilon Core"];
    const name = names[Math.floor(Math.random() * names.length)];
    await base44.entities.DataSourceRefresh5mins.create({ unique_id: uid, name });
    setCreating(false);
    loadRecords();
  };

  const loadRecords = () => {
    setLoading(true);
    base44.entities.DataSourceRefresh5mins.list().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditName(r.name);
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (r) => {
    if (!editName.trim()) return;
    setSaving(true);
    await base44.entities.DataSourceRefresh5mins.update(r.id, { name: editName.trim() });
    cancelEdit();
    loadRecords();
    setSaving(false);
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
    setEditingId(null);
  };

  const cancelDelete = () => setDeleteConfirmId(null);

  const doDelete = async (id) => {
    setDeleting(true);
    await base44.entities.DataSourceRefresh5mins.delete(id);
    setDeleteConfirmId(null);
    loadRecords();
    setDeleting(false);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-blue-400"></div>
      </div>
      <div className="absolute top-8 left-6">
        <div className="bg-black rounded-lg px-4 py-2">
          <span className="text-blue-400 font-medium">Data Source</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-muted-foreground">Entity: DataSourceRefresh5mins</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("DataSourceRefresh5mins");
              toast.success("Entity name copied");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-muted-foreground">Function: functions/handleDataSourceListener2Changes.ts</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("functions/handleDataSourceListener2Changes.ts");
              toast.success("Function path copied");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 px-6 py-12 overflow-y-auto">
          <div className="max-w-xl mx-auto pt-20">
        <div className="text-center mb-4">
          <div className="bg-green-600 rounded-lg px-6 py-3 inline-block">
            <h1 className="text-3xl font-light tracking-tight text-white">Data Source Refresh every 5 mins</h1>
          </div>
          <p className="text-sm font-light text-muted-foreground mt-3">with Listener Event</p>
        </div>
        {!loading && <p className="text-xs text-muted-foreground mb-4">{records.length} record{records.length !== 1 ? 's' : ''}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Unique ID</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.unique_id}</td>
                    <td className="px-4 py-3">
                      {editingId === row.id ? (
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-xs py-0" autoFocus />
                      ) : deleteConfirmId === row.id ? (
                        <span className="text-destructive font-medium">Delete?</span>
                      ) : row.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {editingId === row.id ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => saveEdit(row)} disabled={saving}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : deleteConfirmId === row.id ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => doDelete(row.id)} disabled={deleting}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelDelete}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(row)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => confirmDelete(row.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
          </div>
        </div>
        <div className="w-56 border-l border-border bg-muted/20 p-4 flex flex-col gap-2 overflow-y-auto">
          <div className="flex gap-2 items-center justify-end flex-wrap">
            <PageMeta
              page="DataSourceRefresh5min.jsx"
              functions={[]}
              automations={[]}
              entities={[
                { name: "DataSourceRefresh5mins", type: "base44" }
              ]}
            />
            <Button variant="outline" size="sm" onClick={() => navigate("/menu")}>← Menu</Button>
          </div>
          <DataSourceListener2Instructions />
          <Button
            variant="outline"
            size="sm"
            onClick={createSample}
            disabled={creating}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {creating ? "Creating..." : "Create Sample"}
          </Button>
        </div>
      </div>
    </div>
  );
}