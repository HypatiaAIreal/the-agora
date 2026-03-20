// All requests go through our Next.js API routes (same origin)
// This avoids CORS issues with the external API (duplicate headers)
const API_BASE = '/api';

export async function fetchMessages({ limit = 200, topic, q, project } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (topic) params.set('topic', topic);
  if (q) params.set('q', q);
  if (project) params.set('project', project);

  const url = `${API_BASE}/messages?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch messages failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.warn('[Agora] Messages response is not an array:', data);
    return [];
  }
  return data;
}

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error(`Fetch status failed: ${res.status}`);
  return res.json();
}

export async function fetchTopics() {
  const res = await fetch(`${API_BASE}/topics`);
  if (!res.ok) throw new Error(`Fetch topics failed: ${res.status}`);
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error(`Fetch projects failed: ${res.status}`);
  return res.json();
}

export async function sendMessage({ from, text, topic, project, attachment, reply_to }) {
  const body = { from, text };
  if (topic) body.topic = topic;
  if (project) body.project = project;
  if (attachment) body.attachment = attachment;
  if (reply_to) body.reply_to = reply_to;

  const res = await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Send message failed: ${res.status}`);
  return res.json();
}
