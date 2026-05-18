import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RotateCcw, Plus, Copy } from "lucide-react";

export default function DataSourceListener2() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const createSample = async () => {
    setCreating(true);
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const names = ["Alpha System", "Beta Platform", "Gamma Service", "Delta Module", "Epsilon Core"];
    const name = names[Math.floor(Math.random() * names.length)];
    await base44.entities.DataSourceListener2.create({ unique_id: uid, name });
    setCreating(false);
    loadRecords();
  };

  const loadRecords = () => {
    setLoading(true);
    base44.entities.DataSourceListener2.list().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 py-12 relative">
      <div className="absolute top-4 left-6">
        <div className="bg-black rounded-lg px-4 py-2">
          <span className="text-blue-400 font-medium">Data Source</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-muted-foreground">DataSourceListener2</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("DataSourceListener2");
              toast.success("Entity name copied");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="absolute top-4 right-6 flex flex-col gap-2">
        <Button variant="outline" onClick={() => navigate("/menu")}>← Menu</Button>
        <Button
          variant="outline"
          onClick={loadRecords}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={createSample}
          disabled={creating}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creating..." : "Create Sample"}
        </Button>
      </div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-light tracking-tight text-foreground text-center mb-2">Data Source 'Listener Event' 2</h1>
        <p className="text-sm font-light uppercase tracking-widest text-muted-foreground mb-4 text-center">Listener Data</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.unique_id}</td>
                    <td className="px-4 py-3">{row.name}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}