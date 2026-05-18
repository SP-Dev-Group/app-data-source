import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        
        console.log("Received payload:", body);
        
        // Just return success for now - no cross-app call
        return Response.json({ 
            success: true, 
            received: true,
            payload: body
        });
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
