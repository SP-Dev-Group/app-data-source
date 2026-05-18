Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const record = body.data || body;
        
        if (!record || !record.unique_id) {
            return Response.json({ error: 'Missing required field: unique_id' }, { status: 400 });
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