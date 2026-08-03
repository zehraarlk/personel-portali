/*
 * Sekme canlılığı + son sekme kapanışı — React frontend/src/auth/sessionLifecycle.js karşılığı.
 */
(function () {
  'use strict';

  var TABS_KEY = 'portal_alive_tabs';
  var TAB_ID_KEY = 'portal_tab_id';
  var HEARTBEAT_MS = 2000;
  /** Arka plan sekmelerinde timer throttle olduğu için geniş tut */
  var STALE_MS = 60000;

  function now() {
    return Date.now();
  }

  function readTabs() {
    try {
      return JSON.parse(localStorage.getItem(TABS_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function writeTabs(tabs) {
    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    } catch (e) {
      /* ignore */
    }
  }

  function getTabId() {
    try {
      var id = sessionStorage.getItem(TAB_ID_KEY);
      if (!id) {
        id = 't_' + now() + '_' + Math.random().toString(36).slice(2, 9);
        sessionStorage.setItem(TAB_ID_KEY, id);
      }
      return id;
    } catch (e) {
      return 't_' + now();
    }
  }

  function pruneAndList(tabs, selfId) {
    var t = now();
    var live = {};
    Object.entries(tabs).forEach(function (entry) {
      var id = entry[0];
      var ts = entry[1];
      if (id === selfId || t - Number(ts) <= STALE_MS) {
        live[id] = ts;
      }
    });
    return live;
  }

  function otherLiveTabs(selfId) {
    var tabs = pruneAndList(readTabs(), selfId);
    return Object.keys(tabs).filter(function (id) {
      return id !== selfId;
    });
  }

  /**
   * sendBeacon + FormData: JSON Content-Type CORS preflight tetiklemez.
   */
  function beaconForm(url, fields) {
    try {
      var fd = new FormData();
      Object.entries(fields).forEach(function (entry) {
        if (entry[1] != null && entry[1] !== '') fd.append(entry[0], String(entry[1]));
      });
      if (typeof navigator.sendBeacon === 'function') {
        return navigator.sendBeacon(url, fd);
      }
    } catch (e) {
      /* fall through */
    }
    try {
      var body = new URLSearchParams();
      Object.entries(fields).forEach(function (entry) {
        if (entry[1] != null && entry[1] !== '') body.append(entry[0], String(entry[1]));
      });
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        keepalive: true,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Son sekme kapanırken DB oturum satırını kapat (kapanis_tipi=sekme).
   */
  function beaconCloseDbSession() {
    var personelId = Session.getPersonelId();
    var oturumId = Session.getOturumId();
    var yoneticiId = Session.getYoneticiId();
    var yoneticiOturumId = Session.getYoneticiOturumId();

    if (oturumId && personelId) {
      beaconForm(Portal.API_BASE + '/auth/logout/', {
        oturum_id: oturumId,
        personel_id: personelId,
        kapanis_tipi: 'sekme',
      });
    }

    if (yoneticiOturumId && yoneticiId) {
      beaconForm(Portal.API_BASE + '/auth/admin-logout/', {
        oturum_id: yoneticiOturumId,
        yonetici_id: yoneticiId,
        kapanis_tipi: 'sekme',
      });
    }
  }

  var resumeInFlight = null;

  /**
   * Yanlışlıkla kapanan DB oturumunu, hâlâ açık bir sekme varsa geri aç.
   */
  function recoverSessionIfNeeded() {
    if (!Session.getPersonelId() && !Session.getYoneticiId()) return Promise.resolve(false);

    var pending = Session.peekPendingSessionClose();
    if (!pending) return Promise.resolve(false);

    Session.clearPendingSessionClose();

    if (resumeInFlight) return resumeInFlight;

    resumeInFlight = Api.resumeAuthSession()
      .then(function (data) {
        if (data && data.type === 'personel' && data.oturum_id) {
          Session.setOturumId(data.oturum_id);
          if (data.personel) Session.setProfileCache(data.personel);
        } else if (data && data.type === 'yonetici' && data.oturum_id) {
          Session.setYoneticiOturumId(data.oturum_id);
          if (data.yonetici) Session.setProfileCache(data.yonetici);
        }
        return true;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        resumeInFlight = null;
      });

    return resumeInFlight;
  }

  /**
   * Sekme canlılık + son sekme kapanışı.
   * Kardeş sekme varken kapanış iptal edilir (heartbeat recover).
   */
  function startSessionLifecycle() {
    if (typeof window === 'undefined') {
      return function () {};
    }

    var tabId = getTabId();
    var stopped = false;

    var heartbeat = function () {
      if (stopped) return;
      var tabs = pruneAndList(readTabs(), tabId);
      tabs[tabId] = now();
      writeTabs(tabs);

      // Başka sekme "son sekme" sanıp kapattıysa geri al
      if (Session.getPersonelId() || Session.getYoneticiId()) {
        recoverSessionIfNeeded();
      }
    };

    heartbeat();
    var timer = window.setInterval(heartbeat, HEARTBEAT_MS);

    var onPageHide = function (event) {
      if (stopped) return;
      if (event && event.persisted) return;

      var tabs = pruneAndList(readTabs(), tabId);
      delete tabs[tabId];
      writeTabs(tabs);

      var others = Object.keys(tabs);
      // Başka canlı sekme varsa DB oturumuna dokunma
      if (others.length > 0) return;
      if (!Session.getPersonelId() && !Session.getYoneticiId()) return;

      Session.markPendingSessionClose({
        personelId: Session.getPersonelId(),
        yoneticiId: Session.getYoneticiId(),
        oturumId: Session.getOturumId(),
        yoneticiOturumId: Session.getYoneticiOturumId(),
      });
      beaconCloseDbSession();
    };

    var onStorage = function (event) {
      if (stopped) return;
      if (event.key !== Session.PENDING_CLOSE_KEY) return;
      if (!event.newValue) return;
      if (Session.getPersonelId() || Session.getYoneticiId()) {
        recoverSessionIfNeeded();
      }
    };

    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('storage', onStorage);

    return function () {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('storage', onStorage);
    };
  }

  window.SessionLifecycle = {
    beaconCloseDbSession: beaconCloseDbSession,
    recoverSessionIfNeeded: recoverSessionIfNeeded,
    startSessionLifecycle: startSessionLifecycle,
    otherLiveTabs: otherLiveTabs,
  };
})();
