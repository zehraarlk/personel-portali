/*
 * Admin yapılandırması — React admin/src/navConfig.js + AdminRoutes.jsx rota
 * haritası karşılığı. Admin sayfalarında Portal (../js/config.js) yüklendikten
 * sonra yüklenir.
 */
(function () {
  'use strict';

  /** Admin sidebar + dashboard sıra kaynağı (tek yerden yönetilir). */
  var ADMIN_BASE = '/admin';

  var ADMIN_NAV = [
    {
      title: null,
      items: [{ to: ADMIN_BASE, label: 'Dashboard', icon: 'fas fa-gauge-high', end: true }],
    },
    {
      title: 'Yönetim',
      items: [
        { to: ADMIN_BASE + '/personeller', label: 'Personeller', icon: 'fas fa-users', countKey: 'personeller' },
        { to: ADMIN_BASE + '/yoneticiler', label: 'Yöneticiler', icon: 'fas fa-user-shield', countKey: 'yoneticiler' },
      ],
    },
    {
      title: 'Videolar',
      items: [
        { to: ADMIN_BASE + '/videolar', label: 'Videolar', icon: 'fas fa-video', countKey: 'videolar' },
      ],
    },
    {
      title: 'Etkinlikler',
      items: [
        {
          to: ADMIN_BASE + '/sizden-gelenler',
          label: 'Sizden Gelenler',
          icon: 'fas fa-comments',
          countKey: 'sizden_gelenler',
        },
        {
          to: ADMIN_BASE + '/etkinlikler',
          label: 'Etkinlikler',
          icon: 'fas fa-calendar-check',
          countKey: 'etkinlikler',
        },
        { to: ADMIN_BASE + '/duyurular', label: 'Duyurular', icon: 'fas fa-bullhorn', countKey: 'duyurular' },
      ],
    },
    {
      title: 'Kaynaklar',
      items: [
        {
          to: ADMIN_BASE + '/protokoller',
          label: 'Protokoller',
          icon: 'fas fa-file-signature',
          countKey: 'protokoller',
        },
        {
          to: ADMIN_BASE + '/dokumanlar',
          label: 'Dokümanlar',
          icon: 'fas fa-file-alt',
          countKey: 'dokumanlar',
        },
        {
          to: ADMIN_BASE + '/mevzuatlar',
          label: 'Mevzuatlar',
          icon: 'fas fa-balance-scale',
          countKey: 'mevzuatlar',
        },
        {
          to: ADMIN_BASE + '/egitimler',
          label: 'Eğitimler',
          icon: 'fas fa-graduation-cap',
          countKey: 'egitimler',
        },
      ],
    },
    {
      title: 'Diğer',
      items: [
        { to: ADMIN_BASE + '/anketler', label: 'Anketler', icon: 'fas fa-poll', countKey: 'anketler' },
        {
          to: ADMIN_BASE + '/yardimci-linkler',
          label: 'Yardımcı Linkler',
          icon: 'fas fa-link',
          countKey: 'yardimci_linkler',
        },
        { to: ADMIN_BASE + '/vefat', label: 'Vefat Eden Bilgisi', icon: 'fas fa-ribbon', countKey: 'vefat_bilgileri' },
        {
          to: ADMIN_BASE + '/dogum-gunu',
          label: 'Doğum Günü Bilgisi',
          icon: 'fas fa-birthday-cake',
          countKey: 'dogum_gunu',
        },
      ],
    },
    {
      title: 'Sistem',
      items: [
        { to: '/', label: 'Personel Portal', icon: 'fas fa-home' },
        { to: '/test', label: 'Test', icon: 'fas fa-stethoscope' },
      ],
    },
  ];

  /** Dashboard stat kartları = sidebar içerik linkleri (Dashboard + Sistem hariç), aynı sıra. */
  var ADMIN_STATS = [];
  ADMIN_NAV.forEach(function (section) {
    if (!section.title || section.title === 'Sistem') return;
    section.items.forEach(function (item) {
      ADMIN_STATS.push({
        key: item.countKey,
        to: item.to,
        label: item.label,
        icon: item.icon,
      });
    });
  });

  /** Hızlı işlemler = aynı sıra; tıklanınca ilgili ekleme sayfasına gider. */
  var ADMIN_QUICK_ACTIONS = ADMIN_STATS.map(function (stat) {
    return {
      key: stat.key,
      // Doğum günü personeller tablosundan gelir; ekleme personel formuna gider.
      to: stat.key === 'dogum_gunu' ? ADMIN_BASE + '/personeller/ekle' : stat.to + '/ekle',
      label: stat.label,
      desc: 'Yeni kayıt ekle',
      icon: stat.icon,
    };
  });

  /*
   * AdminRoutes.jsx'teki GERÇEK rota listesi -> admin/ klasöründeki dosya adı.
   * Kural: '/admin' → index.html, '/admin/x' → x.html, '/admin/x/y' → x-y.html,
   * ':id' içeren rotalar → aynı dosya + ?id= query.
   */
  var ROUTE_FILES = {
    '/admin': 'index.html',

    '/admin/personeller': 'personeller.html',
    '/admin/personeller/ekle': 'personeller-ekle.html',
    '/admin/personeller/:id/duzenle': 'personeller-duzenle.html',

    '/admin/yoneticiler': 'yoneticiler.html',
    '/admin/yoneticiler/ekle': 'yoneticiler-ekle.html',
    '/admin/yoneticiler/:id/duzenle': 'yoneticiler-duzenle.html',

    '/admin/videolar': 'videolar.html',
    '/admin/videolar/ekle': 'videolar-ekle.html',
    '/admin/videolar/:id/duzenle': 'videolar-duzenle.html',

    '/admin/sizden-gelenler': 'sizden-gelenler.html',
    '/admin/sizden-gelenler/ekle': 'sizden-gelenler-ekle.html',
    '/admin/sizden-gelenler/:id/duzenle': 'sizden-gelenler-duzenle.html',

    '/admin/etkinlikler': 'etkinlikler.html',
    '/admin/etkinlikler/ekle': 'etkinlikler-ekle.html',
    '/admin/etkinlikler/:id/duzenle': 'etkinlikler-duzenle.html',

    '/admin/duyurular': 'duyurular.html',
    '/admin/duyurular/ekle': 'duyurular-ekle.html',
    '/admin/duyurular/:id/duzenle': 'duyurular-duzenle.html',

    '/admin/protokoller': 'protokoller.html',
    '/admin/protokoller/ekle': 'protokoller-ekle.html',
    '/admin/protokoller/:id/duzenle': 'protokoller-duzenle.html',

    '/admin/dokumanlar': 'dokumanlar.html',
    '/admin/dokumanlar/ekle': 'dokumanlar-ekle.html',
    '/admin/dokumanlar/:id/duzenle': 'dokumanlar-duzenle.html',

    '/admin/mevzuatlar': 'mevzuatlar.html',
    '/admin/mevzuatlar/ekle': 'mevzuatlar-ekle.html',
    '/admin/mevzuatlar/:id/duzenle': 'mevzuatlar-duzenle.html',

    '/admin/egitimler': 'egitimler.html',
    '/admin/egitimler/ekle': 'egitimler-ekle.html',
    '/admin/egitimler/:id/duzenle': 'egitimler-duzenle.html',

    '/admin/anketler': 'anketler.html',
    '/admin/anketler/ekle': 'anketler-ekle.html',
    '/admin/anketler/:id/duzenle': 'anketler-duzenle.html',

    '/admin/yardimci-linkler': 'yardimci-linkler.html',
    '/admin/yardimci-linkler/ekle': 'yardimci-linkler-ekle.html',
    '/admin/yardimci-linkler/:id/duzenle': 'yardimci-linkler-duzenle.html',

    '/admin/vefat': 'vefat.html',
    '/admin/vefat/ekle': 'vefat-ekle.html',
    '/admin/vefat/:id/duzenle': 'vefat-duzenle.html',

    '/admin/dogum-gunu': 'dogum-gunu.html',

    '/admin/profil/sifre-degistir': 'profil-sifre-degistir.html',
    '/admin/profil/oturum-kayitlari': 'profil-oturum-kayitlari.html',
  };

  function appendParams(url, params) {
    if (!params) return url;
    var qs = new URLSearchParams();
    Object.keys(params).forEach(function (k) {
      if (params[k] != null && params[k] !== '') qs.set(k, params[k]);
    });
    var s = qs.toString();
    return s ? url + '?' + s : url;
  }

  /**
   * Admin rotası -> href (isteğe bağlı query parametreleriyle).
   * - Tam eşleşme: AdminConfig.href('/admin/duyurular') → 'duyurular.html'
   * - ':id' şablonu: AdminConfig.href('/admin/duyurular/:id/duzenle', { id: 5 })
   *   → 'duyurular-duzenle.html?id=5'
   * - Gerçek id'li rota: AdminConfig.href('/admin/duyurular/5/duzenle')
   *   → 'duyurular-duzenle.html?id=5'
   * - Admin dışı rotalar ('/', '/test', '/giris', …) Portal.href'e devredilir
   *   (ROOT_PREFIX '../' otomatik eklenir).
   */
  function href(route, params) {
    var file = ROUTE_FILES[route];
    if (file) return appendParams(file, params);

    /* '/admin/duyurular/5/duzenle' gibi somut id'li rotalar */
    var m = /^(\/admin\/[a-z-]+)\/(\d+)\/duzenle$/.exec(route);
    if (m && ROUTE_FILES[m[1] + '/:id/duzenle']) {
      return appendParams(
        ROUTE_FILES[m[1] + '/:id/duzenle'],
        Object.assign({ id: m[2] }, params || {})
      );
    }

    /* Admin dışı rotalar (Personel Portal, Test, girişler) kök haritaya */
    if (route.indexOf('/admin') !== 0) {
      return Portal.href(route, params);
    }

    /* React'ta '*' → Home */
    return appendParams('index.html', params);
  }

  function goto(route, params) {
    window.location.href = href(route, params);
  }

  function replace(route, params) {
    window.location.replace(href(route, params));
  }

  window.AdminConfig = {
    ADMIN_BASE: ADMIN_BASE,
    ADMIN_NAV: ADMIN_NAV,
    ADMIN_STATS: ADMIN_STATS,
    ADMIN_QUICK_ACTIONS: ADMIN_QUICK_ACTIONS,
    ROUTE_FILES: ROUTE_FILES,
    href: href,
    goto: goto,
    replace: replace,
  };
})();
