import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw } from "lucide-react";

export default function DataMasterDaily() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const generateSample = async () => {
    setGenerating(true);
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const names = ["Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Emma Brown"];
    const name = names[Math.floor(Math.random() * names.length)];
    const email = `${name.split(" ")[0].toLowerCase()}.${uid.toLowerCase()}@example.com`;
    await base44.entities.DataMaster2am.create({ unique_id: uid, name, email });
    setGenerating(false);
    loadRecords();
  };

  const loadRecords = () => {
    setLoading(true);
    base44.entities.DataMaster2am.list().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 py-12 relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-blue-600"></div>
      </div>
      <div className="absolute top-8 left-6">
        <div className="bg-blue-600 rounded-lg px-4 py-2">
          <span className="text-white font-medium">Data Master</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-muted-foreground">Entity: DataMaster2am</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("DataMaster2am");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-muted-foreground">Function: syncToListener</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("syncToListener");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="absolute top-8 right-6 flex flex-col gap-2 items-end">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigator.clipboard.writeText("6a0a3a832f954c38e4a31c7b")}
            className="text-xs text-muted-foreground font-mono hover:text-foreground cursor-pointer transition-colors flex items-center gap-1"
            title="Copy ID only"
          >
            <Copy className="w-3 h-3" />
          </button>
          <Button variant="outline" onClick={() => navigate("/menu")}>← Menu</Button>
        </div>
        <Button variant="outline" onClick={generateSample} disabled={generating}>
          {generating ? "Generating..." : "Generate Sample"}
        </Button>
        <Button variant="outline" onClick={loadRecords} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-light tracking-tight text-foreground text-center">Data Master Daily at 2am</h1>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.unique_id}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
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
  );
}