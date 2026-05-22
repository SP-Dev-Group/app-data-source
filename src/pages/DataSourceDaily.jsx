import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RotateCcw, Pencil, Trash2, Check, X } from "lucide-react";
import DataSourceDailyInstructions from "@/components/DataSourceDailyInstructions";
import PageMeta from "@/components/PageMeta";

export default function DataSourceDaily() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const generateSample = async () => {
    setGenerating(true);
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const names = ["Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Emma Brown"];
    const name = names[Math.floor(Math.random() * names.length)];
    const email = `${name.split(" ")[0].toLowerCase()}.${uid.toLowerCase()}@example.com`;
    await base44.entities.DataSource2am.create({ unique_id: uid, name, email });
    setGenerating(false);
    loadRecords();
  };

  const loadRecords = () => {
    setLoading(true);
    base44.entities.DataSource2am.list().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditName(r.name);
    setEditEmail(r.email);
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  };

  const saveEdit = async (r) => {
    if (!editName.trim() || !editEmail.trim()) return;
    setSaving(true);
    await base44.entities.DataSource2am.update(r.id, { name: editName.trim(), email: editEmail.trim() });
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
    await base44.entities.DataSource2am.delete(id);
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
        <div className="h-full w-full bg-blue-600"></div>
      </div>
      <div className="absolute top-8 left-6">
        <div className="bg-black rounded-lg px-4 py-2">
          <span className="text-blue-400 font-medium">Data Source</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-blue-600">Entity: DataSource2am</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("DataSource2am");
            }}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-blue-600">Function: syncToListener</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("syncToListener");
            }}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 px-6 py-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-blue-600 rounded-lg px-6 py-3">
            <h1 className="text-3xl font-light tracking-tight text-white text-center">Data Source Daily at 2am</h1>
          </div>
        </div>

        <p className="text-sm font-light uppercase tracking-widest text-muted-foreground mb-2 text-center">Exposed Data</p>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => navigator.clipboard.writeText("App ID: 6a0a3a832f954c38e4a31c7b")}
            className="text-xs text-muted-foreground font-mono hover:text-foreground cursor-pointer transition-colors flex items-center gap-1"
            title="Click to copy"
          >
            <Copy className="w-3 h-3" />
            App ID: 6a0a3a832f954c38e4a31c7b
          </button>
          <button
            onClick={() => navigator.clipboard.writeText("6a0a3a832f954c38e4a31c7b")}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title="Copy ID only"
          >
            <Copy className="w-3 h-3" />
          </button>
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
                  <th className="text-left px-4 py-3 font-medium">Email</th>
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
                    <td className="px-4 py-3 text-muted-foreground">
                      {editingId === row.id ? (
                        <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-7 text-xs py-0" />
                      ) : deleteConfirmId === row.id ? (
                        <span className="text-xs text-destructive">{row.email}</span>
                      ) : row.email}
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
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No records found.</td>
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
              page="DataSourceDaily.jsx"
              functions={[]}
              automations={[]}
              entities={[
                { name: "DataSource2am", type: "base44" }
              ]}
            />
            <button
              onClick={() => navigator.clipboard.writeText("6a0a3a832f954c38e4a31c7b")}
              className="text-xs text-muted-foreground font-mono hover:text-foreground cursor-pointer transition-colors flex items-center gap-1"
              title="Copy ID only"
            >
              <Copy className="w-3 h-3" />
            </button>
            <Button variant="outline" size="sm" onClick={() => navigate("/menu")}>← Menu</Button>
          </div>
          <DataSourceDailyInstructions />
          <Button variant="outline" size="sm" onClick={generateSample} disabled={generating}>
            {generating ? "Generating..." : "Generate Sample"}
          </Button>
          <Button variant="outline" size="sm" onClick={loadRecords} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}