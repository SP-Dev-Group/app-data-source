import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@base44/sdk@0.8.25';

const CONTRACTORS_REPLICA_APP_ID = "6983b33e16b92a3afffe0fb8";

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
      appId: CONTRACTORS_REPLICA_APP_ID, 
      serviceRole: true 
    });

    const existing = await replicaClient.entities.ContractorsReplica.filter({ 
      unique_id: record.unique_id || record.id 
    });

    if (existing && existing.length > 0) {
      await replicaClient.entities.ContractorsReplica.update(existing[0].id, {
        name: record.name,
      });
    } else {
      await replicaClient.entities.ContractorsReplica.create({
        unique_id: record.unique_id || record.id,
        name: record.name,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});