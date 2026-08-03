/*
 * Sekmeler arası oturum paylaşımı — React frontend/src/auth/sessionSync.js karşılığı.
 */
(function () {
  'use strict';

  var REQUEST_TIMEOUT_MS = 400;

  /**
   * Sekmeler arası oturum paylaşımı (BroadcastChannel).
   */
  function initAuthSync() {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    var hasChannel = typeof BroadcastChannel !== 'undefined';
    var channel = hasChannel ? new BroadcastChannel(Session.AUTH_CHANNEL) : null;

    if (channel) {
      channel.onmessage = function (event) {
        var msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'AUTH_REQUEST') {
          channel.postMessage({
            type: 'AUTH_RESPONSE',
            personelId: Session.getPersonelId(),
            yoneticiId: Session.getYoneticiId(),
            oturumId: Session.getOturumId(),
            yoneticiOturumId: Session.getYoneticiOturumId(),
          });
          return;
        }

        if (msg.type === 'AUTH_SET') {
          Session.applyAuthFromPeer(msg);
          return;
        }

        if (msg.type === 'AUTH_CLEAR') {
          Session.applyAuthFromPeer({});
        }
      };
    }

    if (Session.getPersonelId() || Session.getYoneticiId()) {
      return Promise.resolve();
    }

    if (!channel) {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      var settled = false;
      var timer = null;

      var finish = function () {
        if (settled) return;
        settled = true;
        channel.removeEventListener('message', onMessage);
        clearTimeout(timer);
        resolve();
      };

      var onMessage = function (event) {
        var msg = event.data;
        if (!msg || msg.type !== 'AUTH_RESPONSE') return;
        var hasAuth = Boolean(msg.personelId || msg.yoneticiId);
        if (hasAuth) {
          Session.applyAuthFromPeer(msg);
        }
        finish();
      };

      channel.addEventListener('message', onMessage);
      try {
        channel.postMessage({ type: 'AUTH_REQUEST' });
      } catch (e) {
        finish();
        return;
      }

      timer = setTimeout(finish, REQUEST_TIMEOUT_MS);
    });
  }

  window.SessionSync = {
    initAuthSync: initAuthSync,
  };
})();
