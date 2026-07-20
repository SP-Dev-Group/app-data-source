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

export default function PushEntityOnly() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(CODE_BLOCK);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

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

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
            <span className="text-sm font-medium text-muted-foreground">Backend Function Code — click to copy</span>
            <Button variant="outline" size="sm" onClick={copyCode}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <pre
            className="p-4 text-xs overflow-x-auto cursor-pointer"
            onClick={copyCode}
            title="Click anywhere to copy"
          >
            <code className="font-mono text-foreground whitespace-pre">{CODE_BLOCK}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}