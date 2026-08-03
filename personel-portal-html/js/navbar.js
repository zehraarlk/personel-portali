/*
 * Site navbar — React frontend/src/components/SideNav.jsx birebir karşılığı.
 * Sayfada <div id="site-navbar"></div> yer tutucusunu <header class="navbar"> ile değiştirir.
 */
(function () {
  'use strict';

  var esc = Portal.escapeHtml;

  var NAV_SECTIONS = [
    {
      title: null,
      items: [
        { to: '/', label: 'Anasayfa', iconKey: 'anasayfa', end: true },
        { to: '/videolar', label: 'Videolar', iconKey: 'videolar' },
      ],
    },
    {
      title: 'Etkinlikler',
      items: [
        { to: '/sizden-gelenler', label: 'Sizden Gelenler', iconKey: 'sizden_gelenler' },
        { to: '/etkinlikler', label: 'Etkinlikler', iconKey: 'etkinlik_takvimi' },
        { to: '/duyurular', label: 'Duyurular', iconKey: 'duyurular' },
      ],
    },
    {
      title: 'Kaynaklar',
      items: [
        { to: '/protokoller', label: 'Protokoller', iconKey: 'protokoller' },
        { to: '/dokumanlar', label: 'Dokümanlar', iconKey: 'dokumanlar' },
        { to: '/mevzuatlar', label: 'Mevzuatlar', iconKey: 'mevzuatlar' },
        { to: '/egitimler', label: 'Eğitimler', iconKey: 'egitimler' },
      ],
    },
    {
      title: 'Diğer',
      items: [
        { to: '/anketler', label: 'Anketler', iconKey: 'anketler' },
        { to: '/yardimci-linkler', label: 'Yardımcı Linkler', iconKey: 'yardimci_linkler' },
        { to: '/vefat', label: 'Vefat Eden Bilgisi', iconKey: 'vefat_bilgisi' },
        { to: '/dogum-gunu', label: 'Doğum Günü Bilgisi', iconKey: 'dogum_gunu' },
      ],
    },
  ];

  var LEFT_SECTIONS = NAV_SECTIONS.slice(0, 2);
  var RIGHT_SECTIONS = NAV_SECTIONS.slice(2);

  var PROFILE_MENU_PERSONEL = [
    { to: '/profil/sifre-degistir', label: 'Şifre Değiştir', iconKey: 'sifre_degistir' },
    { to: '/profil/eposta-degistir', label: 'E-posta Değiştir', iconKey: 'email_degistir' },
    { to: '/profil/oturum-kayitlari', label: 'Oturum Kayıtları', iconKey: 'oturum_bilgileri' },
  ];

  var PROFILE_MENU_ADMIN = [
    { to: '/admin', label: 'Yönetim Paneli', iconKey: 'yonetim_paneli' },
    { to: '/admin/profil/sifre-degistir', label: 'Şifre Değiştir', iconKey: 'sifre_degistir' },
    { to: '/admin/profil/oturum-kayitlari', label: 'Oturum Kayıtları', iconKey: 'oturum_bilgileri' },
  ];

  /* --- durum (React state karşılığı) --- */
  var state = {
    profile: Session.getProfileCache(),
    loggedIn: Session.canAccessPortal(),
    isAdmin: Session.isYoneticiLoggedIn(),
    openMenu: null,
    sidebarOpen: false,
    profileOpen: false,
  };

  var header = null;
  var prevBodyOverflow = '';

  function iconClass(key) {
    return SiteIcons.icon(key);
  }

  function isActive(item) {
    var route = Portal.route();
    if (item.end) return route === '/';
    return route === item.to || route.indexOf(item.to + '/') === 0;
  }

  function sectionKey(section) {
    return section.title == null ? 'main' : section.title;
  }

  function sectionHasActive(section) {
    return section.items.some(isActive);
  }

  function getFoto() {
    return (state.profile && state.profile.foto) || Portal.BRAND_IMG;
  }

  function getAdSoyad() {
    var p = state.profile || {};
    if (!state.loggedIn) return 'Misafir';
    return (
      p.ad_soyad ||
      [p.ad, p.soyad].filter(Boolean).join(' ') ||
      p.kullanici_adi ||
      (state.isAdmin ? 'Yönetici' : 'Personel')
    );
  }

  function getRol() {
    var p = state.profile || {};
    if (!state.loggedIn) return 'Giriş yapın';
    return p.yetki || p.rol || (state.isAdmin ? 'Yönetici' : 'personel');
  }

  function renderProfileItems(linkClass, withDropdownIcon) {
    var ico = function (key) {
      return iconClass(key) + (withDropdownIcon ? ' navbar-dropdown-icon' : '');
    };
    if (!state.loggedIn) {
      return (
        '<a href="' + Portal.href('/giris') + '" role="menuitem" class="' + linkClass + '">' +
        '<i class="' + ico('giris_yap_bi') + '" aria-hidden="true"></i>' +
        'Giriş Yap</a>'
      );
    }
    var menu = state.isAdmin ? PROFILE_MENU_ADMIN : PROFILE_MENU_PERSONEL;
    var html = menu
      .map(function (item) {
        return (
          '<a href="' + Portal.href(item.to) + '" role="menuitem" class="' + linkClass + '">' +
          '<i class="' + ico(item.iconKey) + '" aria-hidden="true"></i>' +
          esc(item.label) + '</a>'
        );
      })
      .join('');
    html +=
      '<button type="button" role="menuitem" class="' + linkClass + '" data-action="logout">' +
      '<i class="' + ico('cikis_yap') + '" aria-hidden="true"></i>' +
      'Çıkış Yap</button>';
    return html;
  }

  function renderDesktopSection(section) {
    var key = sectionKey(section);

    if (!section.title || section.items.length === 1) {
      return section.items
        .map(function (item) {
          return (
            '<a href="' + Portal.href(item.to) + '" class="navbar-link' +
            (isActive(item) ? ' is-active' : '') + '">' +
            '<span>' + esc(item.label) + '</span></a>'
          );
        })
        .join('');
    }

    var active = sectionHasActive(section);
    var expanded = state.openMenu === key;

    var html =
      '<div class="navbar-item" data-menu-key="' + esc(key) + '">' +
      '<button type="button" class="navbar-link navbar-link--trigger' + (active ? ' is-active' : '') + '"' +
      ' aria-expanded="' + (expanded ? 'true' : 'false') + '" aria-haspopup="menu" data-action="toggle-menu" data-key="' + esc(key) + '">' +
      '<span>' + esc(section.title) + '</span>' +
      '<i class="fas fa-chevron-down navbar-caret' + (expanded ? ' is-open' : '') + '" aria-hidden="true"></i>' +
      '</button>';

    if (expanded) {
      html += '<div role="menu" class="navbar-dropdown">';
      html += section.items
        .map(function (item) {
          return (
            '<a href="' + Portal.href(item.to) + '" role="menuitem" class="navbar-dropdown-link' +
            (isActive(item) ? ' is-active' : '') + '">' +
            '<i class="' + iconClass(item.iconKey) + ' navbar-dropdown-icon" aria-hidden="true"></i>' +
            esc(item.label) + '</a>'
          );
        })
        .join('');
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderSidebar() {
    var html =
      '<aside class="navbar-sidebar' + (state.sidebarOpen ? ' is-open' : '') + '" aria-hidden="' + (state.sidebarOpen ? 'false' : 'true') + '">' +
      '<div class="navbar-sidebar__brand">' +
      '<span class="navbar-sidebar__brand-mark" aria-hidden="true">' +
      '<img src="' + esc(getFoto()) + '" alt="" data-fallback-brand>' +
      '</span>' +
      '<div><strong>' + esc(getAdSoyad()) + '</strong><span>' + esc(getRol()) + '</span></div>' +
      '<button type="button" class="navbar-sidebar__close" data-action="close-sidebar" aria-label="Kapat">' +
      '<i class="fas fa-times" aria-hidden="true"></i>' +
      '</button>' +
      '</div>' +
      '<nav class="navbar-sidebar__nav">';

    html += NAV_SECTIONS.map(function (section) {
      var block = '<div>';
      if (section.title) {
        block += '<p class="navbar-nav-section">' + esc(section.title) + '</p>';
      }
      block += section.items
        .map(function (item) {
          return (
            '<a href="' + Portal.href(item.to) + '" class="navbar-nav-link' + (isActive(item) ? ' is-active' : '') + '">' +
            '<i class="' + iconClass(item.iconKey) + '" aria-hidden="true"></i>' +
            esc(item.label) + '</a>'
          );
        })
        .join('');
      block += '</div>';
      return block;
    }).join('');

    html += '</nav></aside>';

    if (state.sidebarOpen) {
      html +=
        '<button type="button" class="navbar-sidebar-backdrop is-open" aria-label="Menüyü kapat" data-action="close-sidebar"></button>';
    }

    return html;
  }

  function render() {
    if (!header) return;

    var html =
      '<div class="navbar-inner" data-nav-inner>' +
      /* Mobil topbar: hamburger + logo (admin sol blok) */
      '<div class="navbar-mobile-left">' +
      '<button type="button" class="navbar-burger" data-action="open-sidebar" aria-label="Menüyü aç" aria-expanded="' + (state.sidebarOpen ? 'true' : 'false') + '">' +
      '<i class="' + iconClass('menu_ac') + '" aria-hidden="true"></i>' +
      '</button>' +
      '<a href="' + Portal.href('/') + '" class="navbar-logo navbar-logo--mobile" aria-label="Ana Sayfa">' +
      '<img src="' + esc(Portal.SITE_LOGO_WHITE) + '" alt="Gebze Belediyesi">' +
      '</a>' +
      '</div>' +
      '<nav class="navbar-side navbar-side--left">' +
      LEFT_SECTIONS.map(renderDesktopSection).join('') +
      '</nav>' +
      '<a href="' + Portal.href('/') + '" class="navbar-logo navbar-logo--desktop" aria-label="Ana Sayfa">' +
      '<img src="' + esc(Portal.SITE_LOGO_WHITE) + '" alt="Gebze Belediyesi">' +
      '</a>' +
      '<nav class="navbar-side navbar-side--right">' +
      RIGHT_SECTIONS.map(renderDesktopSection).join('') +
      '<div class="navbar-item navbar-profile">' +
      '<button type="button" class="navbar-profile-trigger" data-action="toggle-menu" data-key="profile" aria-expanded="' + (state.openMenu === 'profile' ? 'true' : 'false') + '" aria-haspopup="menu">' +
      '<img src="' + esc(getFoto()) + '" alt="" class="navbar-profile-avatar" data-fallback-brand>' +
      '<span class="navbar-profile-text">' +
      '<span class="navbar-profile-name">' + esc(getAdSoyad()) + '</span>' +
      '<span class="navbar-profile-role">' + esc(getRol()) + '</span>' +
      '</span>' +
      '<i class="fas fa-chevron-down navbar-caret' + (state.openMenu === 'profile' ? ' is-open' : '') + '" aria-hidden="true"></i>' +
      '</button>' +
      (state.openMenu === 'profile'
        ? '<div role="menu" class="navbar-dropdown navbar-dropdown--right">' +
          renderProfileItems('navbar-dropdown-link', true) +
          '</div>'
        : '') +
      '</div>' +
      '</nav>' +
      /* Mobil topbar: profil rozeti (admin sağ blok) */
      '<div class="navbar-mobile-user" data-profile-ref>' +
      '<button type="button" class="navbar-mobile-badge" data-action="toggle-mobile-profile" aria-expanded="' + (state.profileOpen ? 'true' : 'false') + '" aria-haspopup="menu">' +
      '<img src="' + esc(getFoto()) + '" alt="" data-fallback-brand>' +
      '<span class="navbar-mobile-badge-text">' +
      '<strong>' + esc(getAdSoyad()) + '</strong>' +
      '<small>' + esc(getRol()) + '</small>' +
      '</span>' +
      '<i class="fas fa-chevron-' + (state.profileOpen ? 'up' : 'down') + '" aria-hidden="true"></i>' +
      '</button>' +
      (state.profileOpen
        ? '<div class="navbar-mobile-dropdown" role="menu">' +
          renderProfileItems('navbar-mobile-dropdown-item', false) +
          '</div>'
        : '') +
      '</div>' +
      '</div>' +
      /* Mobil sidebar — admin sidebar gibi */
      renderSidebar();

    header.innerHTML = html;

    /* Kırık profil fotoğrafı -> marka görseli */
    header.querySelectorAll('img[data-fallback-brand]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });
    });
  }

  function setState(patch) {
    Object.assign(state, patch);

    /* Sidebar açıkken body scroll kilidi (React effect karşılığı) */
    if ('sidebarOpen' in patch) {
      if (patch.sidebarOpen) {
        state.profileOpen = false;
        prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = prevBodyOverflow;
      }
    }

    render();
  }

  function handleLogout() {
    state.openMenu = null;
    state.profileOpen = false;
    if (state.sidebarOpen) setState({ sidebarOpen: false });

    var admin = Session.isYoneticiLoggedIn();
    var finish = function () {
      if (admin) {
        Session.clearAuth();
      } else {
        Session.clearPersonelAuth();
      }
      state.loggedIn = false;
      state.isAdmin = false;
      state.profile = null;
      Portal.goto('/giris');
    };

    var request = admin ? Api.logoutAdmin() : Api.logoutPersonel();
    request.then(finish).catch(finish);
  }

  function onHeaderClick(event) {
    var actionEl = event.target.closest('[data-action]');
    if (!actionEl || !header.contains(actionEl)) return;

    var action = actionEl.getAttribute('data-action');

    if (action === 'toggle-menu') {
      var key = actionEl.getAttribute('data-key');
      setState({ openMenu: state.openMenu === key ? null : key });
    } else if (action === 'open-sidebar') {
      setState({ profileOpen: false, sidebarOpen: true });
    } else if (action === 'close-sidebar') {
      setState({ sidebarOpen: false });
    } else if (action === 'toggle-mobile-profile') {
      if (state.sidebarOpen) setState({ sidebarOpen: false });
      setState({ profileOpen: !state.profileOpen });
    } else if (action === 'logout') {
      handleLogout();
    }
  }

  function onDocMouseDown(event) {
    if (state.openMenu) {
      var inner = header.querySelector('[data-nav-inner]');
      if (inner && !inner.contains(event.target)) {
        setState({ openMenu: null });
      }
    }
    if (state.profileOpen) {
      var profileRef = header.querySelector('[data-profile-ref]');
      if (profileRef && !profileRef.contains(event.target)) {
        setState({ profileOpen: false });
      }
    }
  }

  function loadProfile() {
    state.loggedIn = Session.canAccessPortal();
    state.isAdmin = Session.isYoneticiLoggedIn();

    var cached = Session.getProfileCache();
    if (cached) state.profile = cached;

    if (Session.getPersonelId()) {
      Api.fetchProfile()
        .then(function (data) {
          state.profile = data;
          Session.setProfileCache(data);
          render();
        })
        .catch(function () {
          if (!Session.getProfileCache()) {
            state.profile = null;
            render();
          }
        });
    } else if (state.isAdmin) {
      Api.fetchAdminProfile()
        .then(function (data) {
          state.profile = data;
          Session.setProfileCache(data);
          render();
        })
        .catch(function () {
          if (!Session.getProfileCache()) {
            state.profile = null;
            render();
          }
        });
    } else {
      state.profile = null;
    }
  }

  function init() {
    var placeholder = document.getElementById('site-navbar');
    if (!placeholder) return;

    header = document.createElement('header');
    header.className = 'navbar';
    placeholder.replaceWith(header);

    render();
    loadProfile();

    header.addEventListener('click', onHeaderClick);
    document.addEventListener('mousedown', onDocMouseDown);

    /* İkonlar DB'den gelince yeniden boya */
    SiteIcons.load().then(render);
  }

  window.SiteNavbar = { init: init };

  Portal.onReady(init);
})();
