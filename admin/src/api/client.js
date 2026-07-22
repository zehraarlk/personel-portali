import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default apiClient;

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health/`);
  if (!response.ok) {
    throw new Error('API yanıt vermedi');
  }
  return response.json();
}

export async function fetchSystemStatus() {
  const response = await fetch(`${API_BASE}/system-status/`);
  if (!response.ok) {
    throw new Error('Sistem durumu alınamadı');
  }
  return response.json();
}

export async function fetchHomeDashboard() {
  const response = await fetch(`${API_BASE}/home/`);
  if (!response.ok) {
    throw new Error('Ana sayfa verileri alınamadı');
  }
  return response.json();
}

/** site_ikonlari — { icons: { anahtar: 'fas fa-...' }, items: [...] } */
export async function fetchSiteIcons(kategori) {
  const qs = kategori ? `?kategori=${encodeURIComponent(kategori)}` : '';
  const response = await fetch(`${API_BASE}/icons/${qs}`);
  if (!response.ok) {
    throw new Error('İkonlar alınamadı');
  }
  return response.json();
}

export async function fetchAdminDashboard() {
  const response = await fetch(`${API_BASE}/admin/dashboard/`);
  if (!response.ok) {
    throw new Error('Dashboard verileri alınamadı');
  }
  return response.json();
}

async function parseJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      data.detail ||
      (typeof data === 'object' ? Object.values(data).flat().join(' ') : null) ||
      'İstek başarısız';
    throw new Error(detail);
  }
  return data;
}

export async function listEtkinlikler() {
  const response = await fetch(`${API_BASE}/admin/etkinlikler/`);
  return parseJson(response);
}

export async function getEtkinlik(id) {
  const response = await fetch(`${API_BASE}/admin/etkinlikler/${id}/`);
  return parseJson(response);
}

export async function createEtkinlik(payload) {
  const response = await fetch(`${API_BASE}/admin/etkinlikler/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function updateEtkinlik(id, payload) {
  const response = await fetch(`${API_BASE}/admin/etkinlikler/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function deleteEtkinlik(id) {
  const response = await fetch(`${API_BASE}/admin/etkinlikler/${id}/`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    return parseJson(response);
  }
  return true;
}

export async function listDuyurular() {
  const response = await fetch(`${API_BASE}/admin/duyurular/`);
  return parseJson(response);
}

export async function getDuyuru(id) {
  const response = await fetch(`${API_BASE}/admin/duyurular/${id}/`);
  return parseJson(response);
}

export async function createDuyuru(payload) {
  const response = await fetch(`${API_BASE}/admin/duyurular/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function updateDuyuru(id, payload) {
  const response = await fetch(`${API_BASE}/admin/duyurular/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function deleteDuyuru(id) {
  const response = await fetch(`${API_BASE}/admin/duyurular/${id}/`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    return parseJson(response);
  }
  return true;
}

/** Görsel yükle → { path: '../images/uploads/...', url: '/images/uploads/...' } */
export async function uploadAdminImage(file) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_BASE}/admin/upload/`, {
    method: 'POST',
    body,
  });
  return parseJson(response);
}

export async function listPersoneller() {
  const response = await fetch(`${API_BASE}/admin/personeller/`);
  return parseJson(response);
}

export async function getPersonel(id) {
  const response = await fetch(`${API_BASE}/admin/personeller/${id}/`);
  return parseJson(response);
}

export async function createPersonel(payload) {
  const response = await fetch(`${API_BASE}/admin/personeller/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function updatePersonel(id, payload) {
  const response = await fetch(`${API_BASE}/admin/personeller/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function deletePersonel(id) {
  const response = await fetch(`${API_BASE}/admin/personeller/${id}/`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    return parseJson(response);
  }
  return true;
}

export async function listYoneticiler() {
  const response = await fetch(`${API_BASE}/admin/yoneticiler/`);
  return parseJson(response);
}

export async function getYonetici(id) {
  const response = await fetch(`${API_BASE}/admin/yoneticiler/${id}/`);
  return parseJson(response);
}

export async function createYonetici(payload) {
  const response = await fetch(`${API_BASE}/admin/yoneticiler/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function updateYonetici(id, payload) {
  const response = await fetch(`${API_BASE}/admin/yoneticiler/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function deleteYonetici(id) {
  const response = await fetch(`${API_BASE}/admin/yoneticiler/${id}/`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    return parseJson(response);
  }
  return true;
}

export async function fetchProfile() {
  const response = await fetch(`${API_BASE}/admin/profile/`);
  if (!response.ok) {
    throw new Error('Yönetici profili alınamadı');
  }
  return response.json();
}

export async function fetchProfileSessions() {
  const response = await fetch(`${API_BASE}/admin/profile/sessions/`);
  if (!response.ok) {
    throw new Error('Oturum kayıtları alınamadı');
  }
  return response.json();
}

export async function changePassword(payload) {
  const response = await fetch(`${API_BASE}/admin/profile/change-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Şifre güncellenemedi');
  }
  return data;
}
