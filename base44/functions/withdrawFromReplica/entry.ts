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

    // Get replica config for this project
    const configs = await base44.asServiceRole.entities.SourceReplicaConfig.filter({ project_name });
    const config = configs.find(c => c.replica_app_id);

    if (!config) {
      return Response.json({ error: 'No config found for project: ' + project_name }, { status: 404 });
    }

    // Find and delete from replica app
    const replicaClient = createClient({ appId: config.replica_app_id, serviceRole: true });
    const entityName = config.replica_entity_name;

    const existing = await replicaClient.entities[entityName].filter({ unique_id });

    if (existing && existing.length > 0) {
      await replicaClient.entities[entityName].delete(existing[0].id);
      return Response.json({ success: true, action: 'withdrawn', project: project_name });
    } else {
      return Response.json({ success: true, action: 'not_found', project: project_name });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});