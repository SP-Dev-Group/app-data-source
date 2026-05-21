import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { spreadsheetId, sheetName } = await req.json();
    if (!spreadsheetId) return Response.json({ error: 'Missing spreadsheetId' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const range = `${sheetName || 'Sheet1'}!A:B`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message || 'Sheets API error' }, { status: res.status });

    const values = data.values || [];
    const headers = values.length > 0 ? values[0] : ['Unique ID', 'Name'];
    const rows = values.slice(1).map((row) => ({ unique_id: row[0] || '', name: row[1] || '' }));
    return Response.json({ headers, rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});