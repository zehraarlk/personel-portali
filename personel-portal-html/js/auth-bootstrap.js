/*
 * Oturum başlatma + rota koruması — React frontend/src/auth/AuthBootstrap.jsx
 * ve RequireAuth.jsx birebir karşılığı.
 *
 * body[data-auth]:
 *   "root"   → oturum varsa sayfa (ana sayfa), yoksa girişe yönlendir
 *   "portal" → personel VEYA yönetici gerekli
 *   "admin"  → yalnızca yönetici gerekli
 *   "public" → koruma yok (giriş sayfaları)
 */
(function () {
  'use strict';

  /* React'taki "Oturum kontrol ediliyor…" ekranı */
  var overlay = document.createElement('div');
  overlay.setAttribute('data-auth-overlay', '');
  overlay.style.cssText = [
    'position: fixed',
    'inset: 0',
    'z-index: 9999',
    'min-height: 100vh',
    'display: grid',
    'place-items: center',
    'font-family: Inter, system-ui, sans-serif',
    'color: #5b6b76',
    'background: #f3f6f8',
    'font-size: 0.9rem',
    'font-weight: 600',
  ].join(';');
  overlay.textContent = 'Oturum kontrol ediliyor…';

  function mountOverlay() {
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(overlay);
      });
    }
  }

  function removeOverlay() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function applyResume(data) {
    if (data && data.type === 'personel' && data.oturum_id) {
      Session.setOturumId(data.oturum_id);
      if (data.personel) Session.setProfileCache(data.personel);
      return true;
    }
    if (data && data.type === 'yonetici' && data.oturum_id) {
      Session.setYoneticiOturumId(data.oturum_id);
      if (data.yonetici) Session.setProfileCache(data.yonetici);
      return true;
    }
    return false;
  }

  /**
   * Sekme kapanışı / yenileme / kardeş sekme ayrımı.
   * Ağ hatasında (backend yeniden başlatma) oturumu SİLMEZ.
   */
  async function reconcileSession() {
    var pending = Session.consumePendingSessionClose();
    var hasAuth = Boolean(Session.getPersonelId() || Session.getYoneticiId());

    // Pending var ama bu sekmede (veya sync ile) oturum duruyor → kapanışı iptal et / resume
    if (pending && hasAuth) {
      try {
        var data = await Api.resumeAuthSession();
        applyResume(data);
      } catch (e) {
        try {
          var result = await Api.checkAuthSession();
          if (result && result.valid === false) {
            try {
              var again = await Api.resumeAuthSession();
              applyResume(again);
            } catch (e2) {
              /* backend kalkana kadar lokal oturumu koru */
            }
          }
        } catch (e3) {
          /* API down — oturumu koru */
        }
      }
      return;
    }

    if (pending && !hasAuth) {
      // Tüm sekmeler kapanmıştı; yeni boş sekme → giriş ekranı
      Session.clearPendingSessionClose();
      return;
    }

    if (!hasAuth) return;

    if (Session.getPersonelId() && !Session.getOturumId()) {
      try {
        var d1 = await Api.resumeAuthSession();
        if (!applyResume(d1)) Session.clearAuth();
      } catch (e4) {
        /* backend yoksa id'yi koru; sonraki isteklerde toparlanır */
      }
      return;
    }
    if (Session.getYoneticiId() && !Session.getYoneticiOturumId()) {
      try {
        var d2 = await Api.resumeAuthSession();
        if (!applyResume(d2)) Session.clearAuth();
      } catch (e5) {
        /* keep */
      }
      return;
    }

    try {
      var check = await Api.checkAuthSession();
      if (check && check.valid === false) {
        try {
          var d3 = await Api.resumeAuthSession();
          applyResume(d3);
        } catch (e6) {
          // Geçersiz oturum + resume yok → çıkış
          Session.clearAuth();
        }
      }
    } catch (e7) {
      // Yeniden başlatma / API kısa kesinti — oturumu düşürme
    }
  }

  /** RequireAuth karşılığı: sayfa koruması */
  function guard() {
    var mode = (document.body && document.body.getAttribute('data-auth')) || 'public';

    if (mode === 'root' || mode === 'portal') {
      if (!Session.canAccessPortal()) {
        Portal.replace('/giris');
        return false;
      }
    } else if (mode === 'admin') {
      if (!Session.canAccessAdmin()) {
        Portal.replace('/admin/giris');
        return false;
      }
    }
    return true;
  }

  function start() {
    SessionSync.initAuthSync()
      .then(function () {
        return reconcileSession();
      })
      .then(function () {
        SessionLifecycle.recoverSessionIfNeeded();
      })
      .catch(function () {
        // Sync/reconcile hatası oturumu silmesin
      })
      .finally(function () {
        SessionLifecycle.startSessionLifecycle();
        if (!guard()) return; /* yönlendiriliyor; sayfayı başlatma */
        removeOverlay();
        Portal._setReady();
      });
  }

  mountOverlay();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
