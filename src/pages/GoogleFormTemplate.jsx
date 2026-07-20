import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Wand2 } from "lucide-react";
import PageInfo from "@/components/PageInfo";

const PAGE_INFO = [
  { label: "Page", value: "pages/GoogleFormTemplate.jsx" },
  { label: "Entity", value: "GoogleData (Base44)" },
];

function generateUID() {
  return "UID-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function GoogleFormTemplate() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addingSample, setAddingSample] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    const data = await base44.entities.GoogleData.list("-created_date", 50);
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await base44.entities.GoogleData.create({
      unique_id: generateUID(),
      name: name.trim(),
    });
    setName("");
    await loadRecords();
    setSubmitting(false);
  };

  const handleAddSample = async () => {
    setAddingSample(true);
    const sampleNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Theta"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)] + "-" + Math.floor(Math.random() * 1000);
    await base44.entities.GoogleData.create({
      unique_id: generateUID(),
      name: randomName,
    });
    await loadRecords();
    setAddingSample(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center mb-8">
              <h1 className="text-2xl font-semibold">Google Data Form Template</h1>
            </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-5 mb-8 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Add Record Manually</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={submitting || !name.trim()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {submitting ? "Saving..." : "Submit"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">A unique ID will be automatically generated on submission.</p>
        </form>

        {/* Records Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30">
            <h2 className="font-medium text-sm">Records <span className="text-muted-foreground">({records.length})</span></h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No records yet. Add one above or click "Add Sample".</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Unique ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/10">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.unique_id}</td>
                    <td className="px-5 py-3">{r.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

          </div>
        </div>
        <div className="w-56 border-l border-border bg-muted/20 p-4 flex flex-col gap-2 overflow-y-auto">
          <PageInfo info={PAGE_INFO} />
          <Button
            onClick={handleAddSample}
            disabled={addingSample}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {addingSample ? "Adding..." : "Add Sample"}
          </Button>
        </div>
      </div>
    </div>
  );
}