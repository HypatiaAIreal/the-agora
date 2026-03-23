export const dynamic = "force-dynamic";
const API_BASE = 'https://thefulcrumproject.org/agora';

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
