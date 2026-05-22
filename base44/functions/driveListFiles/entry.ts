import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { mimeTypePrefix } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const mimeQuery = mimeTypePrefix ? ` and mimeType contains '${mimeTypePrefix}'` : '';
    const query = `trashed = false${mimeQuery}`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,thumbnailLink,webViewLink,webContentLink)&orderBy=createdTime desc&pageSize=50`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();

    if (!res.ok) return Response.json({ error: data.error?.message || 'Drive API error' }, { status: res.status });

    return Response.json({ files: data.files || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});