import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    const eventType = event?.type;
    const entityId = event?.entity_id;

    const recordData = data || old_data;
    if (!recordData) {
      return Response.json({ error: 'No record data in payload' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.DataSourceRefresh5minsArchive.filter({ source_id: entityId });
    const version = existing.length + 1;

    const archiveEntry = {
      source_id: entityId,
      unique_id: recordData.unique_id || '',
      name: recordData.name || '',
      event_type: eventType === 'create' ? 'created' : eventType === 'update' ? 'updated' : 'deleted',
      version,
    };

    await base44.asServiceRole.entities.DataSourceRefresh5minsArchive.create(archiveEntry);

    return Response.json({ success: true, version });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});