import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { unique_id, project_name } = await req.json();

    if (!unique_id || !project_name) {
      return Response.json({ error: 'unique_id and project_name required' }, { status: 400 });
    }

    // Get source record from source app
    const sourceAppId = Deno.env.get('SOURCE_APP_ID');
    const sourceServiceKey = Deno.env.get('BASE44_SERVICE_ROLE_KEY');
    
    if (!sourceAppId) {
      return Response.json({ error: 'SOURCE_APP_ID not configured' }, { status: 500 });
    }
    if (!sourceServiceKey) {
      return Response.json({ error: 'BASE44_SERVICE_ROLE_KEY not configured' }, { status: 500 });
    }

    const sourceClient = createClient({ 
      appId: sourceAppId, 
      serviceRoleKey: sourceServiceKey
    });
    const sourceRecords = await sourceClient.entities.StaffSSOT.filter({ unique_id });

    if (!sourceRecords || sourceRecords.length === 0) {
      return Response.json({ error: 'Source record not found for unique_id: ' + unique_id }, { status: 404 });
    }

    const record = sourceRecords[0];
    const { id, created_date, updated_date, created_by_id, ...fields } = record;

    // Get replica config for this project
    const configs = await base44.asServiceRole.entities.SourceReplicaConfig.filter({ project_name });
    const config = configs.find(c => c.replica_app_id);

    if (!config) {
      return Response.json({ error: 'No config with replica_app_id found for project: ' + project_name }, { status: 404 });
    }

    // Push to replica app
    const replicaClient = createClient({ appId: config.replica_app_id, serviceRole: true });
    const entityName = config.replica_entity_name;

    const existing = await replicaClient.entities[entityName].filter({ unique_id });

    if (existing && existing.length > 0) {
      await replicaClient.entities[entityName].update(existing[0].id, fields);
      return Response.json({ success: true, action: 'updated', project: project_name });
    } else {
      await replicaClient.entities[entityName].create(fields);
      return Response.json({ success: true, action: 'created', project: project_name });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});