import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const record = body.data || body;
        
        if (!record || !record.unique_id) {
            return Response.json({ error: 'Missing required field: unique_id' }, { status: 400 });
        }

        // Use service role to invoke the function on the other app
        const result = await base44.asServiceRole.functions.invoke('syncToListener', {
            unique_id: record.unique_id,
            name: record.name,
            email: record.email,
        }, {
            appId: '6a0a3ce671984e92b2b0f452'  // This app's ID
        });
        
        return Response.json({ success: true, result });
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});