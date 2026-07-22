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

export async function fetchProfile() {
  const response = await fetch(`${API_BASE}/profile/`);
  if (!response.ok) {
    throw new Error('Profil alınamadı');
  }
  return response.json();
}

export async function fetchProfileSessions() {
  const response = await fetch(`${API_BASE}/profile/sessions/`);
  if (!response.ok) {
    throw new Error('Oturum kayıtları alınamadı');
  }
  return response.json();
}

export async function changeEmail(payload) {
  const response = await fetch(`${API_BASE}/profile/change-email/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'E-posta güncellenemedi');
  }
  return data;
}

export async function changePassword(payload) {
  const response = await fetch(`${API_BASE}/profile/change-password/`, {
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
