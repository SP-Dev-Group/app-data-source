import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, RefreshCw, Wand2 } from "lucide-react";
import GoogleFirebaseInstructions from "@/components/GoogleFirebaseInstructions";
import GoogleFirebaseSecurity from "@/components/GoogleFirebaseSecurity";
import IAMSecurity from "@/components/IAMSecurity";
import SecurityAlerts from "@/components/SecurityAlerts";
import PageMeta from "@/components/PageMeta";

const COLLECTION = "records";

function generateUID() {
  return "UID-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function GoogleFirebase() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addingSample, setAddingSample] = useState(false);
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    const q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    setRows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    await addDoc(collection(db, COLLECTION), {
      unique_id: generateUID(),
      name: name.trim(),
      created_at: new Date().toISOString(),
    });
    setName("");
    await loadRows();
    setSubmitting(false);
  };

  const handleAddSample = async () => {
    setAddingSample(true);
    setError("");
    const sampleNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Theta"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)] + "-" + Math.floor(Math.random() * 1000);
    await addDoc(collection(db, COLLECTION), {
      unique_id: generateUID(),
      name: randomName,
      created_at: new Date().toISOString(),
    });
    await loadRows();
    setAddingSample(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="fixed top-6 right-6 flex flex-col gap-2 z-50 w-40">
        <PageMeta
          page="GoogleFirebase.jsx"
          functions={[]}
          automations={["Monthly Firebase Security Check → checkFirebaseSecurity (scheduled, 1st of month)"]}
          entities={[
            { name: "SecurityAlert", type: "base44" },
            { name: "records", type: "external", db: "Firebase Firestore", project: "sample-sp-2026", collection: "records" }
          ]}
        />
        <GoogleFirebaseInstructions />
        <GoogleFirebaseSecurity />
        <IAMSecurity service="Firebase" />
        <Button onClick={handleAddSample} disabled={addingSample} variant="outline" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          {addingSample ? "Adding..." : "Add Sample"}
        </Button>
      </div>

      <div className="max-w-3xl mx-auto mr-48">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/googlemenu")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Google Firebase — Firestore</h1>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <p className="text-xs text-muted-foreground">Project: <span className="font-mono text-foreground">sample-sp-2026</span> &nbsp;|&nbsp; Collection: <span className="font-mono text-foreground">{COLLECTION}</span></p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-5 mb-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Add Record to Firestore</h2>
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
          <p className="text-xs text-muted-foreground">A unique ID will be auto-generated and stored alongside the name in Firestore.</p>
        </form>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        {/* Security Alerts */}
        <div className="mb-6">
          <SecurityAlerts service="Firebase" />
        </div>

        {/* Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-medium text-sm">Firestore Data <span className="text-muted-foreground">({rows.length} records)</span></h2>
            <Button variant="ghost" size="icon" onClick={loadRows} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No records found. Add a record above or click "Add Sample".</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Unique ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Created At</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/10">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.unique_id}</td>
                    <td className="px-5 py-3 text-xs">{r.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}