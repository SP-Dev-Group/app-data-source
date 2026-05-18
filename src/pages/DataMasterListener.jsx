import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import DataMasterListenerInstructions from "@/components/DataMasterListenerInstructions";

export default function DataMasterListener() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = () => {
    setLoading(true);
    base44.entities.DataMasterListener.list().then((data) => {
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
        <DataMasterListenerInstructions />
      </div>
      <div className="absolute top-4 right-6">
        <Button variant="outline" onClick={() => navigate("/menu")}>← Menu</Button>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-light tracking-tight text-foreground text-center">Data Master Listener</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadRecords}
            disabled={loading}
            className="h-8 w-8"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm font-light uppercase tracking-widest text-muted-foreground mb-8 text-center">Listener Data</p>
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