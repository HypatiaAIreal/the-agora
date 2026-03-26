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

// Tags
export async function fetchTags() {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

export async function createTag({ name, type, color }) {
  const res = await fetch(`${API_BASE}/tag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, color }),
  });
  if (!res.ok) throw new Error('Failed to create tag');
  return res.json();
}

// Bookmarks
export async function fetchBookmarks({ tag, project } = {}) {
  const params = new URLSearchParams();
  if (tag) params.set('tag', tag);
  if (project) params.set('project', project);

  const url = `${API_BASE}/bookmarks${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch bookmarks');
  return res.json();
}

export async function createBookmark({ timestamp, thread_id, from, text_preview, tags, project, note }) {
  const body = { timestamp, thread_id, from, text_preview };
  if (tags && tags.length > 0) body.tags = tags;
  if (project) body.project = project;
  if (note) body.note = note;

  const res = await fetch(`${API_BASE}/bookmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create bookmark');
  return res.json();
}

export async function deleteBookmark(timestamp) {
  const res = await fetch(`${API_BASE}/bookmark`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp }),
  });
  if (!res.ok) throw new Error('Failed to delete bookmark');
  return res.json();
}

// Library
export async function fetchLibraryChapters() {
  const res = await fetch(`${API_BASE}/library/chapters`);
  if (!res.ok) throw new Error('Failed to fetch library chapters');
  return res.json();
}

export async function fetchLibraryChapter(num) {
  const res = await fetch(`${API_BASE}/library/chapter/${num}`);
  if (!res.ok) throw new Error('Failed to fetch chapter');
  return res.json();
}

export async function fetchLibraryCompare(num) {
  const res = await fetch(`${API_BASE}/library/compare/${num}`);
  if (!res.ok) throw new Error('Failed to fetch chapter comparison');
  return res.json();
}

// Auth
export async function verifyAuth(username, password) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

// Translation
export async function translateText(text, target = 'es') {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target }),
  });
  if (!res.ok) throw new Error('Failed to translate');
  return res.json();
}
