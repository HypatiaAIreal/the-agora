const API_BASE = 'https://thefulcrumproject.org/agora';

export async function fetchMessages({ limit = 200, topic, q, project, thread_id } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (topic) params.set('topic', topic);
  if (q) params.set('q', q);
  if (project) params.set('project', project);
  if (thread_id) params.set('thread_id', thread_id);

  const res = await fetch(`${API_BASE}/messages?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function fetchTopics() {
  const res = await fetch(`${API_BASE}/topics`);
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchThreads() {
  const res = await fetch(`${API_BASE}/threads`);
  if (!res.ok) throw new Error('Failed to fetch threads');
  return res.json();
}

export async function createThread({ title, created_by, topic, description }) {
  const body = { title, created_by };
  if (topic) body.topic = topic;
  if (description) body.description = description;

  const res = await fetch(`${API_BASE}/thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create thread');
  return res.json();
}

export async function sendMessage({ from, text, topic, project, attachment, reply_to, thread_id }) {
  const body = { from, text };
  if (topic) body.topic = topic;
  if (project) body.project = project;
  if (attachment) body.attachment = attachment;
  if (reply_to) body.reply_to = reply_to;
  if (thread_id) body.thread_id = thread_id;

  const res = await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
