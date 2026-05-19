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

        const serviceRoleKey = Deno.env.get('DEST_APP_SERVICE_ROLE_KEY');
        
        if (!serviceRoleKey) {
            return Response.json({ error: 'DEST_APP_SERVICE_ROLE_KEY not configured' }, { status: 500 });
        }

        console.log(`DataSourceLive ${eventType} event:`, {
            unique_id: record.unique_id,
            name: record.name
        });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const destAppId = '6a0a3a832f954c38e4a31c7b';
        const response = await fetch(`https://app.base44.com/apps/${destAppId}/functions/syncToSourceListener`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
                event: { type: eventType },
                data: {
                    unique_id: record.unique_id,
                    name: record.name,
                    email: record.email,
                }
            }),
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        const resultText = await response.text();
        let result;
        try { result = JSON.parse(resultText); } catch { result = { raw: resultText }; }
        
        if (!response.ok) {
            console.error(`Dest app responded ${response.status}:`, resultText);
            return Response.json({ error: result.error || 'Sync failed', status: response.status, detail: resultText }, { status: response.status });
        }
        
        return Response.json({ success: true, result });
    } catch (error) {
        console.error("Sync error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});