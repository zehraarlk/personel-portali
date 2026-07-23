import axios from 'axios';
import { adminAuthHeaders, getYoneticiId, getYoneticiOturumId } from '../auth/session';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default apiClient;

function jsonHeaders(extra = {}) {
  return adminAuthHeaders({ 'Content-Type': 'application/json', ...extra });
}

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
  const response = await fetch(`${API_BASE}/admin/dashboard/`, {
    headers: adminAuthHeaders(),
  });
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

export async function listVideolar() {
  const response = await fetch(`${API_BASE}/admin/videolar/`);
  return parseJson(response);
}

export async function getVideo(id) {
  const response = await fetch(`${API_BASE}/admin/videolar/${id}/`);
  return parseJson(response);
}

export async function createVideo(payload) {
  const response = await fetch(`${API_BASE}/admin/videolar/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function updateVideo(id, payload) {
  const response = await fetch(`${API_BASE}/admin/videolar/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function deleteVideo(id) {
  const response = await fetch(`${API_BASE}/admin/videolar/${id}/`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    return parseJson(response);
  }
  return true;
}

export async function listVideoKategoriler() {
  const response = await fetch(`${API_BASE}/admin/videolar-kategoriler/`);
  return parseJson(response);
}

export async function listSizdenGelenler() {
  const response = await fetch(`${API_BASE}/admin/sizden-gelenler/`);
  return parseJson(response);
}

export async function getSizdenGelen(id) {
  const response = await fetch(`${API_BASE}/admin/sizden-gelenler/${id}/`);
  return parseJson(response);
}

export async function createSizdenGelen(payload) {
  const response = await fetch(`${API_BASE}/admin/sizden-gelenler/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function updateSizdenGelen(id, payload) {
  const response = await fetch(`${API_BASE}/admin/sizden-gelenler/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function deleteSizdenGelen(id) {
  const response = await fetch(`${API_BASE}/admin/sizden-gelenler/${id}/`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    return parseJson(response);
  }
  return true;
}

export async function listSizdenGelenKategoriler() {
  const response = await fetch(`${API_BASE}/admin/sizden-gelenler-kategoriler/`);
  return parseJson(response);
}

export async function fetchProfile() {
  const response = await fetch(`${API_BASE}/admin/profile/`, {
    headers: adminAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Yönetici profili alınamadı');
  }
  return response.json();
}

export async function fetchProfileSessions() {
  const response = await fetch(`${API_BASE}/admin/profile/sessions/`, {
    headers: adminAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Oturum kayıtları alınamadı');
  }
  return response.json();
}

export async function changePassword(payload) {
  const response = await fetch(`${API_BASE}/admin/profile/change-password/`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Şifre güncellenemedi');
  }
  return data;
}

export async function logoutAdmin(options = {}) {
  const { kapanis_tipi = 'manuel' } = options;
  const payload = {
    kapanis_tipi,
    oturum_id: getYoneticiOturumId() || undefined,
    yonetici_id: getYoneticiId() || undefined,
  };
  const response = await fetch(`${API_BASE}/auth/admin-logout/`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.detail || 'Çıkış yapılamadı');
  }
  return response.json().catch(() => ({ status: 'ok' }));
}
