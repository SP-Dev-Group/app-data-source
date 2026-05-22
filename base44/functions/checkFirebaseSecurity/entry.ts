import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (no user) and manual admin invocation
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_) {
      // Called from scheduler — treat as trusted
      isAdmin = true;
    }

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use LLM with internet context to check for current Firebase security best practices
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a security advisor. Search the web for the latest Firebase / Firestore security best practices, permission models, and any recent changes or advisories as of today.

Return a JSON object with:
- title: short title summarising the current security landscape (max 10 words)
- summary: 2-3 sentence overview of current best practices and any recent changes worth noting
- action_items: array of 4-6 specific, actionable security steps a developer should verify are in place (e.g. "Verify Firestore rules do not allow unauthenticated writes", "Confirm API key is restricted to your domain in Google Cloud Console")
- content_fingerprint: a short unique string that summarises the key points (used to detect if content has materially changed since last check)`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          action_items: { type: "array", items: { type: "string" } },
          content_fingerprint: { type: "string" }
        }
      }
    });

    if (!result?.title) {
      return Response.json({ error: 'LLM returned no content' }, { status: 500 });
    }

    // Check if we already have an alert with the same fingerprint (avoid duplicates)
    const existing = await base44.asServiceRole.entities.SecurityAlert.filter(
      { service: 'Firebase', source_hash: result.content_fingerprint }
    );

    if (existing && existing.length > 0) {
      return Response.json({ status: 'no_change', message: 'No material security changes detected since last check.' });
    }

    // Create new alert
    await base44.asServiceRole.entities.SecurityAlert.create({
      service: 'Firebase',
      title: result.title,
      summary: result.summary,
      action_items: result.action_items || [],
      google_side_actioned: false,
      our_side_actioned: false,
      read_confirmed: false,
      check_date: new Date().toISOString(),
      source_hash: result.content_fingerprint
    });

    return Response.json({ status: 'created', title: result.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});