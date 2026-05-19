import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REPLICA_APP_URL = "https://spdatareplica.base44.app"; // Get this from your replica app's settings
const REPLICA_FUNCTION_ENDPOINT = "/api/function/syncToSourceListener";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const record = payload.data || payload;

    // Call the replica app's function
    const response = await fetch(REPLICA_APP_URL + REPLICA_FUNCTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("REPLICA_APP_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({
        unique_id: record.unique_id || record.id,
        name: record.name,
      })
    });

    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});