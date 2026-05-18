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

        // Sync to destination app using service role key (for apps with custom email/password auth)
        const serviceRoleKey = Deno.env.get("DEST_APP_SERVICE_ROLE_KEY2");
        if (!serviceRoleKey) {
            return Response.json({ error: 'DEST_APP_SERVICE_ROLE_KEY2 not configured' }, { status: 500 });
        }

        // Call destination app's backend function with service role authentication
        const appId = "6a0a3a832f954c38e4a31c7b"; // Destination app ID
        const response = await fetch(`https://app.base44.com/apps/${appId}/functions/syncToListener`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`
            },
            body: JSON.stringify({
                event: { type: eventType },
                data: {
                    unique_id: record.unique_id,
                    name: record.name
                }
            })
        });

        const syncResult = await response.json();
        
        return Response.json({ 
            success: true, 
            message: `Processed ${eventType} event for DataSourceListener2`,
            data: {
                unique_id: record.unique_id,
                name: record.name,
                event_type: eventType,
                sync_result: syncResult
            }
        });
    } catch (error) {
        console.error("DataSourceListener2 error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});