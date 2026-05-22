import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function GoogleSheetsSecurity() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/googlesheetsMenu")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Security: Protect Sheets</h1>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">To protect the entire sheet:</h2>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</span>
                <span>Right-click the sheet tab at the bottom → <strong>"Protect sheet"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</span>
                <span>Set permissions → choose <strong>"Restrict who can edit this range"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</span>
                <span>Select <strong>"Only you"</strong> (or specific people) — this prevents others from editing or deleting data directly in the sheet</span>
              </li>
            </ol>
          </div>

          <hr className="border-border" />

          <div>
            <h2 className="text-lg font-semibold mb-3">To protect specific ranges/columns:</h2>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</span>
                <span>Select the cells/columns you want to protect</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</span>
                <span>Right-click → <strong>"Protect range"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</span>
                <span>Set permissions accordingly</span>
              </li>
            </ol>
          </div>

          <hr className="border-border" />

          <div>
            <h2 className="text-lg font-semibold mb-3">Additional options:</h2>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-0.5">•</span>
                <span><strong>Share the sheet as "View only"</strong> — users can see data but cannot edit at all (via Share → change role to "Viewer")</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 mt-0.5">•</span>
                <span><strong>Hide the sheet</strong> — right-click the tab → "Hide sheet" so casual users can't even see it</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}