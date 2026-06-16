// ========================================
// LAET IMPORTS - Frontend API client (no bundlers)
// ========================================

const API_BASE = window.API_BASE || '';

function _json(res) {
  if (!res.ok) {
    return res.json().catch(() => null).then(body => {
      const detail = body && (body.error || body.details) ? `: ${body.error || ''} ${body.details || ''}`.trim() : '';
      throw new Error(`HTTP ${res.status}${detail}`);
    });
  }
  return res.json();
}

function apiGet(path) {
  return fetch(`${API_BASE}${path}`, { method: 'GET' }).then(_json);
}

function apiPost(path, body) {
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  }).then(_json);
}

function apiPut(path, body) {
  return fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  }).then(_json);
}

function apiDel(path) {
  return fetch(`${API_BASE}${path}`, { method: 'DELETE' }).then(_json);
}

function getAuthHeaders() {
  const token = localStorage.getItem('laet-admin-token') || '';
  const role = localStorage.getItem('laet-admin-role') || 'editor';
  return {
    'x-admin-token': token,
    'x-admin-role': role,
  };
}

function apiAdminGet(path) {
  const headers = getAuthHeaders();
  return fetch(`${API_BASE}${path}`, { method: 'GET', headers }).then(_json);
}

function apiAdminPost(path, body) {
  const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  }).then(_json);
}

function apiAdminPut(path, body) {
  const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
  return fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body || {}),
  }).then(_json);
}

function apiAdminDel(path) {
  const headers = getAuthHeaders();
  return fetch(`${API_BASE}${path}`, { method: 'DELETE', headers }).then(_json);
}

async function apiAdminUploadImages(productId, files) {
  const fd = new FormData();
  Array.from(files || []).forEach(f => fd.append('images', f));

  const token = localStorage.getItem('laet-admin-token') || '';
  const role = localStorage.getItem('laet-admin-role') || 'editor';

  const res = await fetch(`${API_BASE}/api/admin/products/${productId}/images`, {
    method: 'POST',
    headers: {
      'x-admin-token': token,
      'x-admin-role': role,
    },
    body: fd,
  });
  return _json(res);
}

