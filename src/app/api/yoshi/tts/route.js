export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const voice = searchParams.get('voice') || 'es-US-PalomaNeural';

  if (!text) {
    return new Response(JSON.stringify({ error: 'text required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(
    `https://thefulcrumproject.org/agora/yoshi/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'TTS failed' }), {
      status: res.status, headers: { 'Content-Type': 'application/json' },
    });
  }

  const audioBuffer = await res.arrayBuffer();
  return new Response(audioBuffer, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=3600' },
  });
}
