import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { DatabaseZap, Copy, Check } from "lucide-react";

const SOURCE_FUNCTION_CODE = `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@base44/sdk@0.8.25';

const REPLICA_APP_ID = "";

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

const REPLICA_FUNCTION_CODE = `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const record = payload.data || payload;

    const existing = await base44.entities.{ db }.filter({ 
      unique_id: record.unique_id 
    });

    if (existing && existing.length > 0) {
      await base44.entities.{ db }.update(existing[0].id, {
        name: record.name,
      });
    } else {
      await base44.entities.{ db }.create({
        unique_id: record.unique_id,
        name: record.name,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;

const FRONTEND_SUBSCRIPTION_CODE = `useEffect(() => {
  const unsubscribe = base44.entities.{ db }.subscribe((event) => {
    console.log(\`{ db } \${event.type}:\`, event.data);
    refetch();
  });

  return () => unsubscribe();
}, [refetch]);`;

function CopyBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
        title="Copy"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="whitespace-pre-wrap pr-6">{code}</pre>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Step({ num, children }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">{num}</span>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

function Blank() {
  return <span className="inline-block w-24 border-b border-foreground align-bottom mx-1" />;
}

export default function SourceReplicaExistingDatabaseInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs h-8 justify-start">
        <DatabaseZap className="h-3 w-3" />
        Source-Replica: Existing Databases
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Source-Replica: Existing Databases</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}