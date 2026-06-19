import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sourceAppId = Deno.env.get('SOURCE_APP_ID');
    if (!sourceAppId) {
      return Response.json({ error: 'SOURCE_APP_ID secret not configured' }, { status: 500 });
    }

    const sourceClient = createClient({ appId: sourceAppId, serviceRole: true });
    const staff = await sourceClient.entities.StaffSSOT.list('-created_date', 500);

    return Response.json({ staff });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});