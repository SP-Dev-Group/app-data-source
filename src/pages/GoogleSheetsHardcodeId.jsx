import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, RefreshCw, Wand2, Shield, Pencil, Trash2, Check, X, Archive } from "lucide-react";
import GoogleSheetsHardcodeIdInstructions from "@/components/GoogleSheetsHardcodeIdInstructions";
import GoogleSheetsHardcodeArchiveViewer from "@/components/GoogleSheetsHardcodeArchiveViewer";
import PageMeta from "@/components/PageMeta";

const SPREADSHEET_ID = "1oY8jrQvKDNlntcBpqQ0sk9fjotkeSDby8k3z1HsOUmg";
const SHEET_NAME = "Sheet1";
const ARCHIVE_SPREADSHEET_ID = "1PtjThbFY89u7_z7fowTsfm-xDV03I4IqFuTN_h_G18w";
const ARCHIVE_SHEET_NAME = "Archive";

function generateUID() {
  return "UID-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function GoogleSheetsHardcodeId() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState(['Unique ID', 'Name']);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addingSample, setAddingSample] = useState(false);
  const [error, setError] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const archiveRow = async (uniqueId, name, event, ver) => {
    await base44.functions.invoke("sheetsArchiveRow", {
      spreadsheetId: ARCHIVE_SPREADSHEET_ID,
      sheetName: ARCHIVE_SHEET_NAME,
      uniqueId, name, ver, event,
      date: new Date().toISOString(),
    });
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("sheetsReadRows", { spreadsheetId: SPREADSHEET_ID, sheetName: SHEET_NAME });
    if (res.data?.error) setError(res.data.error);
    else {
      setHeaders(res.data?.headers || ['Unique ID', 'Name']);
      setRows(res.data?.rows || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadRows(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    const newUid = generateUID();
    const res = await base44.functions.invoke("sheetsAppendRow", {
      spreadsheetId: SPREADSHEET_ID,
      sheetName: SHEET_NAME,
      uniqueId: newUid,
      name: name.trim(),
    });
    if (res.data?.error) setError(res.data.error);
    else {
      await archiveRow(newUid, name.trim(), "created", 1);
      setName(""); await loadRows();
    }
    setSubmitting(false);
  };

  const handleAddSample = async () => {
    setAddingSample(true);
    setError("");
    const sampleNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Theta"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)] + "-" + Math.floor(Math.random() * 1000);
    const newUid = generateUID();
    const res = await base44.functions.invoke("sheetsAppendRow", {
      spreadsheetId: SPREADSHEET_ID, sheetName: SHEET_NAME, uniqueId: newUid, name: randomName,
    });
    if (res.data?.error) setError(res.data.error);
    else { await archiveRow(newUid, randomName, "created", 1); await loadRows(); }
    setAddingSample(false);
  };

  const startEdit = (i) => {
    setEditingIdx(i);
    setEditName(rows[i].name);
    setDeleteConfirmIdx(null);
  };

  const cancelEdit = () => { setEditingIdx(null); setEditName(""); };

  const saveEdit = async (i) => {
    if (!editName.trim()) return;
    setSaving(true);
    setError("");
    const rowIndex = i + 2; // +1 for header, +1 for 1-based
    const res = await base44.functions.invoke("sheetsUpdateRow", {
      spreadsheetId: SPREADSHEET_ID, sheetName: SHEET_NAME,
      rowIndex, uniqueId: rows[i].unique_id, name: editName.trim(),
    });
    if (res.data?.error) setError(res.data.error);
    else { await archiveRow(rows[i].unique_id, editName.trim(), "updated", i + 2); cancelEdit(); await loadRows(); }
    setSaving(false);
  };

  const confirmDelete = (i) => { setDeleteConfirmIdx(i); setEditingIdx(null); };
  const cancelDelete = () => setDeleteConfirmIdx(null);

  const doDelete = async (i) => {
    setDeleting(true);
    setError("");
    const rowIndex = i + 1; // 0-based: header=0, first data row=1
    const res = await base44.functions.invoke("sheetsDeleteRow", {
      spreadsheetId: SPREADSHEET_ID, sheetName: SHEET_NAME, rowIndex,
    });
    if (res.data?.error) setError(res.data.error);
    else { await archiveRow(rows[i].unique_id, rows[i].name, "deleted", i + 2); setDeleteConfirmIdx(null); await loadRows(); }
    setDeleting(false);
  };

  return (
    <>
    <GoogleSheetsHardcodeArchiveViewer open={archiveOpen} onOpenChange={setArchiveOpen} />
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">

          <div className="flex items-center mb-8">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/googlesheetsMenu")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold">Google Sheets — Hard-coded ID</h1>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground">Spreadsheet ID: <span className="font-mono text-foreground">{SPREADSHEET_ID}</span> &nbsp;|&nbsp; Sheet: <span className="font-mono text-foreground">{SHEET_NAME}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-5 mb-6 space-y-4">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Add Record to Sheet</h2>
            <div className="flex gap-3">
              <Input placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
              <Button type="submit" disabled={submitting || !name.trim()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {submitting ? "Saving..." : "Submit"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">A unique ID will be auto-generated and written to column A, name to column B.</p>
          </form>

          {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="font-medium text-sm">Sheet Data <span className="text-muted-foreground">({rows.length} rows)</span></h2>
              <Button variant="ghost" size="icon" onClick={loadRows} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No rows found. Add a record above or click "Add Sample".</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    {headers.map((h, i) => <th key={i} className="text-left px-5 py-3 font-medium text-muted-foreground">{h}</th>)}
                    <th className="px-5 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.unique_id}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {editingIdx === i ? (
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-xs py-0" autoFocus />
                        ) : deleteConfirmIdx === i ? (
                          <span className="text-destructive font-medium">Delete "{r.name}"?</span>
                        ) : r.name}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {editingIdx === i ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => saveEdit(i)} disabled={saving}>
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : deleteConfirmIdx === i ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => doDelete(i)} disabled={deleting}>
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelDelete}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(i)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => confirmDelete(i)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
        <div className="w-56 border-l border-border bg-muted/20 p-4 flex flex-col gap-2 overflow-y-auto">
          <PageMeta
            page="GoogleSheetsHardcodeId.jsx"
            functions={["sheetsReadRows", "sheetsAppendRow", "sheetsUpdateRow", "sheetsDeleteRow"]}
            automations={[]}
            entities={[
              { name: "Sheet1", type: "external", db: "Google Sheets", spreadsheetId: "1oY8jrQvKDNlntcBpqQ0sk9fjotkeSDby8k3z1HsOUmg", sheet: "Sheet1" }
            ]}
          />
          <GoogleSheetsHardcodeIdInstructions />
          <Button onClick={() => setArchiveOpen(true)} variant="outline" size="sm" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </Button>
          <Button onClick={handleAddSample} disabled={addingSample} variant="outline" size="sm" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            {addingSample ? "Adding..." : "Add Sample"}
          </Button>
          <Button onClick={() => navigate("/googlesheetssecurity")} variant="outline" size="sm" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}