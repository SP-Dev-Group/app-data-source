import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();

        const response = await fetch(
            'https://app.base44.com/apps/520c13746d8f46fc90a60bac992d287f/api/functions/syncToListener',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        const result = await response.json();
        return Response.json({ success: true, result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});