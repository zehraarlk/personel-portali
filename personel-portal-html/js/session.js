/*
 * Oturum durumu — React frontend/src/auth/session.js birebir karşılığı.
 */
(function () {
  'use strict';

  var PERSONEL_KEY = 'personel_id';
  var YONETICI_KEY = 'yonetici_id';
  var OTURUM_KEY = 'oturum_id';
  var YONETICI_OTURUM_KEY = 'yonetici_oturum_id';
  var PROFILE_CACHE_KEY = 'portal_profile_cache';
  var PENDING_CLOSE_KEY = 'gebze_pending_session_close';
  var AUTH_CHANNEL = 'gebze-portal-auth';

  /** Eski localStorage kalıntılarını temizle (oturum artık sessionStorage) */
  function purgeLegacyLocalAuth() {
    try {
      localStorage.removeItem(PERSONEL_KEY);
      localStorage.removeItem(YONETICI_KEY);
      localStorage.removeItem(OTURUM_KEY);
      localStorage.removeItem(YONETICI_OTURUM_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  purgeLegacyLocalAuth();

  function read(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch (e) {
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
    } catch (e) {
      /* ignore */
    }
  }

  var channel = null;

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
  function broadcastAuth() {
    var ch = getChannel();
    if (!ch) return;
    try {
      ch.postMessage(snapshot());
    } catch (e) {
      /* ignore */
    }
  }

  function broadcastClear() {
    var ch = getChannel();
    if (!ch) return;
    try {
      ch.postMessage({ type: 'AUTH_CLEAR' });
    } catch (e) {
      /* ignore */
    }
  }

  /** Sessiz uygula (broadcast yok — döngüyü önlemek için) */
  function applyAuthFromPeer(data) {
    data = data || {};
    write(PERSONEL_KEY, data.personelId || '');
    write(YONETICI_KEY, data.yoneticiId || '');
    write(OTURUM_KEY, data.oturumId || '');
    write(YONETICI_OTURUM_KEY, data.yoneticiOturumId || '');
  }

  function getPersonelId() {
    return read(PERSONEL_KEY);
  }

  function setPersonelId(id) {
    write(PERSONEL_KEY, id);
    broadcastAuth();
  }

  function getYoneticiId() {
    return read(YONETICI_KEY);
  }

  function setYoneticiId(id) {
    write(YONETICI_KEY, id);
    broadcastAuth();
  }

  function getOturumId() {
    return read(OTURUM_KEY);
  }

  function setOturumId(id) {
    write(OTURUM_KEY, id);
    broadcastAuth();
  }

  function getYoneticiOturumId() {
    return read(YONETICI_OTURUM_KEY);
  }

  function setYoneticiOturumId(id) {
    write(YONETICI_OTURUM_KEY, id);
    broadcastAuth();
  }

  /** Login yanıtını cache'le — navbar ad/rol hemen doğru görünsün */
  function setProfileCache(profile) {
    try {
      if (!profile) {
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
        return;
      }
      sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } catch (e) {
      /* ignore */
    }
  }

  function getProfileCache() {
    try {
      var raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clearProfileCache() {
    setProfileCache(null);
  }

  /** Son sekme kapanırken localStorage bayrağı */
  function markPendingSessionClose(payload) {
    try {
      localStorage.setItem(
        PENDING_CLOSE_KEY,
        JSON.stringify(Object.assign({ t: Date.now() }, payload))
      );
    } catch (e) {
      /* ignore */
    }
  }

  function peekPendingSessionClose() {
    try {
      var raw = localStorage.getItem(PENDING_CLOSE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function consumePendingSessionClose() {
    try {
      var raw = localStorage.getItem(PENDING_CLOSE_KEY);
      localStorage.removeItem(PENDING_CLOSE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clearPendingSessionClose() {
    try {
      localStorage.removeItem(PENDING_CLOSE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  /** Personel oturumu (yalnızca site) */
  function isPersonelLoggedIn() {
    return Boolean(getPersonelId());
  }

  /** Yönetici oturumu (site + admin paneli) */
  function isYoneticiLoggedIn() {
    return Boolean(getYoneticiId());
  }

  function canAccessPortal() {
    return isPersonelLoggedIn() || isYoneticiLoggedIn();
  }

  function canAccessAdmin() {
    return isYoneticiLoggedIn();
  }

  function clearPersonelAuth() {
    write(PERSONEL_KEY, '');
    write(OTURUM_KEY, '');
    clearProfileCache();
    broadcastAuth();
  }

  function clearYoneticiAuth() {
    write(YONETICI_KEY, '');
    write(YONETICI_OTURUM_KEY, '');
    clearProfileCache();
    broadcastAuth();
  }

  function clearAuth() {
    write(PERSONEL_KEY, '');
    write(YONETICI_KEY, '');
    write(OTURUM_KEY, '');
    write(YONETICI_OTURUM_KEY, '');
    clearProfileCache();
    broadcastClear();
  }

  function authHeaders(extra) {
    var headers = Object.assign({}, extra || {});
    var personelId = getPersonelId();
    var yoneticiId = getYoneticiId();
    var oturumId = getOturumId();
    var yoneticiOturumId = getYoneticiOturumId();
    if (personelId) headers['X-Personel-Id'] = personelId;
    if (yoneticiId) headers['X-Yonetici-Id'] = yoneticiId;
    if (oturumId) headers['X-Oturum-Id'] = oturumId;
    if (yoneticiOturumId) headers['X-Yonetici-Oturum-Id'] = yoneticiOturumId;
    return headers;
  }

  window.Session = {
    AUTH_CHANNEL: AUTH_CHANNEL,
    PERSONEL_KEY: PERSONEL_KEY,
    YONETICI_KEY: YONETICI_KEY,
    OTURUM_KEY: OTURUM_KEY,
    YONETICI_OTURUM_KEY: YONETICI_OTURUM_KEY,
    PROFILE_CACHE_KEY: PROFILE_CACHE_KEY,
    PENDING_CLOSE_KEY: PENDING_CLOSE_KEY,
    broadcastAuth: broadcastAuth,
    applyAuthFromPeer: applyAuthFromPeer,
    getPersonelId: getPersonelId,
    setPersonelId: setPersonelId,
    getYoneticiId: getYoneticiId,
    setYoneticiId: setYoneticiId,
    getOturumId: getOturumId,
    setOturumId: setOturumId,
    getYoneticiOturumId: getYoneticiOturumId,
    setYoneticiOturumId: setYoneticiOturumId,
    setProfileCache: setProfileCache,
    getProfileCache: getProfileCache,
    clearProfileCache: clearProfileCache,
    markPendingSessionClose: markPendingSessionClose,
    peekPendingSessionClose: peekPendingSessionClose,
    consumePendingSessionClose: consumePendingSessionClose,
    clearPendingSessionClose: clearPendingSessionClose,
    isPersonelLoggedIn: isPersonelLoggedIn,
    isYoneticiLoggedIn: isYoneticiLoggedIn,
    canAccessPortal: canAccessPortal,
    canAccessAdmin: canAccessAdmin,
    clearPersonelAuth: clearPersonelAuth,
    clearYoneticiAuth: clearYoneticiAuth,
    clearAuth: clearAuth,
    authHeaders: authHeaders,
  };
})();
