export const dynamic = "force-dynamic";

const API_BASE = 'https://thefulcrumproject.org/agora';

export async function POST(request) {
  const body = await request.text();
  const res = await fetch(`${API_BASE}/yoshi/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cache: 'no-store',
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
