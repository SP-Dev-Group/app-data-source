import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { recordId } = await req.json();

    if (!recordId) {
      return Response.json({ error: 'recordId required' }, { status: 400 });
    }

    // Fetch the source record
    const records = await base44.asServiceRole.entities.SourceSSOT10.filter({ id: recordId });
    const record = records[0];

    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    const allocatedConfigIds = record.allocated_projects || [];

    if (allocatedConfigIds.length === 0) {
      return Response.json({ pushed: 0, skipped: 0, message: 'No allocated replicas for this record' });
    }

    // Get all replica configs and filter by allocated config IDs
    const allConfigs = await base44.asServiceRole.entities.ReplicaAppConfig10.list();
    const targetConfigs = allConfigs.filter(c => allocatedConfigIds.includes(c.id));

    const { id, created_date, updated_date, created_by_id, allocated_projects, ...fields } = record;

    // Lowercase all keys to match replica schema
    const normalizedFields = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k.toLowerCase(), v])
    );

    const results = { pushed: 0, errors: [] };

    for (const config of targetConfigs) {
      const secretKey = config.secret_value;
      if (!secretKey) {
        results.errors.push(`Missing secret_value for ${config.project_name}`);
        continue;
      }

      const replicaClient = createClient({
        appId: config.replica_app_id,
        serviceRoleKey: secretKey,
      });

      const entityName = config.replica_entity_name;
      const existing = await replicaClient.entities[entityName].filter({ unique_id: record.unique_id });

      if (existing && existing.length > 0) {
        await replicaClient.entities[entityName].update(existing[0].id, normalizedFields);
      } else {
        await replicaClient.entities[entityName].create(normalizedFields);
      }
      results.pushed++;
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});