import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const fileBuffer = await file.arrayBuffer();

    // Create file metadata
    const metadata = { name: file.name, mimeType: file.type };

    // Multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metaPart = `Content-Type: application/json\r\n\r\n${JSON.stringify(metadata)}`;
    const filePart = `Content-Type: ${file.type}\r\n\r\n`;

    const encoder = new TextEncoder();
    const parts = [
      encoder.encode(delimiter + metaPart + delimiter + filePart),
      new Uint8Array(fileBuffer),
      encoder.encode(closeDelimiter),
    ];

    const totalLength = parts.reduce((sum, p) => sum + p.byteLength, 0);
    const body = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      body.set(part, offset);
      offset += part.byteLength;
    }

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body,
      }
    );

    const result = await uploadRes.json();
    if (!uploadRes.ok) return Response.json({ error: result.error?.message || 'Upload failed' }, { status: uploadRes.status });

    return Response.json({ file: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});