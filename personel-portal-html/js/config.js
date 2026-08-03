/*
 * Portal yapılandırması — React frontend/src/constants.js + rota haritası karşılığı.
 * Tüm sayfalarda İLK yüklenen script budur.
 */
(function () {
  'use strict';

  var API_BASE = 'http://127.0.0.1:8000/api';

  /* admin/ klasöründeki sayfalar için personel-portal-html köküne önek */
  var path = String(window.location.pathname).replace(/\\/g, '/');
  var ROOT_PREFIX = /\/admin\/[^/]*$/.test(path) ? '../' : '';

  var IMAGES_BASE = ROOT_PREFIX + '../images';

  /* React Router rotası -> statik HTML dosyası */
  var ROUTE_FILES = {
    '/': 'index.html',
    '/giris': 'giris.html',
    '/sifre-sifirla': 'sifre-sifirla.html',
    '/admin/giris': 'admin-giris.html',
    '/videolar': 'videolar.html',
    '/etkinlikler': 'etkinlikler.html',
    '/etkinlikler/detay': 'etkinlik-detay.html',
    '/duyurular': 'duyurular.html',
    '/duyurular/detay': 'duyuru-detay.html',
    '/protokoller': 'protokoller.html',
    '/dokumanlar': 'dokumanlar.html',
    '/mevzuatlar': 'mevzuatlar.html',
    '/egitimler': 'egitimler.html',
    '/vefat': 'vefat.html',
    '/dogum-gunu': 'dogum-gunu.html',
    '/yardimci-linkler': 'yardimci-linkler.html',
    '/anketler': 'anketler.html',
    '/anketler/detay': 'anket-detay.html',
    '/sizden-gelenler': 'sizden-gelenler.html',
    '/sizden-gelenler/detay': 'sizden-gelenler-detay.html',
    '/test': 'test.html',
    '/test/personel-db': 'personel-db.html',
    '/profil/sifre-degistir': 'profil-sifre-degistir.html',
    '/profil/eposta-degistir': 'profil-eposta-degistir.html',
    '/profil/oturum-kayitlari': 'profil-oturum-kayitlari.html',
    '/admin': 'admin/index.html',
    '/admin/profil/sifre-degistir': 'admin/profil-sifre-degistir.html',
    '/admin/profil/oturum-kayitlari': 'admin/profil-oturum-kayitlari.html',
    /* React'ta tanımsız rotalar "*" ile ana sayfaya döner */
    '/gizlilik-politikasi': 'index.html',
    '/kullanim-kosullari': 'index.html',
  };

  /** Rota -> href (isteğe bağlı query parametreleriyle) */
  function href(route, params) {
    var file = ROUTE_FILES[route];
    if (!file) {
      /* /duyurular/5 gibi dinamik rotalar: detay dosyası + ?id= */
      var m = /^(\/[^/]+(?:\/detay)?)\/([^/?#]+)$/.exec(String(route || ''));
      if (m && ROUTE_FILES[m[1] + '/detay']) {
        file = ROUTE_FILES[m[1] + '/detay'];
        params = Object.assign({ id: decodeURIComponent(m[2]) }, params || {});
      } else if (m && ROUTE_FILES[m[1]]) {
        file = ROUTE_FILES[m[1]];
      } else {
        file = 'index.html';
      }
    }
    var url = ROOT_PREFIX + file;
    if (params) {
      var qs = new URLSearchParams();
      Object.keys(params).forEach(function (k) {
        if (params[k] != null && params[k] !== '') qs.set(k, params[k]);
      });
      var s = qs.toString();
      if (s) url += '?' + s;
    }
    return url;
  }

  /** "/images/x.webp" gibi kök yolları statik klasöre çevirir */
  function asset(p) {
    if (!p) return p;
    var value = String(p);
    if (/^https?:\/\//i.test(value) || /^data:/i.test(value)) return value;
    if (value.indexOf('/images/') === 0) return IMAGES_BASE + value.slice('/images'.length);
    return value;
  }

  /** Sayfanın React rotası (body[data-route]) */
  function route() {
    return (document.body && document.body.getAttribute('data-route')) || '';
  }

  /** URL query parametresi */
  function param(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function goto(routeName, params) {
    window.location.href = href(routeName, params);
  }

  function replace(routeName, params) {
    window.location.replace(href(routeName, params));
  }

  /**
   * React navigate(-1) karşılığı.
   * Aynı origin'den gelindiyse history.back(); aksi halde fallback rotaya git.
   * Örn. ana sayfadan açıldıysa geri → ana sayfa.
   */
  function back(fallbackRoute) {
    var ref = document.referrer;
    if (ref) {
      try {
        var refUrl = new URL(ref);
        if (refUrl.origin === window.location.origin) {
          window.history.back();
          return;
        }
      } catch (err) {
        /* ignore */
      }
    }
    goto(fallbackRoute || '/');
  }

  /* auth-bootstrap tamamlanınca çalışacak sayfa init kuyruğu */
  var readyQueue = [];
  var isReady = false;

  function onReady(fn) {
    if (isReady) {
      fn();
    } else {
      readyQueue.push(fn);
    }
  }

  function _setReady() {
    isReady = true;
    var fns = readyQueue.slice();
    readyQueue.length = 0;
    fns.forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        if (window.console) console.error(err);
      }
    });
    document.dispatchEvent(new CustomEvent('portal:ready'));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.Portal = {
    API_BASE: API_BASE,
    ROOT_PREFIX: ROOT_PREFIX,
    IMAGES_BASE: IMAGES_BASE,
    /** Profil / küçük ikon */
    BRAND_IMG: IMAGES_BASE + '/favicon.webp',
    /** Beyaz logo — koyu zemin üzerinde kullanın */
    SITE_LOGO_WHITE: IMAGES_BASE + '/gebze-belediyesi-beyaz-logo.png',
    /** Login kutusu logosu (orijinal LOGIN_LOGO_URL) */
    LOGIN_LOGO: 'https://personel.gebze.bel.tr/public/img/logo/logo1.png',
    ROUTE_FILES: ROUTE_FILES,
    href: href,
    asset: asset,
    route: route,
    param: param,
    goto: goto,
    replace: replace,
    back: back,
    onReady: onReady,
    _setReady: _setReady,
    escapeHtml: escapeHtml,
  };
})();
