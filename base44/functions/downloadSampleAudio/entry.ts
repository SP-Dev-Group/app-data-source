import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sample audio file URL (short public domain sample - more reliable)
    const sampleAudioUrl = "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav";
    
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