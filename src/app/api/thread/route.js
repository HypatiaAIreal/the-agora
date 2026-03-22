const API_BASE = 'https://thefulcrumproject.org/agora';

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(`${API_BASE}/thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
