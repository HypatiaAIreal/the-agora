export const dynamic = "force-dynamic";

const API_BASE = 'https://thefulcrumproject.org/agora';

export async function POST(request) {
  const body = await request.text();
  const res = await fetch(`${API_BASE}/library/forge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cache: 'no-store',
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
