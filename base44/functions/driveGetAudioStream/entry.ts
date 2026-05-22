import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileId } = await req.json();
    if (!fileId) return Response.json({ error: 'File ID required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // First, get file metadata to determine MIME type
    const metadataRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!metadataRes.ok) {
      const error = await metadataRes.json().catch(() => ({ error: { message: 'Failed to fetch file metadata' } }));
      return Response.json({ error: error.error?.message || 'Drive API error' }, { status: metadataRes.status });
    }

    const metadata = await metadataRes.json();
    const mimeType = metadata.mimeType || 'application/octet-stream';

    // Now get the file content
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Failed to fetch file' } }));
      return Response.json({ error: error.error?.message || 'Drive API error' }, { status: res.status });
    }

    // Return the file as base64 encoded JSON response
    const fileBuffer = await res.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Convert to base64 using proper binary encoding
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j]);
      }
    }
    const base64 = btoa(binary);
    
    return Response.json({ 
      data: base64,
      mimeType: mimeType
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});