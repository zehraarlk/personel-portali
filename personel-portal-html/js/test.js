/*
 * Sistem test paneli — React frontend/src/pages/Test.jsx birebir karşılığı.
 */
(function () {
  'use strict';

  var API_ORIGIN = Portal.API_BASE.replace(/\/api\/?$/, '');
  var FE_ORIGIN = 'http://127.0.0.1:5173';

  /** site_ikonlari anahtarları + yoksa yedek FA sınıfı */
  var ICON_KEYS = {
    yenile: 'test_yenile',
    tarayici: 'test_tarayici',
    react: 'test_react',
    django: 'test_django',
    veritabani: 'test_veritabani',
    api: 'test_api',
    admin: 'test_admin',
    health: 'test_health',
    sistem: 'test_sistem',
    personel: 'test_personel',
    haber: 'test_haber',
    pgadmin: 'test_pgadmin',
    kod: 'test_kod',
    baglanti: 'test_baglanti',
    anasayfa: 'anasayfa',
    sonraki: 'sonraki',
  };

  var FALLBACK = {
    test_yenile: 'fas fa-bolt',
    test_tarayici: 'fas fa-window-maximize',
    test_react: 'fab fa-react',
    test_django: 'fas fa-server',
    test_veritabani: 'fas fa-database',
    test_api: 'fas fa-plug',
    test_admin: 'fas fa-shield-halved',
    test_health: 'fas fa-heart-pulse',
    test_sistem: 'fas fa-stethoscope',
    test_personel: 'fas fa-users',
    test_haber: 'fas fa-newspaper',
    test_pgadmin: 'fas fa-table-columns',
    test_kod: 'fas fa-code',
    test_baglanti: 'fas fa-plug-circle-check',
    anasayfa: 'fas fa-home',
    sonraki: 'fas fa-chevron-right',
  };

  var STACK = [
    { id: 'react', name: 'React', role: 'Frontend', version: '19 + Vite', iconKey: 'react' },
    { id: 'django', name: 'Django', role: 'Backend API + Admin', version: 'REST Framework', iconKey: 'django' },
    { id: 'postgres', name: 'PostgreSQL', role: 'Veritabanı', version: 'personel_db', iconKey: 'veritabani' },
    { id: 'pgadmin', name: 'pgAdmin', role: 'DB Yönetimi', version: 'Tablo düzenleme', iconKey: 'pgadmin' },
  ];

  var QUICK_LINKS = [
    {
      title: 'Personel Portal',
      href: '/',
      external: false,
      iconKey: 'anasayfa',
      desc: 'Ana sayfa',
    },
    {
      title: 'Admin panel',
      href: '/admin/',
      external: false,
      iconKey: 'admin',
      desc: 'Yönetim arayüzü (React admin)',
    },
    {
      title: 'Django Admin',
      href: API_ORIGIN + '/admin/',
      external: true,
      iconKey: 'admin',
      desc: 'Django CRUD paneli',
    },
    {
      title: 'personel_db API',
      href: '/test/personel-db',
      external: false,
      iconKey: 'veritabani',
      desc: 'API uç noktalarını tek tek kontrol edin',
    },
    {
      title: 'Django API',
      href: API_ORIGIN + '/api/',
      external: true,
      iconKey: 'api',
      desc: 'REST kökü',
    },
  ];

  var DB_CONFIG = [
    { label: 'Host', value: '127.0.0.1' },
    { label: 'Port', value: '5432' },
    { label: 'Veritabanı', value: 'personel_db' },
    { label: 'Kullanıcı', value: 'postgres' },
    { label: 'Şifre', value: 'backend/.env → POSTGRES_PASSWORD' },
  ];

  /* useState karşılıkları */
  var loading = true;
  var apiOk = false;
  var systemData = null;
  var icons = Object.assign({}, FALLBACK);
  var lastCheck = null;

  /** İç rota -> statik dosya ("/admin/" React admin köküdür) */
  function internalHref(route) {
    return Portal.href(route === '/admin/' ? '/admin' : route);
  }

  /** StatusDot */
  function statusDot(state) {
    return '<span class="status-dot status-dot--' + state + '" aria-hidden="true"></span>';
  }

  /** FaIcon */
  function faIcon(name, className) {
    var key = ICON_KEYS[name] || name;
    var cls = icons[key] || FALLBACK[key] || 'fas fa-circle';
    return (
      '<i class="' +
      Portal.escapeHtml((cls + ' ' + (className || '')).trim()) +
      '" aria-hidden="true"></i>'
    );
  }

  /** ServiceCard */
  function serviceCard(opts) {
    var labels = {
      loading: 'Kontrol ediliyor',
      ok: 'Çalışıyor',
      error: 'Hata',
      idle: 'Bekliyor',
    };

    var html = '<article class="service-card service-card--' + opts.state + '">';
    html += '<div class="service-card__top">';
    html += '<div class="service-card__icon">' + faIcon(opts.iconName, '') + '</div>';
    html += statusDot(opts.state);
    html += '</div>';
    html += '<h3 class="service-card__title">' + Portal.escapeHtml(opts.title) + '</h3>';
    html += '<p class="service-card__subtitle">' + Portal.escapeHtml(opts.subtitle) + '</p>';
    html += '<div class="service-card__footer">';
    html +=
      '<span class="service-card__badge service-card__badge--' + opts.state + '">' +
      labels[opts.state] +
      '</span>';
    if (opts.detail) {
      html += '<p class="service-card__detail">' + Portal.escapeHtml(opts.detail) + '</p>';
    }
    if (opts.error) {
      html += '<p class="service-card__error">' + Portal.escapeHtml(opts.error) + '</p>';
    }
    html += '</div>';
    html += '</article>';
    return html;
  }

  /** QuickLinkCard */
  function quickLinkCard(item) {
    var body =
      '<div class="link-card__icon">' + faIcon(item.iconKey, '') + '</div>' +
      '<div>' +
      '<strong>' + Portal.escapeHtml(item.title) + '</strong>' +
      '<code>' +
      Portal.escapeHtml(item.href.indexOf('http') === 0 ? item.href : FE_ORIGIN + item.href) +
      '</code>' +
      '<p>' + Portal.escapeHtml(item.desc) + '</p>' +
      '</div>';

    if (item.external) {
      return (
        '<a class="link-card" href="' + Portal.escapeHtml(item.href) + '" target="_blank" rel="noreferrer">' +
        body +
        '</a>'
      );
    }

    return '<a class="link-card" href="' + Portal.escapeHtml(internalHref(item.href)) + '">' + body + '</a>';
  }

  function render() {
    var wrap = document.querySelector('.test-wrap');
    if (!wrap) return;

    var dbOk = Boolean(systemData && systemData.database && systemData.database.connected === true);
    var allOk = !loading && apiOk && dbOk;
    var passedCount = [apiOk, dbOk, true].filter(Boolean).length;
    var dbLabel =
      (systemData && systemData.database && systemData.database.name) ||
      (systemData && systemData.stack && systemData.stack.database) ||
      'Veritabanı';
    var cardState = function (ok) {
      return loading ? 'loading' : ok ? 'ok' : 'error';
    };

    var html = '';

    /* Hero */
    html += '<header class="test-hero">';
    html +=
      '<div class="test-hero__badge">' +
      statusDot(loading ? 'loading' : allOk ? 'ok' : 'error') +
      'Sistem Test Paneli</div>';
    html += '<h1 class="test-hero__title">Personel Portalı<span> altyapı kontrolü</span></h1>';
    html +=
      '<p class="test-hero__lead">React arayüz, Django API/Admin ve PostgreSQL bağlantısını buradan kontrol edin.</p>';

    html += '<div class="test-hero__actions">';
    html +=
      '<button type="button" class="btn-run-test"' + (loading ? ' disabled' : '') + '>' +
      faIcon('yenile', loading ? 'is-spinning' : '') +
      (loading ? 'Test çalışıyor…' : 'Testi Yenile') +
      '</button>';
    if (lastCheck) {
      html +=
        '<time class="test-hero__time" datetime="' + lastCheck.toISOString() + '">' +
        'Son kontrol: ' + Portal.escapeHtml(lastCheck.toLocaleString('tr-TR')) +
        '</time>';
    }
    html += '</div>';

    html += '<div class="test-score">';
    html += '<div class="test-score__ring" style="--progress: ' + (passedCount / 3) * 100 + '%">';
    html += '<span class="test-score__value">' + passedCount + '/3</span>';
    html += '</div>';
    html += '<div>';
    html += '<p class="test-score__label">Geçen testler</p>';
    html +=
      '<p class="test-score__hint">' +
      (allOk
        ? 'Tüm servisler hazır — geliştirmeye başlayabilirsiniz.'
        : loading
          ? 'Servisler kontrol ediliyor…'
          : 'Bazı servisler yanıt vermiyor — .\\baslat.ps1 ile sunucuları açın.') +
      '</p>';
    html += '</div>';
    html += '</div>';
    html += '</header>';

    /* Django Admin */
    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">' + faIcon('admin', '') + ' Django Admin</h2>';
    html += '<div class="info-box">';
    html +=
      '<p>Backend açıkken <a href="' + API_ORIGIN + '/admin/" target="_blank" rel="noreferrer">' +
      API_ORIGIN + '/admin/</a> adresine gidin. İlk giriş için:</p>';
    html +=
      '<p style="margin-top: 0.75rem"><code>cd backend; .\\venv\\Scripts\\python.exe manage.py createsuperuser</code></p>';
    html += '</div>';
    html += '</section>';

    /* Tüm linkler */
    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">Tüm linkler</h2>';
    html += '<div class="link-grid">';
    QUICK_LINKS.forEach(function (item) {
      html += quickLinkCard(item);
    });
    html += '</div>';
    html += '</section>';

    /* Bağlantı Akışı */
    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">Bağlantı Akışı</h2>';
    html += '<div class="pipeline">';
    var pipelineNodes = [
      { iconKey: 'tarayici', label: 'Tarayıcı', sub: 'localhost:5173', ok: true },
      { iconKey: 'react', label: 'React', sub: 'Vite dev server', ok: true },
      { iconKey: 'django', label: 'Django', sub: ':8000/api', ok: apiOk },
      { iconKey: 'veritabani', label: 'Database', sub: String(dbLabel), ok: dbOk },
    ];
    pipelineNodes.forEach(function (node, i) {
      html += '<div class="pipeline__group">';
      html +=
        '<div class="pipeline__node ' +
        (node.ok && !loading ? 'is-active' : loading ? 'is-pending' : 'is-down') +
        '">';
      html += faIcon(node.iconKey, '');
      html += '<strong>' + Portal.escapeHtml(node.label) + '</strong>';
      html += '<span>' + Portal.escapeHtml(node.sub) + '</span>';
      html += '</div>';
      if (i < pipelineNodes.length - 1) {
        html +=
          '<div class="pipeline__line ' + (node.ok && !loading ? 'is-active' : '') + '">' +
          faIcon('sonraki', '') +
          '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    html += '</section>';

    /* Servis Durumu */
    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">Servis Durumu</h2>';
    html += '<div class="service-grid">';
    html += serviceCard({
      title: 'Django API',
      subtitle: 'REST endpoint sağlık kontrolü',
      iconName: 'baglanti',
      state: cardState(apiOk),
      detail: apiOk ? 'GET /api/health/ → 200 OK' : undefined,
      error:
        !loading && !apiOk
          ? "Backend çalışmıyor. .\\baslat.ps1 ile Django'yu başlatın."
          : undefined,
    });
    html += serviceCard({
      title: 'Veritabanı',
      subtitle: (systemData && systemData.stack && systemData.stack.database) || 'PostgreSQL bağlantısı',
      iconName: 'veritabani',
      state: cardState(dbOk),
      detail: dbOk ? systemData && systemData.database && systemData.database.version : undefined,
      error:
        !loading && !dbOk
          ? (systemData && systemData.database && systemData.database.error) || 'Veritabanına bağlanılamadı.'
          : undefined,
    });
    html += serviceCard({
      title: 'React Frontend',
      subtitle: 'Vite geliştirme sunucusu',
      iconName: 'react',
      state: loading ? 'loading' : 'ok',
      detail: 'Bu sayfa başarıyla yüklendi.',
    });
    html += '</div>';
    html += '</section>';

    /* Teknoloji Yığını + PostgreSQL */
    html += '<div class="test-columns">';

    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">Teknoloji Yığını</h2>';
    html += '<div class="stack-list">';
    STACK.forEach(function (item) {
      html += '<div class="stack-item">';
      html += '<div class="stack-item__icon">' + faIcon(item.iconKey, '') + '</div>';
      html += '<div class="stack-item__body">';
      html +=
        '<div class="stack-item__row"><strong>' + Portal.escapeHtml(item.name) + '</strong>' +
        '<span>' + Portal.escapeHtml(item.role) + '</span></div>';
      html += '<p>' + Portal.escapeHtml(item.version) + '</p>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</section>';

    html += '<section class="test-section">';
    html += '<h2 class="test-section__title">' + faIcon('veritabani', '') + ' PostgreSQL</h2>';
    html += '<div class="config-panel">';
    html += '<dl class="config-grid">';
    DB_CONFIG.forEach(function (row) {
      html +=
        '<div class="config-row"><dt>' + Portal.escapeHtml(row.label) + '</dt>' +
        '<dd>' + Portal.escapeHtml(row.value) + '</dd></div>';
    });
    html += '</dl>';
    html += '</div>';
    html += '</section>';

    html += '</div>';

    /* Footer */
    html += '<footer class="test-footer">';
    html += '<p>Personel Portalı — geliştirme ortamı test sayfası</p>';
    html += '<p class="test-footer__url">';
    html += '<a href="' + internalHref('/') + '">Anasayfa</a>';
    html += ' · ';
    html += '<a href="' + internalHref('/test') + '">Test</a>';
    html += ' · ';
    html += '<a href="' + internalHref('/admin/') + '">Admin</a>';
    html += ' · ';
    html += '<a href="' + API_ORIGIN + '/admin/" target="_blank" rel="noreferrer">Django Admin</a>';
    html += ' · ';
    html += '<a href="' + internalHref('/test/personel-db') + '">personel_db</a>';
    html += '</p>';
    html += '</footer>';

    wrap.innerHTML = html;

    var runBtn = wrap.querySelector('.btn-run-test');
    if (runBtn) {
      runBtn.addEventListener('click', runChecks);
    }
  }

  async function runChecks() {
    loading = true;
    render();

    var healthOk = false;
    var status = null;

    try {
      var health = await Api.fetchHealth();
      healthOk = Boolean(health && health.status === 'ok');
    } catch (e) {
      healthOk = false;
    }

    try {
      status = await Api.fetchSystemStatus();
    } catch (e2) {
      status = null;
    }

    try {
      var iconData = await Api.fetchSiteIcons();
      if (iconData && iconData.icons) {
        icons = Object.assign({}, FALLBACK, iconData.icons);
      }
    } catch (e3) {
      /* FALLBACK kullanılır */
    }

    apiOk = healthOk;
    systemData = status;
    lastCheck = new Date();
    loading = false;
    render();
  }

  function init() {
    render();
    runChecks();
  }

  Portal.onReady(init);
})();
