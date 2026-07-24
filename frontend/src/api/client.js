import axios from 'axios';
import {
  authHeaders,
  canAccessPortal,
  getOturumId,
  getPersonelId,
  getYoneticiId,
  getYoneticiOturumId,
  isPersonelLoggedIn,
  isYoneticiLoggedIn,
} from '../auth/session';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default apiClient;

function jsonHeaders(extra = {}) {
  return authHeaders({ 'Content-Type': 'application/json', ...extra });
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

export async function fetchVideos(kategori = '') {
  const query = kategori
    ? `?kategori=${encodeURIComponent(kategori)}`
    : '';

  const response = await fetch(`${API_BASE}/videos/${query}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail || `Videolar alınamadı (${response.status})`
    );
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

export async function loginPersonel(payload) {
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || data.detail || 'Giriş başarısız');
  }
  return data;
}

export async function loginAdmin(payload) {
  const response = await fetch(`${API_BASE}/auth/admin-login/`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || data.detail || 'Giriş başarısız');
  }
  return data;
}

export async function forgotPassword(payload) {
  const response = await fetch(`${API_BASE}/auth/forgot-password/`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || data.detail || 'İşlem başarısız');
  }
  return data;
}

export async function logoutPersonel(options = {}) {
  const { kapanis_tipi = 'manuel' } = options;
  const payload = {
    kapanis_tipi,
    oturum_id: getOturumId() || undefined,
    personel_id: getPersonelId() || undefined,
  };
  const response = await fetch(`${API_BASE}/auth/logout/`, {
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

export async function fetchProfile() {
  const response = await fetch(`${API_BASE}/profile/`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Profil alınamadı');
  }
  return response.json();
}

export async function fetchAdminProfile() {
  const response = await fetch(`${API_BASE}/admin/profile/`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Yönetici profili alınamadı');
  }
  return response.json();
}

export async function fetchProfileSessions() {
  const response = await fetch(`${API_BASE}/profile/sessions/`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Oturum kayıtları alınamadı');
  }
  return response.json();
}

export async function changeEmail(payload) {
  const response = await fetch(`${API_BASE}/profile/change-email/`, {
    method: 'POST',
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Şifre güncellenemedi');
  }
  return data;
}

export async function fetchSizdenGelenler(kategori) {
  const qs = kategori ? `?kategori=${encodeURIComponent(kategori)}` : '';
  const response = await fetch(`${API_BASE}/sizden-gelenler/${qs}`);
  if (!response.ok) {
    throw new Error('Sizden gelenler alınamadı!');
  }
  return response.json();
}

export async function goruntulenmeArttir(id) {
  const response = await fetch(`${API_BASE}/sizden-gelenler/${id}/goruntule/`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Görüntülenme sayısı güncellenemedi');
  }
  return response.json();
}

/** etkinlikler — { durumlar: [...], etkinlikler: [...] } */
export async function fetchEtkinlikler(durum) {
  const qs = durum ? `?durum=${encodeURIComponent(durum)}` : '';
  const response = await fetch(`${API_BASE}/etkinlikler/${qs}`);
  if (!response.ok) {
    throw new Error('Etkinlikler alınamadı');
  }
  return response.json();
}

/** Etkinlikler > Duyurular — { kategoriler: [...], duyurular: [...] } */
export async function fetchDuyurular(kategori = '') {
  const qs = kategori
    ? `?kategori=${encodeURIComponent(kategori)}`
    : '';

  const response = await fetch(`${API_BASE}/duyurular/${qs}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail || `Duyurular alınamadı (${response.status})`
    );
  }

  return response.json();
}

/** protokoller — { protokoller: [...], toplam } (kaynaklar / Protokoller) */
export async function fetchProtokoller(q) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const response = await fetch(`${API_BASE}/protokoller/${qs}`);
  if (!response.ok) {
    throw new Error('Protokoller alınamadı');
  }
  return response.json();
}

export { canAccessPortal, isPersonelLoggedIn, isYoneticiLoggedIn } from '../auth/session';

/** mevzuatlar — { mevzuatlar: [...], toplam, alt_kategoriler: [...] } (kaynaklar / Mevzuatlar) */
export async function fetchMevzuatlar(q, altKategori) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (altKategori) params.set('alt_kategori', altKategori);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE}/mevzuatlar/${qs}`);
  if (!response.ok) {
    throw new Error('Mevzuatlar alınamadı');
  }
  return response.json();
}
