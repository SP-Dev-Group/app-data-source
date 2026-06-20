import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { archiveId } = await req.json();

        if (!archiveId) {
            return Response.json({ error: 'archiveId is required' }, { status: 400 });
        }

        // Get the archived record
        const archiveRecord = await base44.entities.SourceSSOT10Archive.get(archiveId);
        if (!archiveRecord) {
            return Response.json({ error: 'Archive record not found' }, { status: 404 });
        }

        // Check if a record with this unique_id already exists in active SSOT
        const existingRecords = await base44.entities.SourceSSOT10.filter({ unique_id: archiveRecord.unique_id });
        if (existingRecords && existingRecords.length > 0) {
            return Response.json({ error: 'A record with this unique_id already exists in active SSOT' }, { status: 400 });
        }

        // Reinstate the record
        const reinstatedRecord = await base44.entities.SourceSSOT10.create({
            unique_id: archiveRecord.unique_id,
            Name: archiveRecord.Name,
            allocated_projects: [], // Start with no allocations, user can re-allocate
        });

        // Create a version history entry for reinstatement
        const vhExisting = await base44.entities.SourceSSOT10VersionHistory.filter({ source_id: reinstatedRecord.id });
        const vhVersion = (vhExisting?.length || 0) + 1;
        await base44.entities.SourceSSOT10VersionHistory.create({
            source_id: reinstatedRecord.id,
            unique_id: archiveRecord.unique_id,
            Name: archiveRecord.Name,
            event_type: "reinstated",
            version: vhVersion,
        });

        return Response.json({ 
            success: true, 
            message: `Record "${archiveRecord.Name}" reinstated successfully`,
            record: reinstatedRecord 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});