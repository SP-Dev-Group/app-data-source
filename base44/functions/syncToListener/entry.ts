import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        
        console.log("Full payload:", JSON.stringify(body, null, 2));
        
        // Entity automations wrap data in body.data
        const record = body.data || body;
        
        console.log("Extracted record:", JSON.stringify(record, null, 2));
        
        if (!record || !record.unique_id) {
            return Response.json({ 
                error: 'Missing required field: unique_id',
                received: record,
                fullBody: body
            }, { status: 400 });
        }

        const serviceRoleKey = Deno.env.get('DEST_APP_SERVICE_ROLE_KEY');
        
        if (!serviceRoleKey) {
            return Response.json({ error: 'DEST_APP_SERVICE_ROLE_KEY not configured' }, { status: 500 });
        }

        const response = await fetch('https://app.base44.com/apps/6a0a3ce671984e92b2b0f452/api/functions/syncToListener', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
                unique_id: record.unique_id,
                name: record.name,
                email: record.email,
            }),
        });

        const result = await response.json();
        
        if (!response.ok) {
            return Response.json({ error: result.error || 'Sync failed' }, { status: response.status });
        }
        
        return Response.json({ success: true, result });
    } catch (error) {
        console.error("Sync error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
