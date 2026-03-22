const API_BASE = 'https://thefulcrumproject.org/agora';

export async function GET() {
  const res = await fetch(`${API_BASE}/threads`, { cache: 'no-store' });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
