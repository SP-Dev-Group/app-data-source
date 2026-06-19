import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
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

    // Create client for replica app
    const replicaClient = createClient({ 
      appId: REPLICA_APP_ID, 
      serviceRole: true 
    });

    // Upsert to DataReplicaLive in replica app
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
});

