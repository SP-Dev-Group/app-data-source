import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    // Support both:
    // 1. Manual push from UI: { record, source_entity_name, configId? }
    // 2. Entity automation trigger: { event, data, old_data }
    const isAutomation = !!payload.event;
    const record = isAutomation ? payload.data : payload.record;
    const configId = payload.configId;
    const source_entity_name = isAutomation ? payload.event?.entity_name : payload.source_entity_name;

    if (!record) {
      return Response.json({ error: 'Missing record in payload' }, { status: 400 });
    }

    // Load replica configs from this app (service role)
    const allConfigs = await base44.asServiceRole.entities.ReplicaAppConfig10.list();

    let configs = allConfigs;
    if (configId) {
      configs = allConfigs.filter((c) => c.id === configId);
    } else if (source_entity_name) {
      configs = allConfigs.filter((c) => c.source_entity_name === source_entity_name);
    }

    if (!configs || configs.length === 0) {
      return Response.json({ error: 'No matching replica configs found' }, { status: 404 });
    }

    const results = [];

    for (const config of configs) {
      const { replica_app_id, replica_entity_name, secret_value } = config;

      // Create a client for the replica app using its stored service role key
      const replicaClient = createClient({
        appId: replica_app_id,
        token: secret_value,
      });

      const entityApi = replicaClient.entities[replica_entity_name];
      if (!entityApi) {
        results.push({ config: config.project_name, error: `Entity ${replica_entity_name} not found on replica client` });
        continue;
      }

      // Build the data payload — map SSOT fields to replica fields
      const data = {
        unique_id: record.unique_id,
        Name: record.Name,
      };

      // Upsert: find by unique_id, update if exists, create otherwise
      const existing = await entityApi.filter({ unique_id: record.unique_id });

      if (existing && existing.length > 0) {
        await entityApi.update(existing[0].id, data);
        results.push({ config: config.project_name, action: 'updated' });
      } else {
        await entityApi.create(data);
        results.push({ config: config.project_name, action: 'created' });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});