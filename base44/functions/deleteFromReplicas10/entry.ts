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

    // Fetch the source record (still exists at this point)
    const records = await base44.asServiceRole.entities.SourceSSOT10.filter({ id: recordId });
    const record = records[0];

    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    const allocatedProjects = record.allocated_projects || [];
    const allConfigs = await base44.asServiceRole.entities.ReplicaAppConfig10.list();
    const targetConfigs = allConfigs.filter(c => allocatedProjects.includes(c.project_name));

    const results = { deleted: 0, errors: [] };

    for (const config of targetConfigs) {
      const secretKey = Deno.env.get(config.secret_name);
      if (!secretKey) {
        results.errors.push(`Missing secret: ${config.secret_name}`);
        continue;
      }

      const replicaClient = createClient({
        appId: config.replica_app_id,
        serviceRoleKey: secretKey,
      });

      const entityName = config.replica_entity_name;
      const existing = await replicaClient.entities[entityName].filter({ unique_id: record.unique_id });

      if (existing && existing.length > 0) {
        await replicaClient.entities[entityName].delete(existing[0].id);
        results.deleted++;
      }
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});