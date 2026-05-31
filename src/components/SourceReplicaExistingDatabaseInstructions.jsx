import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { DatabaseZap, Copy, Check } from "lucide-react";

const instructionContent = `INSTRUCTIONS FOR CREATING SOURCE REPLICA WITH 
EXISTING DATABASES

SOURCE APP INSTRUCTIONS

In this app, the source app, data is pushed directly to the replica app's entity using the Base44 SDK whenever a record changes.

Source Entity: SourceEntityName
Replica Entity: ReplicaEntityName
Function: syncSourceEntityToSourceListener
Function: pushtoReplicaEntityName
Replica App Set Secret Name: REPLICA_"  "_APP_ID
Replica App Set Secret Value as it's appID from API: REPLICA_"  "_APP_ID: value-here
Automation: none
Menu: Source Instructions

• Step 1: 
In this, the source app, use the existing entity named SourceEntityName with fields: unique_id (string, required) and all other existing fields..

• Step 2:
In this, the source app, create a backend function named pushtoReplicaEntityName using the code snippet below. In this app, source app, update REPLICA_"  "_APP_ID to match your replica app's ID.

• Step 3:
In this app, the source app, create an Entity Automation — Entity: {   } | Events: create, update | Function: pushtoReplicaEntityName

• Step 4:
No setup needed on replica app  beyond having the ReplicaEntityName entity and syncSourceEntityToSourceListener function ready (see Replica Instructions).

• Step 5:
No secrets needed — the Base44 SDK handles cross-app authentication via service role.
🔑 REPLICA APP ID: {                    }
(Reference this ID in communications about this sync)




THIS SCRIPT IS FOR "EXISTING" ENTITY / DATABASE

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@base44/sdk@0.8.25';

const REPLICA_"  "_APP_ID = "";

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
      appId: REPLICA_"  "_APP_ID, 
      serviceRole: true 
    });

    const existing = await replicaClient.entities.ReplicaEntityName.filter({ 
      unique_id: record.unique_id || record.id 
    });

    if (existing && existing.length > 0) {
      await replicaClient.entities.ReplicaEntityName.update(existing[0].id, {
        name: record.name,
      });
    } else {
      await replicaClient.entities.ReplicaEntityName.create({
        unique_id: record.unique_id || record.id,
        name: record.name,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});


REPLICA APP INSTRUCTIONS

Replica App Setup - Live
This replica app receives live pushes directly from the source app. Follow these steps to replicate this setup in a new app.
•Step 1: - Create a backend function named syncSourceEntityToSourceListener — use the code    snippet below.
•Step 2: - Use the existing entity named ReplicaEntityName with fields: unique_id (string, required) and all other fields.
•Step 3: 
- No automation needed on the replica side — the source app calls the function syncSourceEntityToSourceListener directly via the Base44 SDK.
•Step 4: In the source app, set up the pushtoReplicaEntityName function and entity automation pointing to this replica app (see Source Instructions).
•Step 5: In the page that displays the table, add the frontend subscription snippet below — this makes the table auto-refresh live whenever the entity changes.
🔑🔑 REPLICA APP ID: {                             }
       (This is the ID referenced in source code communications)


Step 1: Backend Function (syncSourceEntityToSourceListener)

"EXISTING" Entities

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const record = payload.data || payload;

    const existing = await base44.entities.{"  db   "}.filter({ 
      unique_id: record.unique_id 
    });

    if (existing && existing.length > 0) {
      await base44.entities.{"  db   "}.update(existing[0].id, {
        name: record.name,
      });
    } else {
      await base44.entities.{"  db   "}.create({
        unique_id: record.unique_id,
        name: record.name,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});


Step 5: Live Table Updates (Frontend Subscription)
Add this code to the page component that displays the table:

useEffect(() => {
  const unsubscribe = base44.entities.{"  db   "}.subscribe((event) => {
    console.log(\`{"  db   "} \${event.type}:\`, event.data);
    refetch();
  });

  return () => unsubscribe();
}, [refetch]);`;

export default function SourceReplicaExistingDatabaseInstructions() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(instructionContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs h-8 justify-start">
        <DatabaseZap className="h-3 w-3" />
        Source-Replica: Existing Databases
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold">Source-Replica: Existing Databases</DialogTitle>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Copy all"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </DialogHeader>

          <div className="space-y-4 text-xs mt-4 whitespace-pre-wrap font-mono leading-relaxed text-foreground">
            {instructionContent.split(/(SourceEntityName|ReplicaEntityName|syncSourceEntityToSourceListener|pushtoReplicaEntityName|REPLICA_"  "_APP_ID|unique_id|value-here)/g).map((part, idx) => 
              part === 'pushtoReplicaEntityName' ? 
                <span key={idx} className="text-orange-400 font-semibold">{part}</span> :
              part === 'ReplicaEntityName' ?
                <span key={idx} className="text-blue-600 font-semibold">{part}</span> :
              part === 'syncSourceEntityToSourceListener' ?
                <span key={idx} className="text-pink-300 font-semibold">{part}</span> :
              part === 'value-here' ?
                <span key={idx} className="text-red-600 font-semibold">{part}</span> :
              part === 'REPLICA_"  "_APP_ID' ?
                <span key={idx} className="text-red-600 font-semibold">{part}</span> :
              (part === 'SourceEntityName' || part === 'unique_id') ? 
                <span key={idx} className="text-green-400 font-semibold">{part}</span> : 
                <span key={idx}>{part}</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}