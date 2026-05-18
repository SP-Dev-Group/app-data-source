import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        
        // Extract event type and data from automation payload
        const eventType = body.event?.type;
        const record = body.data;
        
        // For delete events, use old_data since data is null
        const data = record || body.old_data;
        
        if (!data || !data.unique_id) {
            return Response.json({ error: 'Missing required field: unique_id' }, { status: 400 });
        }

        // Get this app's service role key from secrets
        const serviceRoleKey = Deno.env.get('BASE44_SERVICE_ROLE_KEY');
        
        if (!serviceRoleKey) {
            return Response.json({ error: 'BASE44_SERVICE_ROLE_KEY not set' }, { status: 500 });
        }
        
        // POST to this app's syncToListener endpoint
        const response = await fetch(
            'https://app.base44.com/apps/6a0a3ce671984e92b2b0f452/api/functions/syncToListener',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceRoleKey}`,
                },
                body: JSON.stringify({
                    event_type: eventType,
                    unique_id: data.unique_id,
                    name: data.name,
                    email: data.email,
                }),
            }
        );

        const result = await response.json();
        
        if (!response.ok) {
            return Response.json({ error: result.error || 'Failed to sync' }, { status: response.status });
        }
        
        return Response.json({ success: true, result });
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});