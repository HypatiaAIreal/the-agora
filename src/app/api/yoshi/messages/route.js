export const dynamic = "force-dynamic";

const API_BASE = 'https://thefulcrumproject.org/agora';

export async function GET() {
  const res = await fetch(`${API_BASE}/yoshi/messages?limit=50`, {
    cache: 'no-store',
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store' },
  });
}
