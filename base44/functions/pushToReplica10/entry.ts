import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    // configId: which ReplicaAppConfig10 record to use
    // records: optional array; if omitted, all SourceSSOT10 records are pushed
    const { configId, records: recordsOverride } = payload;

    if (!configId) {
      return Response.json({ error: 'configId is required' }, { status: 400 });
    }

    // Fetch the config from this (SSOT) app
    const configs = await base44.asServiceRole.entities.ReplicaAppConfig10.filter({ id: configId });
    if (!configs || configs.length === 0) {
      return Response.json({ error: 'ReplicaAppConfig10 record not found' }, { status: 404 });
    }
    const config = configs[0];

    const { replica_app_id, replica_entity_name, source_entity_name, secret_value } = config;

    if (!replica_app_id || !replica_entity_name || !source_entity_name || !secret_value) {
      return Response.json({ error: 'Config is incomplete — missing replica_app_id, replica_entity_name, source_entity_name, or secret_value' }, { status: 400 });
    }

    // Fetch source records from this app
    const sourceRecords = recordsOverride
      ? recordsOverride
      : await base44.asServiceRole.entities[source_entity_name].list();

    if (!sourceRecords || sourceRecords.length === 0) {
      return Response.json({ success: true, pushed: 0, message: 'No source records to push' });
    }

    // Connect to replica app using the stored secret value
    const replicaClient = createClient({
      appId: replica_app_id,
      token: secret_value,
    });

    let pushed = 0;
    let errors = [];

    for (const record of sourceRecords) {
      try {
        const uid = record.unique_id || record.id;
        const existing = await replicaClient.entities[replica_entity_name].filter({ unique_id: uid });

        const payload = { ...record };
        // Remove base44 system fields that shouldn't be copied
        delete payload.id;
        delete payload.created_date;
        delete payload.updated_date;
        delete payload.created_by_id;
        payload.unique_id = uid;

        if (existing && existing.length > 0) {
          await replicaClient.entities[replica_entity_name].update(existing[0].id, payload);
        } else {
          await replicaClient.entities[replica_entity_name].create(payload);
        }
        pushed++;
      } catch (err) {
        errors.push({ unique_id: record.unique_id || record.id, error: err.message });
      }
    }

    return Response.json({ success: true, pushed, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});