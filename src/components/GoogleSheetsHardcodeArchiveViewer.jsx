import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Archive sheet for Hardcode page
const ARCHIVE_SPREADSHEET_ID = "1PtjThbFY89u7_z7fowTsfm-xDV03I4IqFuTN_h_G18w";
const ARCHIVE_SHEET_NAME = "Sheet1";

const EVENT_COLORS = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
  reinstated: "bg-purple-100 text-purple-700",
};

export default function GoogleSheetsHardcodeArchiveViewer({ open, onOpenChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError("");
      base44.functions.invoke("sheetsReadArchive", {
        spreadsheetId: ARCHIVE_SPREADSHEET_ID,
        sheetName: ARCHIVE_SHEET_NAME,
      }).then((res) => {
        if (res.data?.error) setError(res.data.error);
        else setRows(res.data?.rows || []);
        setLoading(false);
      });
    }
  }, [open]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.name?.toLowerCase().includes(q) ||
      r.unique_id?.toLowerCase().includes(q) ||
      r.event?.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Archive — Google Sheets Hard-coded</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name, ID or event…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        {error && <div className="bg-destructive/10 text-destructive text-xs rounded px-3 py-2 mb-2">{error}</div>}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Unique ID</th>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Ver</th>
                  <th className="text-left px-3 py-2 font-medium">Event</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/40">
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.unique_id}</td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">v{r.ver}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[r.event?.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                        {r.event}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.date ? new Date(r.date).toLocaleDateString() : ""}</td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No archive records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-muted-foreground pt-2">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
      </DialogContent>
    </Dialog>
  );
}