
async function request(path, options = {}) {

  let url = path;
  if (!/^https?:\/\//i.test(path)) {
    url = path.startsWith('/api/') ? path : `/api/${path.replace(/^\/+/, '')}`;
  }
  let opts = {
    credentials: 'include',
    ...options,
  };

  if (opts.body instanceof FormData) {
    // let it be
  } else if (opts.body && typeof opts.body === 'object') {
    opts.headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(opts.body);
  } else {
    opts.headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' };
  }
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') || '';
  let payload = null;
  if (ct.includes('application/json')) {
    payload = await res.json();
  } else {
    const txt = await res.text();
    payload = txt;
  }
  if (!res.ok) {
    const errMsg = (payload && typeof payload === 'object' && payload.error) ? payload.error : payload;
    const message = typeof errMsg === 'string' ? errMsg : 'Request failed';
    throw new Error(message + (typeof payload === 'string' && payload.trim().startsWith('<') ? ` -- response: ${payload.substring(0,200)}` : ''));
  }
  return payload;
}

export async function register({ username, email, password }) {
  return request('register.php', { method: 'POST', body: { username, email, password } });
}

export async function login({ email, password }) {
  return request('login.php', { method: 'POST', body: { email, password } });
}

export async function getPlaylists() {
  return request('playlists.php', { method: 'GET' });
}

export async function addPlaylist(data, isFormData = false) {
  return request('playlists.php', { method: 'POST', body: data });
}

export async function updatePlaylist(data) {
  return request('playlists.php', { method: 'PUT', body: data });
}

export async function deletePlaylist(id) {
  return request(`playlists.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getSongs(playlist_id) {
  return request(`songs.php?playlist_id=${encodeURIComponent(playlist_id)}`, { method: 'GET' });
}

export async function addSong(data) {
  return request('songs.php', { method: 'POST', body: data });
}

export async function updateSong(data) {
  return request('songs.php', { method: 'PUT', body: data });
}

export async function deleteSong(id) {
  return request(`songs.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function changePassword(current, nw) {
  return request('change_password.php', { method: 'POST', body: { current, new: nw } });
}

export default { request };
