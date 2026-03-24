export const dynamic = "force-dynamic";
const API_BASE = 'https://thefulcrumproject.org/agora';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    params.set(key, value);
  }
  const res = await fetch(`${API_BASE}/threads?${params.toString()}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store' },
  });
}
