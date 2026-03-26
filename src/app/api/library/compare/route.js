export const dynamic = "force-dynamic";

const API_BASE = 'https://thefulcrumproject.org/agora';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const num = searchParams.get('num');
  if (!num) {
    return Response.json({ error: 'Missing num parameter' }, { status: 400 });
  }
  const res = await fetch(`${API_BASE}/library/compare/${num}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store' },
  });
}
