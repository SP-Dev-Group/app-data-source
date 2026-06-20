import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { recordUniqueId } = await req.json();
        if (!recordUniqueId) return Response.json({ error: 'recordUniqueId required' }, { status: 400 });

        const configs = await base44.asServiceRole.entities.ReplicaAppConfigProject24.filter({});
        let deleted = 0;
        const errors = [];

        for (const config of configs) {
            try {
                const replicaClient = createClientFromRequest(req, { appId: config.replica_app_id, serviceRoleKey: config.secret_value });
                const existing = await replicaClient.asServiceRole.entities.SSOT24.filter({ unique_id: recordUniqueId });
                if (existing && existing.length > 0) {
                    await replicaClient.asServiceRole.entities.SSOT24.delete(existing[0].id);
                    deleted++;
                }
            } catch (err) {
                errors.push({ config: config.project_name, error: err.message });
            }
        }

        return Response.json({ deleted, errors });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});