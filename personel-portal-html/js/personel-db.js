/*
 * personel_db API kontrolü — React frontend/src/pages/PersonelDb.jsx birebir karşılığı.
 */
(function () {
  'use strict';

  var API_ORIGIN = Portal.API_BASE.replace(/\/api\/?$/, '');

  var CHECKS = [
    { id: 'root', label: 'API kökü', path: '/api/', desc: 'Tüm API adreslerinin listesi' },
    { id: 'health', label: 'Health', path: '/api/health/', desc: 'Sunucu ayakta mı?' },
    { id: 'status', label: 'Sistem durumu', path: '/api/system-status/', desc: 'DB bağlantısı' },
    { id: 'admin', label: 'Django Admin', path: '/admin/', desc: 'Yönetim paneli (HTML)', html: true },
  ];

  var PORTAL_LINKS = [
    { title: 'Ana sayfa', href: '/', desc: 'Portal anasayfası' },
    {
      title: 'İkonlar',
      href: API_ORIGIN + '/api/icons/',
      external: true,
      desc: 'site_ikonlari API',
    },
    { title: 'Videolar', href: '/videolar' },
    { title: 'Sizden Gelenler', href: '/sizden-gelenler' },
    { title: 'Etkinlikler', href: '/etkinlikler' },
    { title: 'Duyurular', href: '/duyurular' },
    { title: 'Protokoller', href: '/protokoller' },
    { title: 'Dokümanlar', href: '/dokumanlar' },
    { title: 'Mevzuatlar', href: '/mevzuatlar' },
    { title: 'Eğitimler', href: '/egitimler' },
    { title: 'Anketler', href: '/anketler' },
    { title: 'Yardımcı Linkler', href: '/yardimci-linkler' },
    { title: 'Vefat Bilgisi', href: '/vefat' },
    { title: 'Doğum Günü', href: '/dogum-gunu' },
    { title: 'Şifre Değiştir', href: '/profil/sifre-degistir' },
    { title: 'E-posta Değiştir', href: '/profil/eposta-degistir' },
    { title: 'Oturum Kayıtları', href: '/profil/oturum-kayitlari' },
  ];

  /* useState karşılıkları */
  var results = {};
  var busy = null;

  async function checkOne(item) {
    busy = item.id;
    render();

    var url = API_ORIGIN + item.path;
    try {
      var res = await fetch(url, { credentials: 'include' });
      var preview = '';
      var text = await res.text();
      if (item.html) {
        preview = res.ok ? 'HTML yanıtı alındı' : text.slice(0, 120);
      } else {
        try {
          preview = JSON.stringify(JSON.parse(text), null, 0).slice(0, 180);
        } catch (e) {
          preview = text.slice(0, 180);
        }
      }
      results[item.id] = {
        ok: res.ok,
        status: res.status,
        preview: preview,
        at: new Date().toLocaleTimeString('tr-TR'),
      };
    } catch (err) {
      results[item.id] = {
        ok: false,
        status: 0,
        preview: (err && err.message) || 'Bağlantı hatası',
        at: new Date().toLocaleTimeString('tr-TR'),
      };
    } finally {
      busy = null;
      render();
    }
  }

  async function checkAll() {
    for (var i = 0; i < CHECKS.length; i++) {
      await checkOne(CHECKS[i]);
    }
  }

  function render() {
    var wrap = document.querySelector('.test-wrap');
    if (!wrap) return;

    var html = '';

    /* Hero */
    html += '<header class="test-hero">';
    html += '<div class="test-hero__badge">personel_db</div>';
    html += '<h1 class="test-hero__title">personel_db<span> API kontrolü</span></h1>';
    html += '<p class="test-hero__lead">Backend adreslerini tek tek veya toplu olarak kontrol edin.</p>';
    html += '<div class="test-hero__actions">';
    html +=
      '<a href="' + Portal.href('/test') + '" class="btn-run-test" style="text-decoration: none">← Test sayfası</a>';
    html +=
      '<button type="button" class="btn-run-test"' + (busy ? ' disabled' : '') + '>Tümünü kontrol et</button>';
    html += '</div>';
    html += '</header>';

    /* API kontrolleri */
    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">API kontrolleri</h2>';
    html +=
      '<p class="test-hero__lead" style="margin-bottom: 1rem; font-size: 0.95rem">' +
      'API uç noktası = backend’in verdiği bir adres (ör. <code>/api/health/</code>). Tarayıcı veya uygulama bu adrese istek atar.' +
      '</p>';
    html += '<ul class="endpoint-list">';
    CHECKS.forEach(function (item) {
      var r = results[item.id];
      html += '<li class="endpoint-item endpoint-item--check">';
      html += '<span class="endpoint-item__method">GET</span>';
      html += '<div class="endpoint-item__body">';
      html += '<div class="endpoint-item__row">';
      html += '<strong>' + Portal.escapeHtml(item.label) + '</strong>';
      html +=
        '<a href="' + API_ORIGIN + item.path + '" target="_blank" rel="noreferrer">' +
        '<code>' + Portal.escapeHtml(item.path) + '</code></a>';
      html += '</div>';
      html += '<p>' + Portal.escapeHtml(item.desc) + '</p>';
      if (r) {
        html +=
          '<p class="' + (r.ok ? 'endpoint-item__result is-ok' : 'endpoint-item__result is-err') + '">' +
          Portal.escapeHtml(
            (r.ok ? 'OK' : 'HATA') + ' · HTTP ' + (r.status || '—') + ' · ' + r.at +
            (r.preview ? ' · ' + r.preview : '')
          ) +
          '</p>';
      }
      html += '</div>';
      html +=
        '<button type="button" class="btn-check-ep"' + (busy === item.id ? ' disabled' : '') + '>' +
        (busy === item.id ? '…' : 'Kontrol et') +
        '</button>';
      html += '</li>';
    });
    html += '</ul>';
    html += '</section>';

    /* Portal sayfaları */
    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">Portal sayfaları</h2>';
    html += '<div class="link-grid">';
    PORTAL_LINKS.forEach(function (item) {
      var body =
        '<div>' +
        '<strong>' + Portal.escapeHtml(item.title) + '</strong>' +
        '<code>' + Portal.escapeHtml(item.href) + '</code>' +
        (item.desc ? '<p>' + Portal.escapeHtml(item.desc) + '</p>' : '') +
        '</div>';
      if (item.external) {
        html +=
          '<a class="link-card" href="' + Portal.escapeHtml(item.href) + '" target="_blank" rel="noreferrer">' +
          body +
          '</a>';
      } else {
        html += '<a class="link-card" href="' + Portal.href(item.href) + '">' + body + '</a>';
      }
    });
    html += '</div>';
    html += '</section>';

    wrap.innerHTML = html;

    var allBtn = wrap.querySelector('button.btn-run-test');
    if (allBtn) {
      allBtn.addEventListener('click', checkAll);
    }
    wrap.querySelectorAll('.btn-check-ep').forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        checkOne(CHECKS[i]);
      });
    });
  }

  function init() {
    render();
  }

  Portal.onReady(init);
})();
