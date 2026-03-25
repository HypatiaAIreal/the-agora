export const dynamic = 'force-dynamic';

const API_BASE = 'https://thefulcrumproject.org/agora';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();
  const tag = searchParams.get('tag');
  const project = searchParams.get('project');
  if (tag) params.set('tag', tag);
  if (project) params.set('project', project);

  const url = `${API_BASE}/bookmarks${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store' },
  });
}
