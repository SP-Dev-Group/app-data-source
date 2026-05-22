import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sample audio file URL (reliable CDN-hosted public domain sample)
    const sampleAudioUrl = "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c9c6a7c26b.mp3?filename=relaxing-piano-music-10446.mp3";
    
    const response = await fetch(sampleAudioUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sample audio: ${response.status} ${response.statusText}`);
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    // Return as WAV format (more universally supported)
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="sample-audio.wav"'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});