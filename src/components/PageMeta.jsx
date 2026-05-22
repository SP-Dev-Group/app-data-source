import { useState } from "react";
import { Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Reusable page metadata popup.
 * Shows: Page filename, Functions invoked, Automations, Entities (Base44 or external).
 *
 * Usage:
 * <PageMeta
 *   page="GoogleFirebase.jsx"
 *   functions={["sheetsReadRows", "sheetsAppendRow"]}
 *   automations={["Monthly Firebase Security Check (checkFirebaseSecurity)"]}
 *   entities={[
 *     { name: "SecurityAlert", type: "base44" },
 *     { name: "records", type: "external", db: "Firebase Firestore", project: "sample-sp-2026", collection: "records" }
 *   ]}
 * />
 */
export default function PageMeta({ page, functions = [], automations = [], entities = [] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const Row = ({ label, value, copyKey }) => (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <span className="text-xs font-mono text-foreground flex-1 break-all">{value}</span>
      {copyKey && (
        <button onClick={() => copy(value, copyKey)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          {copied === copyKey ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </div>
  );

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs h-7 px-2">
        <Info className="h-3 w-3" />
        Page Info
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Page Metadata</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 text-sm">

            {/* Page file */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Page</p>
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <Row label="File" value={page} copyKey="page" />
              </div>
            </div>

            {/* Functions */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Functions <span className="text-muted-foreground font-normal normal-case tracking-normal">({functions.length})</span>
              </p>
              <div className="bg-muted/40 rounded-lg px-3 py-1">
                {functions.length === 0
                  ? <p className="text-xs text-muted-foreground py-1.5">None</p>
                  : functions.map((fn, i) => <Row key={i} label={`fn ${i + 1}`} value={fn} copyKey={`fn-${i}`} />)
                }
              </div>
            </div>

            {/* Automations */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Automations <span className="text-muted-foreground font-normal normal-case tracking-normal">({automations.length})</span>
              </p>
              <div className="bg-muted/40 rounded-lg px-3 py-1">
                {automations.length === 0
                  ? <p className="text-xs text-muted-foreground py-1.5">None</p>
                  : automations.map((a, i) => <Row key={i} label={`auto ${i + 1}`} value={a} copyKey={`auto-${i}`} />)
                }
              </div>
            </div>

            {/* Entities */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Entities <span className="text-muted-foreground font-normal normal-case tracking-normal">({entities.length})</span>
              </p>
              <div className="bg-muted/40 rounded-lg px-3 py-1 space-y-0">
                {entities.length === 0
                  ? <p className="text-xs text-muted-foreground py-1.5">None</p>
                  : entities.map((e, i) => (
                    <div key={i} className="border-b border-border last:border-0 py-2 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-foreground">{e.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.type === "base44" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>
                          {e.type === "base44" ? "Base44" : "External"}
                        </span>
                      </div>
                      {e.type === "external" && (
                        <div className="space-y-0.5 ml-1">
                          {e.db && <p className="text-xs text-muted-foreground">DB: <span className="font-mono text-foreground">{e.db}</span></p>}
                          {e.project && <p className="text-xs text-muted-foreground">Project: <span className="font-mono text-foreground">{e.project}</span></p>}
                          {e.collection && <p className="text-xs text-muted-foreground">Collection: <span className="font-mono text-foreground">{e.collection}</span></p>}
                          {e.spreadsheetId && <p className="text-xs text-muted-foreground">Spreadsheet ID: <span className="font-mono text-foreground">{e.spreadsheetId}</span></p>}
                          {e.sheet && <p className="text-xs text-muted-foreground">Sheet: <span className="font-mono text-foreground">{e.sheet}</span></p>}
                          {e.id && <p className="text-xs text-muted-foreground">ID: <span className="font-mono text-foreground">{e.id}</span></p>}
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}