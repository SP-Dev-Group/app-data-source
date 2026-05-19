import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import DataSourceLiveInstructions from "@/components/DataSourceLiveInstructions";
import DataSourceLiveErrorLogs from "@/components/DataSourceLiveErrorLogs";
import { Copy, Plus, ScrollText } from "lucide-react";

const logError = (source, error) => {
  base44.entities.DataSourceLiveErrorLog.create({
    source,
    message: error?.message || String(error),
    details: error?.stack || "",
    level: "error",
  });
};

export default function DataSourceLive() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  const createSample = async () => {
    setCreating(true);
    try {
      const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const names = ["Alpha Listener", "Beta Listener", "Gamma Listener", "Delta Listener", "Epsilon Listener"];
      const name = names[Math.floor(Math.random() * names.length)];
      await base44.entities.DataSourceLive.create({ unique_id: uid, name });
      loadRecords();
    } catch (err) {
      logError("createSample", err);
    } finally {
      setCreating(false);
    }
  };

  const loadRecords = () => {
    setLoading(true);
    base44.entities.DataSourceLive.list()
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        logError("loadRecords", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 py-12 relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-blue-400"></div>
      </div>
      <div className="absolute top-8 left-6">
        <div className="bg-black rounded-lg px-4 py-2">
          <span className="text-blue-400 font-medium">Data Source</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-muted-foreground">Entity: DataSourceLive</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("DataSourceLive");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      <DataSourceLiveErrorLogs open={logsOpen} onOpenChange={setLogsOpen} />
      <div className="absolute top-8 right-6 flex flex-col gap-2">
        <Button variant="outline" onClick={() => navigate("/menu")}>← Menu</Button>
        <DataSourceLiveInstructions />
        <Button variant="outline" onClick={() => setLogsOpen(true)} className="flex items-center gap-2">
          <ScrollText className="w-4 h-4" />
          Error Logs
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
      <div className="max-w-xl mx-auto pt-20">
        <div className="text-center mb-4">
          <div className="bg-orange-600 rounded-lg px-6 py-3 inline-block">
            <h1 className="text-3xl font-light tracking-tight text-white">Data Source Live</h1>
          </div>
          <p className="text-sm font-light text-muted-foreground mt-3">Event-based data tracking</p>
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