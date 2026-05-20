import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Info, Copy, Check } from "lucide-react";

const codeSnippet = `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@base44/sdk@0.8.25';

const REPLICA_APP_ID = "6a0a3ce671984e92b2b0f452";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const record = payload.data || payload;

    const replicaClient = createClient({ 
      appId: REPLICA_APP_ID, 
      serviceRole: true 
    });

    const existing = await replicaClient.entities.DataReplicaLive.filter({ 
      unique_id: record.unique_id || record.id 
    });

    if (existing && existing.length > 0) {
      await replicaClient.entities.DataReplicaLive.update(existing[0].id, {
        name: record.name,
      });
    } else {
      await replicaClient.entities.DataReplicaLive.create({
        unique_id: record.unique_id || record.id,
        name: record.name,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;

export default function DataSourceLiveInstructions() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Info className="h-4 w-4" />
        Source Instructions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Replica Live — Source App Setup</DialogTitle>
            <DialogDescription>
              The simplest method: The source app pushes data directly to the replica app's entity using the Base44 SDK whenever a record changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">

            <div className="grid grid-cols-2 gap-2 bg-muted/50 rounded-lg p-3 text-xs">
              <div><span className="font-semibold text-foreground">Entity:</span> DataReplicaLive</div>
              <div><span className="font-semibold text-foreground">Function:</span> syncToSourceListener</div>
              <div><span className="font-semibold text-foreground">Automation:</span> none</div>
              <div><span className="font-semibold text-foreground">Menu:</span> Source Instructions</div>
            </div>

            <div className="space-y-2">
              <p><span className="font-semibold text-foreground">• Step 1:</span> In the source app, create an entity named <code className="bg-muted px-1 rounded text-xs">DataSourceLive</code> with fields: <code className="bg-muted px-1 rounded text-xs">unique_id</code> (string, required) and <code className="bg-muted px-1 rounded text-xs">name</code> (string, required).</p>
              <p><span className="font-semibold text-foreground">• Step 2:</span> In the source app, create a backend function named <code className="bg-muted px-1 rounded text-xs">pushToReplica</code> using the code snippet below. Update <code className="bg-muted px-1 rounded text-xs">REPLICA_APP_ID</code> to match your replica app's ID.</p>
              <p><span className="font-semibold text-foreground">• Step 3:</span> In the source app, create an Entity Automation — Entity: <code className="bg-muted px-1 rounded text-xs">DataSourceLive</code> | Events: create, update | Function: <code className="bg-muted px-1 rounded text-xs">pushToReplica</code></p>
              <p><span className="font-semibold text-foreground">• Step 4:</span> No setup needed on the replica app side beyond having the <code className="bg-muted px-1 rounded text-xs">DataReplicaLive</code> entity and <code className="bg-muted px-1 rounded text-xs">syncToSourceListener</code> function ready (see Replica Instructions).</p>
              <p><span className="font-semibold text-foreground">• Step 5:</span> No secrets needed — the Base44 SDK handles cross-app authentication via service role.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-800">
              <p className="font-semibold">🔑 REPLICA APP ID: <span className="font-mono">6a0a3ce671984e92b2b0f452</span></p>
              <p className="text-xs mt-1 text-yellow-700">(Reference this ID in communications about this sync)</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground text-xs">Code Snippet</span>
                <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1 h-7 text-xs">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                {codeSnippet}
              </pre>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}