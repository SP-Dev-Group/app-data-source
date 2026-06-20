import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { recordId } = await req.json();
        if (!recordId) return Response.json({ error: 'recordId required' }, { status: 400 });

        const records = await base44.asServiceRole.entities.SSOT24.filter({ id: recordId });
        if (!records || records.length === 0) return Response.json({ error: 'Record not found' }, { status: 404 });

        const record = records[0];
        const allocatedProjectIds = record.allocated_projects || [];

        let pushed = 0;
        const errors = [];

        for (const configId of allocatedProjectIds) {
            try {
                const configs = await base44.asServiceRole.entities.ReplicaAppConfigProject24.filter({ id: configId });
                const config = configs[0];
                if (!config) continue;

                const replicaClient = createClientFromRequest(req, { appId: config.replica_app_id, serviceRoleKey: config.secret_value });
                const normalizedRecord = { unique_id: record.unique_id, Name: record.Name };
                const existing = await replicaClient.asServiceRole.entities.SSOT24.filter({ unique_id: record.unique_id });
                if (existing && existing.length > 0) {
                    await replicaClient.asServiceRole.entities.SSOT24.update(existing[0].id, normalizedRecord);
                } else {
                    await replicaClient.asServiceRole.entities.SSOT24.create(normalizedRecord);
                }
                pushed++;
            } catch (err) {
                errors.push({ configId, error: err.message });
            }
        }

        return Response.json({ pushed, errors });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});