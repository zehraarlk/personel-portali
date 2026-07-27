import {
  clearPendingSessionClose,
  getOturumId,
  getPersonelId,
  getYoneticiId,
  getYoneticiOturumId,
  markPendingSessionClose,
  peekPendingSessionClose,
  setOturumId,
  setProfileCache,
  setYoneticiOturumId,
} from './session';
import { resumeAuthSession } from '../api/client';

const TABS_KEY = 'portal_alive_tabs';
const TAB_ID_KEY = 'portal_tab_id';
const HEARTBEAT_MS = 2000;
/** Arka plan sekmelerinde timer throttle olduğu için geniş tut */
const STALE_MS = 60000;

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

/**
 * sendBeacon + FormData: JSON Content-Type CORS preflight tetiklemez.
 */
function beaconForm(url, fields) {
  try {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v != null && v !== '') fd.append(k, String(v));
    });
    if (typeof navigator.sendBeacon === 'function') {
      return navigator.sendBeacon(url, fd);
    }
  } catch {
    /* fall through */
  }
  try {
    const body = new URLSearchParams();
    Object.entries(fields).forEach(([k, v]) => {
      if (v != null && v !== '') body.append(k, String(v));
    });
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      keepalive: true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Son sekme kapanırken DB oturum satırını kapat (kapanis_tipi=sekme).
 */
export function beaconCloseDbSession() {
  const personelId = getPersonelId();
  const oturumId = getOturumId();
  const yoneticiId = getYoneticiId();
  const yoneticiOturumId = getYoneticiOturumId();

  if (oturumId && personelId) {
    beaconForm(`${API_BASE}/auth/logout/`, {
      oturum_id: oturumId,
      personel_id: personelId,
      kapanis_tipi: 'sekme',
    });
  }

  if (yoneticiOturumId && yoneticiId) {
    beaconForm(`${API_BASE}/auth/admin-logout/`, {
      oturum_id: yoneticiOturumId,
      yonetici_id: yoneticiId,
      kapanis_tipi: 'sekme',
    });
  }
}

let resumeInFlight = null;

/**
 * Yanlışlıkla kapanan DB oturumunu, hâlâ açık bir sekme varsa geri aç.
 */
export function recoverSessionIfNeeded() {
  if (!getPersonelId() && !getYoneticiId()) return Promise.resolve(false);

  const pending = peekPendingSessionClose();
  if (!pending) return Promise.resolve(false);

  clearPendingSessionClose();

  if (resumeInFlight) return resumeInFlight;

  resumeInFlight = resumeAuthSession()
    .then((data) => {
      if (data?.type === 'personel' && data.oturum_id) {
        setOturumId(data.oturum_id);
        if (data.personel) setProfileCache(data.personel);
      } else if (data?.type === 'yonetici' && data.oturum_id) {
        setYoneticiOturumId(data.oturum_id);
        if (data.yonetici) setProfileCache(data.yonetici);
      }
      return true;
    })
    .catch(() => false)
    .finally(() => {
      resumeInFlight = null;
    });

  return resumeInFlight;
}

/**
 * Sekme canlılık + son sekme kapanışı.
 * Kardeş sekme varken kapanış iptal edilir (heartbeat recover).
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

    // Başka sekme "son sekme" sanıp kapattıysa geri al
    if (getPersonelId() || getYoneticiId()) {
      recoverSessionIfNeeded();
    }
  };

  heartbeat();
  const timer = window.setInterval(heartbeat, HEARTBEAT_MS);

  const onPageHide = (event) => {
    if (stopped) return;
    if (event?.persisted) return;

    const tabs = pruneAndList(readTabs(), tabId);
    delete tabs[tabId];
    writeTabs(tabs);

    const others = Object.keys(tabs);
    // Başka canlı sekme varsa DB oturumuna dokunma
    if (others.length > 0) return;
    if (!getPersonelId() && !getYoneticiId()) return;

    markPendingSessionClose({
      personelId: getPersonelId(),
      yoneticiId: getYoneticiId(),
      oturumId: getOturumId(),
      yoneticiOturumId: getYoneticiOturumId(),
    });
    beaconCloseDbSession();
  };

  const onStorage = (event) => {
    if (stopped) return;
    if (event.key !== 'gebze_pending_session_close') return;
    if (!event.newValue) return;
    if (getPersonelId() || getYoneticiId()) {
      recoverSessionIfNeeded();
    }
  };

  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('storage', onStorage);

  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('storage', onStorage);
    // React StrictMode / HMR cleanup: bu sekmeyi listeden düşürme —
    // aksi halde "son sekme" sanılıp oturum kapanır.
  };
}

export { otherLiveTabs };
