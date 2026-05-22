import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Reads all rows from an archive Google Sheet.
// Archive sheet columns: Unique ID | Name | Ver | Event | Date
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { spreadsheetId, sheetName } = await req.json();
    if (!spreadsheetId) return Response.json({ error: 'Missing spreadsheetId' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const range = `${sheetName || 'Archive'}!A:E`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message || 'Sheets API error' }, { status: res.status });

    const values = data.values || [];
    // Skip header row
    const rows = values.slice(1).map((row) => ({
      unique_id: row[0] || '',
      name: row[1] || '',
      ver: row[2] ? parseInt(row[2], 10) : 0,
      event: row[3] || '',
      date: row[4] || '',
    }));

    return Response.json({ rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});