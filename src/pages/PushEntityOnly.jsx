import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const CODE_BLOCK = `import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.31';

// Replace this with your actual target App ID
const REPLICA_APP_ID = "6a4d0aee70984a9e20a2056b"; 

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Fetch all records from source
    const sourceRecords = await base44.entities.frontpagesample.list();

    // 2. Initialize replica client with App ID only
    const replicaClient = createClient({ 
      appId: REPLICA_APP_ID, 
      serviceRole: true 
    });

    // 3. Upsert into replica entity
    const results = [];
    for (const record of sourceRecords) {
      // Use record.unique_id as the filter key to identify the replica record
      const existing = await replicaClient.entities.frontpageartworkreplica.filter({ 
        unique_id: record.unique_id 
      });

      // Prepare data, ensuring the required 'original_id' is mapped
      const payload = {
        unique_id: record.unique_id,
        name: record.name,
        image_url: record.image_url,
        header_name: record.header_name,
        original_id: record.unique_id // Mapping source unique_id to required replica field
      };

      if (existing && existing.length > 0) {
        await replicaClient.entities.frontpageartworkreplica.update(existing[0].id, payload);
        results.push({ id: record.id, status: 'updated' });
      } else {
        await replicaClient.entities.frontpageartworkreplica.create(payload);
        results.push({ id: record.id, status: 'created' });
      }
    }

    return Response.json({ success: true, pushedCount: sourceRecords.length, details: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;

const CODE_BLOCK_SECRET = `import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Fetch all records from source
    const sourceRecords = await base44.entities.frontpagesample.list();

    // 2. Read the Replica App ID and the replica app's SERVICE ROLE KEY from secrets.
    //    Cross-app access requires the replica app's OWN service role key (serviceRole: true
    //    only uses the current app's key and cannot reach the replica's entities).
    //    Create two secrets in Settings → Secrets:
    //      - REPLICA_APP_ID              = the Replica App ID
    //      - REPLICA_APP_SERVICE_ROLE_KEY = the replica app's service role key
    const REPLICA_APP_ID = Deno.env.get("REPLICA_APP_ID");
    const REPLICA_KEY = Deno.env.get("REPLICA_APP_SERVICE_ROLE_KEY");
    if (!REPLICA_APP_ID || !REPLICA_KEY) {
      return Response.json({ error: "Secrets REPLICA_APP_ID and REPLICA_APP_SERVICE_ROLE_KEY must both be set." }, { status: 500 });
    }
    const replicaClient = createClientFromRequest(req, { 
      appId: REPLICA_APP_ID, 
      serviceRoleKey: REPLICA_KEY 
    });

    // 3. Upsert into replica entity (use asServiceRole for service-role-key auth)
    const results = [];
    for (const record of sourceRecords) {
      // Use record.unique_id as the filter key to identify the replica record
      const existing = await replicaClient.asServiceRole.entities.frontpageartworkreplica.filter({ 
        unique_id: record.unique_id 
      });

      // Prepare data, ensuring the required 'original_id' is mapped
      const payload = {
        unique_id: record.unique_id,
        name: record.name,
        image_url: record.image_url,
        header_name: record.header_name,
        original_id: record.unique_id // Mapping source unique_id to required replica field
      };

      if (existing && existing.length > 0) {
        await replicaClient.asServiceRole.entities.frontpageartworkreplica.update(existing[0].id, payload);
        results.push({ id: record.id, status: 'updated' });
      } else {
        await replicaClient.asServiceRole.entities.frontpageartworkreplica.create(payload);
        results.push({ id: record.id, status: 'created' });
      }
    }

    return Response.json({ success: true, pushedCount: sourceRecords.length, details: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;

export default function PushEntityOnly() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);

  const copyCode = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const renderCodeBlock = (code, title, key) => (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Button variant="outline" size="sm" onClick={() => copyCode(code, key)}>
          {copied === key ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied === key ? "Copied!" : "Copy"}
        </Button>
      </div>
      <pre
        className="p-4 text-xs overflow-x-auto cursor-pointer"
        onClick={() => copyCode(code, key)}
        title="Click anywhere to copy"
      >
        <code className="font-mono text-foreground whitespace-pre">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/base44menu")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Push Entity Only — App ID stored in function code</h1>
        </div>

        <div className="mb-4 p-3 rounded-md bg-muted border border-border text-sm text-muted-foreground">
          <strong className="text-foreground">Notes:</strong> Use the Replica App ID as the value for <code className="px-1 py-0.5 bg-background rounded text-foreground">REPLICA_APP_ID</code> in the function code below.
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">Method 1: App ID hardcoded in function code</h2>
            {renderCodeBlock(CODE_BLOCK, "Backend Function Code — click to copy", "method1")}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">Method 2: App ID stored as a secret (<code className="px-1 py-0.5 bg-muted rounded">REPLICA_APP_ID</code>)</h2>
            <p className="text-xs text-muted-foreground mb-2">In the app where this function runs, create a secret named <code className="px-1 py-0.5 bg-muted rounded">REPLICA_APP_ID</code> (Settings → Secrets) with the Replica App ID as its value.</p>
            {renderCodeBlock(CODE_BLOCK_SECRET, "Backend Function Code — click to copy", "method2")}
          </div>
        </div>
      </div>
    </div>
  );
}