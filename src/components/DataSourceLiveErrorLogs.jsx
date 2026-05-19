import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, AlertTriangle, Info, Trash2 } from "lucide-react";

const levelConfig = {
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-200" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
};

export default function DataSourceLiveErrorLogs({ open, onOpenChange }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = () => {
    setLoading(true);
    base44.entities.DataSourceLiveErrorLog.list("-created_date", 100).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  };

  const clearAllLogs = async () => {
    for (const log of logs) {
      await base44.entities.DataSourceLiveErrorLog.delete(log.id);
    }
    setLogs([]);
  };

  useEffect(() => {
    if (open) loadLogs();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Error Logs — DataSourceLive</DialogTitle>
            {logs.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllLogs} className="flex items-center gap-1 text-destructive hover:text-destructive">
                <Trash2 className="w-3 h-3" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No logs found.</p>
          ) : (
            logs.map((log) => {
              const cfg = levelConfig[log.level] || levelConfig.error;
              const Icon = cfg.icon;
              return (
                <div key={log.id} className={`rounded-lg border p-3 ${cfg.bg}`}>
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium text-foreground">{log.source}</span>
                        <span className={`text-xs uppercase font-semibold ${cfg.color}`}>{log.level}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(log.created_date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{log.message}</p>
                      {log.details && (
                        <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-all bg-white/60 rounded p-1">{log.details}</pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}