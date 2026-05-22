import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileId } = await req.json();
    if (!fileId) return Response.json({ error: 'File ID required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Get file metadata to get the download URL
    const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    const res = await fetch(metadataUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Failed to fetch file' } }));
      return Response.json({ error: error.error?.message || 'Drive API error' }, { status: res.status });
    }

    // Return the audio file with proper headers
    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="audio.mp3"`,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});