const PERSONEL_KEY = 'personel_id';
const YONETICI_KEY = 'yonetici_id';
const OTURUM_KEY = 'oturum_id';
const YONETICI_OTURUM_KEY = 'yonetici_oturum_id';
const AUTH_CHANNEL = 'gebze-portal-auth';

/** Eski localStorage kalıntılarını temizle (oturum artık sessionStorage) */
function purgeLegacyLocalAuth() {
  try {
    localStorage.removeItem(PERSONEL_KEY);
    localStorage.removeItem(YONETICI_KEY);
    localStorage.removeItem(OTURUM_KEY);
    localStorage.removeItem(YONETICI_OTURUM_KEY);
  } catch {
    /* ignore */
  }
}

purgeLegacyLocalAuth();

function read(key) {
  try {
    return sessionStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function write(key, value) {
  try {
    if (value == null || value === '') {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, String(value));
    }
  } catch {
    /* ignore */
  }
}

let channel = null;

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(AUTH_CHANNEL);
  }
  return channel;
}

function snapshot() {
  return {
    type: 'AUTH_SET',
    personelId: read(PERSONEL_KEY),
    yoneticiId: read(YONETICI_KEY),
    oturumId: read(OTURUM_KEY),
    yoneticiOturumId: read(YONETICI_OTURUM_KEY),
  };
}

/** Diğer sekmelere oturum değişimini bildir */
export function broadcastAuth() {
  const ch = getChannel();
  if (!ch) return;
  try {
    ch.postMessage(snapshot());
  } catch {
    /* ignore */
  }
}

function broadcastClear() {
  const ch = getChannel();
  if (!ch) return;
  try {
    ch.postMessage({ type: 'AUTH_CLEAR' });
  } catch {
    /* ignore */
  }
}

/** Sessiz uygula (broadcast yok — döngüyü önlemek için) */
export function applyAuthFromPeer({
  personelId = '',
  yoneticiId = '',
  oturumId = '',
  yoneticiOturumId = '',
} = {}) {
  write(PERSONEL_KEY, personelId || '');
  write(YONETICI_KEY, yoneticiId || '');
  write(OTURUM_KEY, oturumId || '');
  write(YONETICI_OTURUM_KEY, yoneticiOturumId || '');
}

export function getPersonelId() {
  return read(PERSONEL_KEY);
}

export function setPersonelId(id) {
  write(PERSONEL_KEY, id);
  broadcastAuth();
}

export function getYoneticiId() {
  return read(YONETICI_KEY);
}

export function setYoneticiId(id) {
  write(YONETICI_KEY, id);
  broadcastAuth();
}

export function getOturumId() {
  return read(OTURUM_KEY);
}

export function setOturumId(id) {
  write(OTURUM_KEY, id);
  broadcastAuth();
}

export function getYoneticiOturumId() {
  return read(YONETICI_OTURUM_KEY);
}

export function setYoneticiOturumId(id) {
  write(YONETICI_OTURUM_KEY, id);
  broadcastAuth();
}

/** Personel oturumu (yalnızca site) */
export function isPersonelLoggedIn() {
  return Boolean(getPersonelId());
}

/** Yönetici oturumu (site + admin paneli) */
export function isYoneticiLoggedIn() {
  return Boolean(getYoneticiId());
}

export function canAccessPortal() {
  return isPersonelLoggedIn() || isYoneticiLoggedIn();
}

export function canAccessAdmin() {
  return isYoneticiLoggedIn();
}

export function clearPersonelAuth() {
  write(PERSONEL_KEY, '');
  write(OTURUM_KEY, '');
  broadcastAuth();
}

export function clearYoneticiAuth() {
  write(YONETICI_KEY, '');
  write(YONETICI_OTURUM_KEY, '');
  broadcastAuth();
}

export function clearAuth() {
  write(PERSONEL_KEY, '');
  write(YONETICI_KEY, '');
  write(OTURUM_KEY, '');
  write(YONETICI_OTURUM_KEY, '');
  broadcastClear();
}

export function authHeaders(extra = {}) {
  const headers = { ...extra };
  const personelId = getPersonelId();
  const yoneticiId = getYoneticiId();
  if (personelId) headers['X-Personel-Id'] = personelId;
  if (yoneticiId) headers['X-Yonetici-Id'] = yoneticiId;
  return headers;
}

export { AUTH_CHANNEL, PERSONEL_KEY, YONETICI_KEY, OTURUM_KEY, YONETICI_OTURUM_KEY };
