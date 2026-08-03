/*
 * Admin layout — React admin/src/components/AdminLayout.jsx + AdminSidebar.jsx +
 * AdminTopbar.jsx + Footer.jsx birebir karşılığı.
 *
 * Sayfa iskeleti:
 *   <div id="admin-root" class="admin-layout admin-body">
 *     <main class="admin-content"> ...sayfanın statik içeriği... </main>
 *   </div>
 *
 * Bu script yüklenirken (body sonunda) sidebar + topbar + footer'ı kurar ve
 * sayfadaki mevcut <main class="admin-content"> öğesini .admin-main içine taşır.
 * Sayfa başlığı body[data-title] özniteliğinden okunur (usePageTitle karşılığı);
 * dinamik değişim için AdminLayout.setPageTitle(...) kullanılabilir.
 */
(function () {
  'use strict';

  var PROFILE_MENU = [
    { to: '/admin/profil/sifre-degistir', label: 'Şifre Değiştir', icon: 'fas fa-key' },
    { to: '/admin/profil/oturum-kayitlari', label: 'Oturum Kayıtları', icon: 'fas fa-history' },
  ];

  /* AdminSidebar.jsx isActive karşılığı */
  function isActive(pathname, item) {
    var path = pathname.replace(/\/$/, '') || '/';
    var target = item.to.replace(/\/$/, '') || '/';
    if (item.end) return path === target;
    return path === target || path.indexOf(target + '/') === 0;
  }

  var root = document.getElementById('admin-root');
  if (!root) return;

  root.classList.add('admin-layout');
  root.classList.add('admin-body');

  var pageTitle =
    (document.body && document.body.getAttribute('data-title')) || 'Dashboard';
  var route = (document.body && document.body.getAttribute('data-route')) || '/admin';

  /* ── Sidebar (AdminSidebar.jsx) ─────────────────────────────────────── */

  var sidebar = document.createElement('aside');
  sidebar.className = 'admin-sidebar';

  var navHtml = '';
  AdminConfig.ADMIN_NAV.forEach(function (section) {
    navHtml += '<div>';
    if (section.title) {
      navHtml += '<p class="admin-nav-section">' + Portal.escapeHtml(section.title) + '</p>';
    }
    section.items.forEach(function (item) {
      var active = isActive(route, item);
      navHtml +=
        '<a href="' + AdminConfig.href(item.to) + '"' +
        ' class="admin-nav-link' + (active ? ' is-active' : '') + '">' +
        '<i class="' + item.icon + '" aria-hidden="true"></i>' +
        Portal.escapeHtml(item.label) +
        '</a>';
    });
    navHtml += '</div>';
  });

  sidebar.innerHTML =
    '<div class="admin-sidebar__brand-row">' +
    '<a href="' + AdminConfig.href(AdminConfig.ADMIN_BASE) + '" class="admin-sidebar__brand">' +
    '<span class="admin-sidebar__brand-mark" aria-hidden="true">' +
    '<img src="' + Portal.BRAND_IMG + '" alt="" />' +
    '</span>' +
    '<div>' +
    '<strong>Yönetim Paneli</strong>' +
    '<span>Gebze Belediyesi</span>' +
    '</div>' +
    '</a>' +
    '<button type="button" class="admin-sidebar__close" aria-label="Kapat">' +
    '<i class="fas fa-times" aria-hidden="true"></i>' +
    '</button>' +
    '</div>' +
    '<nav class="admin-sidebar__nav">' + navHtml + '</nav>';

  /* ── Topbar (AdminTopbar.jsx) ───────────────────────────────────────── */

  var topbar = document.createElement('header');
  topbar.className = 'admin-topbar';
  topbar.innerHTML =
    '<div class="admin-topbar__left">' +
    '<button type="button" class="admin-topbar__menu" aria-label="Menüyü aç">' +
    '<i class="fas fa-bars" aria-hidden="true"></i>' +
    '</button>' +
    '<h1></h1>' +
    '</div>' +
    '<div class="admin-topbar__right">' +
    '<div class="admin-topbar__user">' +
    '<button type="button" class="admin-topbar__badge" aria-expanded="false" aria-haspopup="menu">' +
    '<img src="' + Portal.BRAND_IMG + '" alt="" />' +
    '<span class="admin-topbar__badge-text">' +
    '<strong>Yönetici</strong>' +
    '<small>Yönetici</small>' +
    '</span>' +
    '<i class="fas fa-chevron-down" aria-hidden="true"></i>' +
    '</button>' +
    '</div>' +
    '</div>';

  var titleEl = topbar.querySelector('h1');
  titleEl.textContent = pageTitle;

  /* ── Footer (Footer.jsx) ────────────────────────────────────────────── */

  var footer = document.createElement('footer');
  footer.className = 'admin-footer';
  footer.innerHTML =
    '<div class="admin-footer__inner">' +
    '<span class="admin-footer__copy">© ' + new Date().getFullYear() +
    ' Gebze Belediyesi Personel Portalı</span>' +
    '<div class="admin-footer__links">' +
    '<a href="' + Portal.href('/') + '">Personel Portal</a>' +
    '<a href="' + Portal.href('/test') + '">Test</a>' +
    '</div>' +
    '</div>';

  /* ── İskeleti kur (AdminLayout.jsx) ─────────────────────────────────── */

  var content = root.querySelector('main.admin-content');
  if (!content) {
    content = document.createElement('main');
    content.className = 'admin-content';
  }

  var main = document.createElement('div');
  main.className = 'admin-main';
  main.appendChild(topbar);
  main.appendChild(content);
  main.appendChild(footer);

  root.insertBefore(sidebar, root.firstChild);
  root.appendChild(main);

  /**
   * İlk boyamada / F12 açılınca flex + 100vh bazen footer'ı yanlış hesaplıyor;
   * çözünürlük değişince düzelmesi bundan. Yeniden akış zorla.
   */
  function relayoutAdminShell() {
    if (!main) return;
    var prev = main.style.minHeight;
    main.style.minHeight = '0px';
    void main.offsetHeight;
    main.style.minHeight = prev;
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(relayoutAdminShell);
  });
  window.addEventListener('load', relayoutAdminShell);
  Portal.onReady(relayoutAdminShell);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', relayoutAdminShell);
  }

  /* ── Mobil sidebar (aç / kapat / backdrop) ──────────────────────────── */

  var sidebarOpen = false;
  var backdrop = null;

  function openSidebar() {
    if (sidebarOpen) return;
    sidebarOpen = true;
    sidebar.classList.add('is-open');
    backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'admin-sidebar-backdrop is-open';
    backdrop.setAttribute('aria-label', 'Menüyü kapat');
    backdrop.addEventListener('click', closeSidebar);
    root.insertBefore(backdrop, main);
  }

  function closeSidebar() {
    if (!sidebarOpen) return;
    sidebarOpen = false;
    sidebar.classList.remove('is-open');
    if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    backdrop = null;
  }

  topbar.querySelector('.admin-topbar__menu').addEventListener('click', openSidebar);
  sidebar.querySelector('.admin-sidebar__close').addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('.admin-nav-link').forEach(function (link) {
    link.addEventListener('click', closeSidebar);
  });
  sidebar.querySelector('.admin-sidebar__brand').addEventListener('click', closeSidebar);

  /* ── Profil rozeti + açılır menü (AdminTopbar.jsx) ──────────────────── */

  var userWrap = topbar.querySelector('.admin-topbar__user');
  var badgeBtn = topbar.querySelector('.admin-topbar__badge');
  var badgeImg = badgeBtn.querySelector('img');
  var badgeName = badgeBtn.querySelector('strong');
  var badgeRole = badgeBtn.querySelector('small');
  var badgeChevron = badgeBtn.querySelector('.fas');
  var menuOpen = false;
  var dropdown = null;

  badgeImg.addEventListener('error', function () {
    badgeImg.src = Portal.BRAND_IMG;
  });

  function renderProfile(profile) {
    var foto = (profile && profile.foto) || Portal.BRAND_IMG;
    var name = (profile && (profile.ad_soyad || profile.kullanici_adi)) || 'Yönetici';
    var yetki = (profile && (profile.yetki || profile.rol)) || 'Yönetici';
    badgeImg.src = foto;
    badgeName.textContent = name;
    badgeRole.textContent = yetki;
  }

  function onDocMouseDown(e) {
    if (!userWrap.contains(e.target)) closeMenu();
  }

  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    badgeBtn.setAttribute('aria-expanded', 'true');
    badgeChevron.className = 'fas fa-chevron-up';

    dropdown = document.createElement('div');
    dropdown.className = 'admin-topbar__dropdown';
    dropdown.setAttribute('role', 'menu');
    var html = '';
    PROFILE_MENU.forEach(function (item) {
      html +=
        '<a href="' + AdminConfig.href(item.to) + '" role="menuitem"' +
        ' class="admin-topbar__dropdown-item">' +
        '<i class="' + item.icon + '" aria-hidden="true"></i>' +
        Portal.escapeHtml(item.label) +
        '</a>';
    });
    html +=
      '<button type="button" role="menuitem" class="admin-topbar__dropdown-item" data-logout>' +
      '<i class="fas fa-sign-out-alt" aria-hidden="true"></i>' +
      'Çıkış Yap' +
      '</button>';
    dropdown.innerHTML = html;

    dropdown.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    dropdown.querySelector('[data-logout]').addEventListener('click', handleLogout);

    userWrap.appendChild(dropdown);
    document.addEventListener('mousedown', onDocMouseDown);
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    badgeBtn.setAttribute('aria-expanded', 'false');
    badgeChevron.className = 'fas fa-chevron-down';
    if (dropdown && dropdown.parentNode) dropdown.parentNode.removeChild(dropdown);
    dropdown = null;
    document.removeEventListener('mousedown', onDocMouseDown);
  }

  badgeBtn.addEventListener('click', function () {
    if (menuOpen) closeMenu();
    else openMenu();
  });

  async function handleLogout() {
    closeMenu();
    try {
      await AdminApi.logoutAdmin();
    } catch (e) {
      /* local clear */
    }
    /* React: clearAdminSession() = clearAuth() + navigate('/giris') */
    Session.clearAuth();
    Portal.goto('/giris');
  }

  /* Profil bilgisi: önce cache, sonra API (auth-bootstrap bitince) */
  Portal.onReady(function () {
    if (!Session.getYoneticiId()) {
      renderProfile(null);
      return;
    }
    var cached = Session.getProfileCache();
    if (cached) renderProfile(cached);
    AdminApi.fetchProfile()
      .then(function (data) {
        renderProfile(data);
        Session.setProfileCache(data);
      })
      .catch(function () {});
  });

  function setPageTitle(title) {
    pageTitle = title;
    titleEl.textContent = title;
  }

  window.AdminLayout = {
    content: content,
    setPageTitle: setPageTitle,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
  };
})();
