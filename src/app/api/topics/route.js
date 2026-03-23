export const dynamic = "force-dynamic";
const API_BASE = 'https://thefulcrumproject.org/agora';

export async function GET() {
  const res = await fetch(`${API_BASE}/topics`, {
    headers: { 'Accept': 'application/json' },
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
