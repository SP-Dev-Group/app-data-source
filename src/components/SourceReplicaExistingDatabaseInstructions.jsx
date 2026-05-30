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
            <DialogTitle className="text-base">Instructions for Creating Source-Replica with Existing Databases</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 text-sm mt-2">
            <p className="text-xs text-muted-foreground italic">
              In this setup, the source app pushes data directly to the replica app's entity using the Base44 SDK whenever a record changes.
            </p>

            {/* Source App */}
            <Section title="SOURCE APP INSTRUCTIONS">
              <div className="grid grid-cols-3 gap-2 text-xs bg-muted/40 rounded p-2 mb-1">
                <div><span className="text-muted-foreground">Entity:</span> <code className="font-mono">DataReplicaLive</code></div>
                <div><span className="text-muted-foreground">Function:</span> <code className="font-mono">syncToSourceListener</code></div>
                <div><span className="text-muted-foreground">Automation:</span> none</div>
              </div>
              <div className="space-y-2">
                <Step num="1">
                  In this, the source app, use the <strong>existing</strong> entity named {<Blank />} with fields: <code className="font-mono bg-muted px-1 rounded">unique_id</code> (string, required) and all other existing fields.
                </Step>
                <Step num="2">
                  In this, the source app, create a backend function named <code className="font-mono bg-muted px-1 rounded">pushToReplica</code> using the code snippet below. Update <code className="font-mono bg-muted px-1 rounded">REPLICA_APP_ID</code> to match your replica app's ID.
                </Step>
                <CopyBlock code={SOURCE_FUNCTION_CODE} />
                <Step num="3">
                  In this app, the source app, create an Entity Automation — Entity: <Blank /> | Events: create, update | Function: <code className="font-mono bg-muted px-1 rounded">pushToReplica</code>
                </Step>
                <Step num="4">
                  No setup needed on the replica app beyond having the <code className="font-mono bg-muted px-1 rounded">DataReplicaLive</code> entity and <code className="font-mono bg-muted px-1 rounded">syncToSourceListener</code> function ready (see Replica Instructions below).
                </Step>
                <Step num="5">
                  No secrets needed — the Base44 SDK handles cross-app authentication via service role.
                </Step>
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800 font-mono">
                  🔑 REPLICA APP ID: <span className="inline-block w-40 border-b border-amber-400 align-bottom"></span>
                  <p className="text-amber-600 font-sans mt-1">(Reference this ID in communications about this sync)</p>
                </div>
              </div>
            </Section>

            {/* Replica App */}
            <Section title="REPLICA APP INSTRUCTIONS">
              <p className="text-xs text-muted-foreground">This replica app receives live pushes directly from the source app. Follow these steps to replicate this setup in a new app.</p>
              <div className="space-y-2">
                <Step num="1">
                  Create a backend function named <code className="font-mono bg-muted px-1 rounded">syncToSourceListener</code> — use the code snippet below.
                </Step>
                <div className="text-xs text-muted-foreground px-7 italic">Replace <code className="font-mono bg-muted px-1 rounded">{"{ db }"}</code> with your existing entity name.</div>
                <CopyBlock code={REPLICA_FUNCTION_CODE} />
                <Step num="2">
                  Use the <strong>existing</strong> entity named <Blank /> with fields: <code className="font-mono bg-muted px-1 rounded">unique_id</code> (string, required) and all other fields.
                </Step>
                <Step num="3">
                  No automation needed on the replica side — the source app calls <code className="font-mono bg-muted px-1 rounded">syncToSourceListener</code> directly via the Base44 SDK.
                </Step>
                <Step num="4">
                  In the source app, set up the <code className="font-mono bg-muted px-1 rounded">pushToReplica</code> function and entity automation pointing to this replica app (see Source Instructions above).
                </Step>
                <Step num="5">
                  In the page that displays the table, add the frontend subscription snippet below — this makes the table auto-refresh live whenever the entity changes.
                </Step>
                <div className="text-xs text-muted-foreground px-7 italic">Replace <code className="font-mono bg-muted px-1 rounded">{"{ db }"}</code> with your existing entity name.</div>
                <CopyBlock code={FRONTEND_SUBSCRIPTION_CODE} />
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800 font-mono">
                  🔑🔑 REPLICA APP ID: <span className="inline-block w-40 border-b border-amber-400 align-bottom"></span>
                  <p className="text-amber-600 font-sans mt-1">(This is the ID referenced in source code communications)</p>
                </div>
              </div>
            </Section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}