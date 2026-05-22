import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, RefreshCw, Wand2, Shield } from "lucide-react";
import GoogleSheetsManualSheetIdInstructions from "@/components/GoogleSheetsManualSheetIdInstructions";
import PageMeta from "@/components/PageMeta";

function generateUID() {
  return "UID-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function GoogleSheetsManualSheetId() {
  const navigate = useNavigate();

  const [spreadsheetId, setSpreadsheetId] = useState(() => localStorage.getItem("gs_spreadsheetId") || "");
  const [sheetName, setSheetName] = useState(() => localStorage.getItem("gs_sheetName") || "Sheet1");
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState(['Unique ID', 'Name']);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addingSample, setAddingSample] = useState(false);
  const [error, setError] = useState("");

  const saveConfig = () => {
    localStorage.setItem("gs_spreadsheetId", spreadsheetId);
    localStorage.setItem("gs_sheetName", sheetName);
  };

  const loadRows = async () => {
    if (!spreadsheetId.trim()) return;
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("sheetsReadRows", { spreadsheetId: spreadsheetId.trim(), sheetName: sheetName.trim() || "Sheet1" });
    if (res.data?.error) setError(res.data.error);
    else {
      setHeaders(res.data?.headers || ['Unique ID', 'Name']);
      setRows(res.data?.rows || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (spreadsheetId) loadRows();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !spreadsheetId.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await base44.functions.invoke("sheetsAppendRow", {
      spreadsheetId: spreadsheetId.trim(),
      sheetName: sheetName.trim() || "Sheet1",
      uniqueId: generateUID(),
      name: name.trim(),
    });
    if (res.data?.error) setError(res.data.error);
    else { setName(""); await loadRows(); }
    setSubmitting(false);
  };

  const handleAddSample = async () => {
    if (!spreadsheetId.trim()) return;
    setAddingSample(true);
    setError("");
    const sampleNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Theta"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)] + "-" + Math.floor(Math.random() * 1000);
    const res = await base44.functions.invoke("sheetsAppendRow", {
      spreadsheetId: spreadsheetId.trim(),
      sheetName: sheetName.trim() || "Sheet1",
      uniqueId: generateUID(),
      name: randomName,
    });
    if (res.data?.error) setError(res.data.error);
    else await loadRows();
    setAddingSample(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="fixed top-6 right-6 flex flex-col gap-2 z-50 w-40">
        <PageMeta
          page="GoogleSheetsManualSheetId.jsx"
          functions={["sheetsReadRows", "sheetsAppendRow"]}
          automations={[]}
          entities={[
            { name: "Sheet (user-defined)", type: "external", db: "Google Sheets", spreadsheetId: "Entered at runtime via UI", sheet: "Entered at runtime via UI" }
          ]}
        />
        <GoogleSheetsManualSheetIdInstructions />
        <Button onClick={handleAddSample} disabled={addingSample || !spreadsheetId.trim()} variant="outline" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          {addingSample ? "Adding..." : "Add Sample"}
        </Button>
        <Button onClick={() => navigate("/googlesheetssecurity")} variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </Button>
      </div>
      <div className="max-w-3xl mx-auto mr-48">

        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/googlesheetsMenu")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Google Sheets — Manual Sheet ID</h1>
          </div>
        </div>

        {/* Config */}
        <div className="bg-card border rounded-lg p-5 mb-6 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Spreadsheet Config</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Spreadsheet ID (from Google Sheets URL)"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Sheet name (e.g. Sheet1)"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-40"
            />
            <Button variant="secondary" onClick={() => { saveConfig(); loadRows(); }}>Load</Button>
          </div>
          <p className="text-xs text-muted-foreground">Find the Spreadsheet ID in the Google Sheets URL: .../spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit</p>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-5 mb-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Add Record to Sheet</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={submitting || !name.trim() || !spreadsheetId.trim()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {submitting ? "Saving..." : "Submit"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">A unique ID will be auto-generated and written to column A, name to column B.</p>
        </form>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        {/* Rows Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-medium text-sm">Sheet Data <span className="text-muted-foreground">({rows.length} rows)</span></h2>
            <Button variant="ghost" size="icon" onClick={loadRows} disabled={loading || !spreadsheetId.trim()}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {spreadsheetId.trim() ? "No rows found. Add a record above or click \"Add Sample\"." : "Enter a Spreadsheet ID above and click Load."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  {headers.map((header, i) => (
                    <th key={i} className="text-left px-5 py-3 font-medium text-muted-foreground">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/10">
                    {headers.map((_, j) => (
                      <td key={j} className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {j === 0 ? r.unique_id : r.name}
                      </td>
                    ))}
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