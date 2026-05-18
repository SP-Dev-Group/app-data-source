import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus, Copy } from "lucide-react";
import DataMasterListenerInstructions from "@/components/DataMasterListenerInstructions";
import DataMasterListenerForm from "@/components/DataMasterListenerForm";

export default function DataMasterManual4() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const generateSample = async () => {
    setGenerating(true);
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const names = ["Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Emma Brown"];
    const name = names[Math.floor(Math.random() * names.length)];
    const email = `${name.split(" ")[0].toLowerCase()}.${uid.toLowerCase()}@example.com`;
    await base44.entities.DataMasterListener.create({ unique_id: uid, name, email });
    setGenerating(false);
    loadRecords();
  };

  const handleAddRecord = async (data) => {
    await base44.entities.DataMasterListener.create(data);
    setShowForm(false);
    loadRecords();
  };

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
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black flex items-center">
        <div className="h-full w-full bg-blue-400"></div>
      </div>
      <div className="absolute top-8 left-6">
        <div className="bg-black rounded-lg px-4 py-2">
          <span className="text-blue-400 font-medium">Data Master</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-mono text-muted-foreground">DataMasterManual4</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("DataMasterManual4");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="absolute top-8 right-6 flex flex-col gap-2">
        <Button variant="outline" onClick={() => navigate("/menu")}>← Menu</Button>
        <DataMasterListenerInstructions />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Close" : "Add Record"}
          </Button>
          <Button variant="outline" onClick={generateSample} disabled={generating}>
            {generating ? "Generating..." : "Generate Sample"}
          </Button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-light tracking-tight text-foreground text-center mb-2">
          Data Master Manual <span className="text-green-600 font-bold text-[10px] -mt-1">4</span>
        </h1>
        {showForm && <DataMasterListenerForm onSubmit={handleAddRecord} onCancel={() => setShowForm(false)} />}
        {!loading && <p className="text-xs text-muted-foreground mb-4">{records.length} record{records.length !== 1 ? 's' : ''}</p>}
        <div className="mb-4">
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