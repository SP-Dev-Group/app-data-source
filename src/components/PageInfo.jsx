import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info, Copy, Check } from "lucide-react";

/**
 * Reusable Page Info popup.
 * Pass `info` as an array of { label, value } objects.
 * Each row is click-to-copy.
 *
 * Example:
 * <PageInfo info={[
 *   { label: "Page", value: "pages/GoogleFirebase.jsx" },
 *   { label: "Function", value: "checkFirebaseSecurity" },
 *   { label: "Automation", value: "Monthly Firebase Security Check" },
 *   { label: "Entity", value: "SecurityAlert (Base44)" },
 *   { label: "Entity", value: "Firebase · Project: sample-sp-2026 · Collection: records" },
 * ]} />
 */
export default function PageInfo({ info = [] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const copy = (value, idx) => {
    navigator.clipboard.writeText(value);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Info className="h-4 w-4" />
        Page Info
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Page Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mt-1">
            {info.map((row, idx) => (
              <button
                key={idx}
                onClick={() => copy(row.value, idx)}
                className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-muted/60 transition-colors group"
              >
                <span className="text-xs font-semibold text-muted-foreground w-24 flex-shrink-0 pt-0.5">
                  {row.label}:
                </span>
                <span className="text-xs font-mono text-foreground flex-1 break-all">{row.value}</span>
                <span className="flex-shrink-0 mt-0.5">
                  {copied === idx
                    ? <Check className="h-3.5 w-3.5 text-green-500" />
                    : <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  }
                </span>
              </button>
            ))}
            {info.length === 0 && (
              <p className="text-sm text-muted-foreground px-3 py-4">No info defined for this page.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-1">Click any row to copy its value.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}