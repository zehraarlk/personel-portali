import {
  getOturumId,
  getPersonelId,
  getYoneticiId,
  getYoneticiOturumId,
} from './session';

const TABS_KEY = 'portal_alive_tabs';
const TAB_ID_KEY = 'portal_tab_id';
const HEARTBEAT_MS = 2000;
const STALE_MS = 8000;

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function now() {
  return Date.now();
}

function readTabs() {
  try {
    return JSON.parse(localStorage.getItem(TABS_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writeTabs(tabs) {
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  } catch {
    /* ignore */
  }
}

function getTabId() {
  try {
    let id = sessionStorage.getItem(TAB_ID_KEY);
    if (!id) {
      id = `t_${now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(TAB_ID_KEY, id);
    }
    return id;
  } catch {
    return `t_${now()}`;
  }
}

function pruneAndList(tabs, selfId) {
  const t = now();
  const live = {};
  Object.entries(tabs).forEach(([id, ts]) => {
    if (id === selfId || t - Number(ts) <= STALE_MS) {
      live[id] = ts;
    }
  });
  return live;
}

function otherLiveTabs(selfId) {
  const tabs = pruneAndList(readTabs(), selfId);
  return Object.keys(tabs).filter((id) => id !== selfId);
}

function beaconJson(url, payload) {
  try {
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (typeof navigator.sendBeacon === 'function') {
      return navigator.sendBeacon(url, body);
    }
  } catch {
    /* fall through */
  }
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Son sekme kapanırken DB oturum satırını kapat (kapanis_tipi=sekme).
 * sendBeacon özel header gönderemez → id'ler body'de.
 */
export function beaconCloseDbSession() {
  const personelId = getPersonelId();
  const oturumId = getOturumId();
  const yoneticiId = getYoneticiId();
  const yoneticiOturumId = getYoneticiOturumId();

  if (oturumId && personelId) {
    beaconJson(`${API_BASE}/auth/logout/`, {
      oturum_id: Number(oturumId),
      personel_id: Number(personelId),
      kapanis_tipi: 'sekme',
    });
  }

  if (yoneticiOturumId && yoneticiId) {
    beaconJson(`${API_BASE}/auth/admin-logout/`, {
      oturum_id: Number(yoneticiOturumId),
      yonetici_id: Number(yoneticiId),
      kapanis_tipi: 'sekme',
    });
  }
}

/**
 * Sekme canlılık kaydı + son sekme kapanışında DB logout.
 * Ek sekmeler kapanınca (ana/kardeş duruyorsa) DB oturumu kapanmaz.
 */
export function startSessionLifecycle() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const tabId = getTabId();
  let stopped = false;

  const heartbeat = () => {
    if (stopped) return;
    const tabs = pruneAndList(readTabs(), tabId);
    tabs[tabId] = now();
    writeTabs(tabs);
  };

  heartbeat();
  const timer = window.setInterval(heartbeat, HEARTBEAT_MS);

  const onPageHide = (event) => {
    if (stopped) return;
    // bfcache'e alınıyorsa kapatma
    if (event?.persisted) return;

    const tabs = pruneAndList(readTabs(), tabId);
    delete tabs[tabId];
    writeTabs(tabs);

    const others = Object.keys(tabs);
    // Başka canlı sekme yoksa → tarayıcı/son sekme kapanıyor
    if (others.length === 0 && (getPersonelId() || getYoneticiId())) {
      beaconCloseDbSession();
    }
  };

  // pagehide yeterli (beforeunload ile çift istek olmasın)
  window.addEventListener('pagehide', onPageHide);

  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener('pagehide', onPageHide);
  };
}
