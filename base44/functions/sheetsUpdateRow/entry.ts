import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, sheetName, rowIndex, uniqueId, name } = await req.json();

    if (!spreadsheetId || !sheetName || !rowIndex) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    // Update the row using Google Sheets API
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A${rowIndex}:B${rowIndex}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[uniqueId, name]],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ error: error.error?.message || 'Failed to update row' }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});