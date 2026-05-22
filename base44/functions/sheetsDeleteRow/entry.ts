import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, sheetName, rowIndex } = await req.json();

    if (!spreadsheetId || !sheetName || !rowIndex) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    // Delete the row using Google Sheets API batchUpdate
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // Will get actual sheet ID
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex,
                },
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ error: error.error?.message || 'Failed to delete row' }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});