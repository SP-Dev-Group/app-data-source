import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, sheetName, archiveSpreadsheetId, archiveSheetName, uniqueId, name, version } = await req.json();

    if (!spreadsheetId || !sheetName || !uniqueId || !name) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    // First, append the reinstated record back to the active sheet
    const appendRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/' + encodeURIComponent(sheetName) + ':append', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[uniqueId, name]],
        valueInputOption: 'RAW',
      }),
    });

    if (!appendRes.ok) {
      const err = await appendRes.json();
      return Response.json({ error: 'Failed to reinstate record: ' + JSON.stringify(err) }, { status: 500 });
    }

    // Then, log the reinstatement in the archive
    const nextVersion = (version || 1) + 1;
    const archiveRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + archiveSpreadsheetId + '/values/' + encodeURIComponent(archiveSheetName || 'Sheet1') + ':append', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[uniqueId, name, 'reinstated', nextVersion, new Date().toISOString()]],
        valueInputOption: 'RAW',
      }),
    });

    if (!archiveRes.ok) {
      const err = await archiveRes.json();
      return Response.json({ error: 'Reinstated but archive logging failed: ' + JSON.stringify(err) }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Record reinstated successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});