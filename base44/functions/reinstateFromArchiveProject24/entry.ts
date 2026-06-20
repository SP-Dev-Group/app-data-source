import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { archiveId } = await req.json();
        if (!archiveId) return Response.json({ error: 'archiveId required' }, { status: 400 });

        const archives = await base44.asServiceRole.entities.SSOT24Archive.filter({ id: archiveId });
        if (!archives || archives.length === 0) return Response.json({ error: 'Archive record not found' }, { status: 404 });

        const archive = archives[0];

        const existing = await base44.asServiceRole.entities.SSOT24.filter({ unique_id: archive.unique_id });
        if (existing && existing.length > 0) {
            return Response.json({ error: 'Record with this unique_id already exists' }, { status: 409 });
        }

        const newRecord = await base44.asServiceRole.entities.SSOT24.create({
            unique_id: archive.unique_id,
            Name: archive.Name,
            allocated_projects: [],
        });

        // Log version history
        const history = await base44.asServiceRole.entities.SSOT24VersionHistory.filter({ source_id: newRecord.id });
        await base44.asServiceRole.entities.SSOT24VersionHistory.create({
            source_id: newRecord.id,
            unique_id: newRecord.unique_id,
            Name: newRecord.Name,
            event_type: 'created',
            version: history.length + 1,
        });

        return Response.json({ success: true, record: newRecord });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});