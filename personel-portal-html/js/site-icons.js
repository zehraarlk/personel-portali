/*
 * Site ikonları — React frontend/src/icons/siteIcons.js + useSiteIcons karşılığı.
 * Kullanım: HTML'de <i data-icon="arama"></i>; SiteIcons.load() sonrası
 * SiteIcons.apply() tüm data-icon öğelerinin sınıfını günceller.
 */
(function () {
  'use strict';

  /** API yokken / anahtar eksikken yedek (site_ikonlari anahtarlarıyla uyumlu) */
  var SITE_ICON_FALLBACK = {
    anasayfa: 'fas fa-home',
    videolar: 'fas fa-video',
    sizden_gelenler: 'fas fa-comments',
    etkinlik_takvimi: 'fas fa-calendar-check',
    etkinlikler: 'fas fa-newspaper',
    etkinlik_sayfa: 'fas fa-calendar-days',
    duyurular: 'fas fa-bullhorn',
    anasayfa_haberler: 'fas fa-bullhorn',
    duyuru_zili: 'fas fa-bell',
    protokoller: 'fas fa-file-signature',
    dokumanlar: 'fas fa-file-alt',
    mevzuatlar: 'fas fa-balance-scale',
    egitimler: 'fas fa-graduation-cap',
    kaynaklar: 'fas fa-landmark',
    anketler: 'fas fa-poll',
    yardimci_linkler: 'fas fa-link',
    vefat_bilgisi: 'fas fa-ribbon',
    dogum_gunu: 'fas fa-birthday-cake',
    dogum_sayfa: 'fas fa-cake-candles',
    menu_ac: 'fas fa-bars',
    sifre_degistir: 'fas fa-key',
    email_degistir: 'fas fa-envelope',
    oturum_bilgileri: 'fas fa-history',
    giris_yap_bi: 'fas fa-right-to-bracket',
    cikis_yap: 'fas fa-sign-out-alt',
    yonetim_paneli: 'fas fa-cog',
    onceki: 'fas fa-chevron-left',
    sonraki: 'fas fa-chevron-right',
    geri_don: 'fas fa-arrow-left',
    arama: 'fas fa-search',
    kaydet: 'fas fa-save',
    telefon: 'fas fa-phone',
    eposta: 'fas fa-envelope',
    facebook: 'fab fa-facebook-f',
    twitter: 'fab fa-twitter',
    instagram: 'fab fa-instagram',
    youtube: 'fab fa-youtube',
    linkedin: 'fab fa-linkedin-in',
    otomasyon_sistem: 'fas fa-desktop',
    harici_baglanti: 'fas fa-external-link-alt',
    tarih: 'fas fa-calendar-alt',
    sifre_goster_bi: 'fas fa-eye',
    sifre_gizle_bi: 'fas fa-eye-slash',
    yonetim_guvenlik_bi: 'fas fa-shield-halved',
    pdf_dosyasi: 'fas fa-file-pdf',
    dosya_belge: 'fas fa-file-alt',
    video_oynat: 'fas fa-play',
  };

  var cache = null;
  var inflight = null;

  function load() {
    if (cache) return Promise.resolve(cache);
    if (inflight) return inflight;

    inflight = Api.fetchSiteIcons()
      .then(function (data) {
        cache = Object.assign({}, (data && data.icons) || {});
        return cache;
      })
      .catch(function () {
        cache = {};
        return cache;
      })
      .finally(function () {
        inflight = null;
      });

    return inflight;
  }

  /** Anahtar -> Font Awesome sınıfı (önce DB, yoksa yedek) */
  function resolve(icons, anahtar, fallback) {
    fallback = fallback || 'fas fa-circle';
    var key = String(anahtar || '').trim();
    if (!key) return fallback;
    var fromDb = icons && icons[key];
    if (fromDb && String(fromDb).trim()) return String(fromDb).trim();
    return SITE_ICON_FALLBACK[key] || fallback;
  }

  /** Senkron çözümleme: yüklü önbellek (yoksa yedek harita) üzerinden */
  function icon(anahtar, fallback) {
    return resolve(cache || {}, anahtar, fallback);
  }

  /**
   * root altındaki tüm [data-icon] öğelerinin sınıfını günceller.
   * data-icon-extra: ikon sınıfına eklenecek ek sınıflar.
   */
  function apply(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-icon]');
    nodes.forEach(function (el) {
      var key = el.getAttribute('data-icon');
      var fallback = el.getAttribute('data-icon-fallback') || undefined;
      var extra = el.getAttribute('data-icon-extra') || '';
      var cls = icon(key, fallback);
      el.className = extra ? cls + ' ' + extra : cls;
    });
  }

  /** İkonlar yüklenince apply çağırır (ilk boyamada yedekler kullanılır) */
  function init(root) {
    apply(root);
    load().then(function () {
      apply(root);
    });
  }

  window.SiteIcons = {
    FALLBACK: SITE_ICON_FALLBACK,
    load: load,
    resolve: resolve,
    icon: icon,
    apply: apply,
    init: init,
  };
})();
