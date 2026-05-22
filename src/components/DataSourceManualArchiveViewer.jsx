import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Archive, Search, RotateCcw, Check, X } from "lucide-react";

const EVENT_COLORS = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
  reinstated: "bg-purple-100 text-purple-700",
};

export default function DataSourceManualArchiveViewer() {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [reinstateConfirmId, setReinstateConfirmId] = useState(null);
  const [reinstating, setReinstating] = useState(false);

  const loadArchive = async () => {
    setLoading(true);
    const data = await base44.entities.DataSourceManualArchive.list("-created_date", 500);
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadArchive();
  }, [open]);

  // Only show the latest archive entry per source_id that is "deleted" — these are reinstateable
  // Also figure out which source_ids are currently deleted (last event = deleted)
  const deletedSourceIds = (() => {
    // Group by source_id, find the latest event per source_id
    const latestBySource = {};
    records.forEach((r) => {
      const existing = latestBySource[r.source_id];
      if (!existing || new Date(r.created_date) > new Date(existing.created_date)) {
        latestBySource[r.source_id] = r;
      }
    });
    return new Set(
      Object.values(latestBySource)
        .filter((r) => r.event_type === "deleted")
        .map((r) => r.source_id)
    );
  })();

  const reinstate = async (archiveRecord) => {
    setReinstating(true);
    // Re-create the record in DataSourceManual
    const newRecord = await base44.entities.DataSourceManual.create({
      unique_id: archiveRecord.unique_id,
      name: archiveRecord.name,
      email: archiveRecord.email,
    });
    // Write a "reinstated" archive entry
    const existingForSource = records.filter((r) => r.source_id === archiveRecord.source_id);
    await base44.entities.DataSourceManualArchive.create({
      source_id: newRecord.id,
      unique_id: archiveRecord.unique_id,
      name: archiveRecord.name,
      email: archiveRecord.email,
      event_type: "reinstated",
      version: existingForSource.length + 1,
    });
    setReinstateConfirmId(null);
    setReinstating(false);
    await loadArchive();
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.unique_id?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.event_type?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Archive className="w-4 h-4" />
        Archive
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>DataSourceManual Archive</DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground -mt-1 mb-1">
            Records with the latest event marked <span className="font-semibold text-red-600">deleted</span> can be reinstated using the <RotateCcw className="inline w-3 h-3" /> button.
          </p>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, email or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">No archive records found.</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Ver</th>
                    <th className="text-left px-3 py-2 font-medium">Event</th>
                    <th className="text-left px-3 py-2 font-medium">Unique ID</th>
                    <th className="text-left px-3 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Email</th>
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filtered.map((r) => {
                    const isLatestDeleted = r.event_type === "deleted" && deletedSourceIds.has(r.source_id);
                    return (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{r.version}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_COLORS[r.event_type] || ""}`}>
                            {r.event_type}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{r.unique_id}</td>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.email}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {r.created_date ? new Date(r.created_date).toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-2">
                          {isLatestDeleted && reinstateConfirmId !== r.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 text-purple-600 hover:text-purple-700"
                              onClick={() => setReinstateConfirmId(r.id)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reinstate
                            </Button>
                          )}
                          {reinstateConfirmId === r.id && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2 text-green-600 hover:text-green-700"
                                disabled={reinstating}
                                onClick={() => reinstate(r)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => setReinstateConfirmId(null)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}