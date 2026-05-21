import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { spreadsheetId, sheetName, uniqueId, name } = await req.json();
    if (!spreadsheetId || !uniqueId || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const range = `${sheetName || 'Sheet1'}!A:B`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [[uniqueId, name]] }),
      }
    );

    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message || 'Sheets API error' }, { status: res.status });

    return Response.json({ success: true, updatedRange: data.updates?.updatedRange });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});