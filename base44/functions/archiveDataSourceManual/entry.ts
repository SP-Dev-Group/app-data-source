import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    const eventType = event?.type; // 'create', 'update', 'delete'
    const entityId = event?.entity_id;

    const recordData = data || old_data;
    if (!recordData) {
      return Response.json({ error: 'No record data in payload' }, { status: 400 });
    }

    // Find how many archive entries already exist for this source_id
    const existing = await base44.asServiceRole.entities.DataSourceManualArchive.filter({ source_id: entityId });
    const version = existing.length + 1;

    const archiveEntry = {
      source_id: entityId,
      unique_id: recordData.unique_id || '',
      name: recordData.name || '',
      email: recordData.email || '',
      event_type: eventType === 'create' ? 'created' : eventType === 'update' ? 'updated' : 'deleted',
      version,
    };

    await base44.asServiceRole.entities.DataSourceManualArchive.create(archiveEntry);

    return Response.json({ success: true, version });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});