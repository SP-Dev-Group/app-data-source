import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RotateCcw, Check, X } from "lucide-react";

const EVENT_COLORS = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
  reinstated: "bg-purple-100 text-purple-700",
};

export default function DataSourceLiveArchiveViewer({ open, onOpenChange }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [reinstateConfirmId, setReinstateConfirmId] = useState(null);
  const [reinstating, setReinstating] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      base44.entities.DataSourceLiveArchive.list("-created_date", 200).then((data) => {
        setRecords(data);
        setLoading(false);
      });
    }
  }, [open]);

  const latestBySourceId = {};
  records.forEach((r) => {
    if (!latestBySourceId[r.source_id] || r.version > latestBySourceId[r.source_id].version) {
      latestBySourceId[r.source_id] = r;
    }
  });

  const reinstate = async (r) => {
    setReinstating(true);
    const newRecord = await base44.entities.DataSourceLive.create({
      unique_id: r.unique_id,
      name: r.name,
    });
    const existing = records.filter((x) => x.source_id === r.source_id);
    await base44.entities.DataSourceLiveArchive.create({
      source_id: newRecord.id,
      unique_id: r.unique_id,
      name: r.name,
      event_type: "reinstated",
      version: existing.length + 1,
    });
    setReinstateConfirmId(null);
    setReinstating(false);
    base44.entities.DataSourceLiveArchive.list("-created_date", 200).then(setRecords);
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.name?.toLowerCase().includes(q) ||
      r.unique_id?.toLowerCase().includes(q) ||
      r.event_type?.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Archive — DataSourceLive</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name, ID or event…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Ver</th>
                  <th className="text-left px-3 py-2 font-medium">Event</th>
                  <th className="text-left px-3 py-2 font-medium">Unique ID</th>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filtered.map((r) => {
                  const latest = latestBySourceId[r.source_id];
                  const isLatestDeleted = latest?.id === r.id && r.event_type === "deleted";
                  return (
                    <tr key={r.id} className="hover:bg-muted/40">
                      <td className="px-3 py-2 text-muted-foreground">v{r.version}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[r.event_type] || ""}`}>
                          {r.event_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{r.unique_id}</td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {r.created_date ? new Date(r.created_date).toLocaleDateString() : ""}
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No archive records found.</td>
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