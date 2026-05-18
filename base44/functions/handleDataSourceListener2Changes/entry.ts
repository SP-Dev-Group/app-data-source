import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        
        // Entity automations wrap data in body.data
        // For delete events, body.data is null, use body.old_data
        const eventType = body.event?.type;
        const record = body.data || body.old_data || body;
        
        if (!record || !record.unique_id) {
            return Response.json({ 
                error: 'Missing required field: unique_id',
                eventType,
                hasData: !!body.data,
                hasOldData: !!body.old_data
            }, { status: 400 });
        }

        console.log(`DataSourceListener2 ${eventType} event:`, {
            unique_id: record.unique_id,
            name: record.name
        });

        // Process the event (add custom logic here if needed)
        // For now, just log and return success
        
        return Response.json({ 
            success: true, 
            message: `Processed ${eventType} event for DataSourceListener2`,
            data: {
                unique_id: record.unique_id,
                name: record.name,
                event_type: eventType
            }
        });
    } catch (error) {
        console.error("DataSourceListener2 error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});