export const dynamic = "force-dynamic";

const API_BASE = 'https://thefulcrumproject.org/agora';

export async function GET(request, { params }) {
  const { num } = await params;
  const res = await fetch(`${API_BASE}/library/chapter/${num}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store' },
  });
}
