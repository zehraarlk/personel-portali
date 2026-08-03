/*
 * Dashboard — React admin/src/pages/Home.jsx birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  function render(data) {
    var content = AdminLayout.content;
    var counts = (data && data.counts) || {};

    var html = '<div class="admin-stats">';
    AdminConfig.ADMIN_STATS.forEach(function (stat) {
      var count = counts[stat.key];
      html +=
        '<a href="' + AdminConfig.href(stat.to) + '" class="admin-stat-card">' +
        '<div class="admin-stat-card__icon">' +
        '<i class="' + stat.icon + '" aria-hidden="true"></i>' +
        '</div>' +
        '<div class="admin-stat-card__meta">' +
        '<div class="admin-stat-card__value">' + esc(count == null ? 0 : count) + '</div>' +
        '<div class="admin-stat-card__label">' + esc(stat.label) + '</div>' +
        '</div>' +
        '</a>';
    });
    html += '</div>';

    var dogumGunleri = (data && data.dogum_gunleri) || [];
    if (dogumGunleri.length > 0) {
      html +=
        '<div class="admin-card" style="margin-bottom: 1rem">' +
        '<div class="admin-card-header">' +
        '<h2><i class="fas fa-birthday-cake" aria-hidden="true"></i> Bugün doğum günü</h2>' +
        '</div>' +
        '<div class="admin-card-body">' +
        '<ul class="admin-list-plain">';
      dogumGunleri.forEach(function (p) {
        html +=
          '<li>' +
          '<img src="' + esc(p.foto || Portal.BRAND_IMG) + '" alt="" width="36" height="36"' +
          ' style="border-radius: 50%; object-fit: cover" />' +
          '<strong>' + esc(p.ad_soyad) + '</strong>' +
          '</li>';
      });
      html += '</ul></div></div>';
    }

    html +=
      '<div class="admin-card">' +
      '<div class="admin-card-header">' +
      '<h2><i class="fas fa-bolt" aria-hidden="true"></i> Hızlı İşlemler</h2>' +
      '</div>' +
      '<div class="admin-card-body">' +
      '<div class="admin-quick-links">';
    AdminConfig.ADMIN_QUICK_ACTIONS.forEach(function (action) {
      html +=
        '<a href="' + AdminConfig.href(action.to) + '" class="admin-quick-link">' +
        '<span class="admin-quick-link__icon">' +
        '<i class="' + action.icon + '" aria-hidden="true"></i>' +
        '</span>' +
        '<span class="admin-quick-link__text">' +
        '<strong>' + esc(action.label) + '</strong>' +
        '<small>' + esc(action.desc) + '</small>' +
        '</span>' +
        '<i class="fas fa-chevron-right admin-quick-link__arrow" aria-hidden="true"></i>' +
        '</a>';
    });
    html += '</div></div></div>';

    content.innerHTML = html;

    /* Kırık profil fotoğrafı -> marka görseli */
    content.querySelectorAll('.admin-list-plain img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });
    });
  }

  function init() {
    AdminApi.fetchAdminDashboard()
      .then(render)
      .catch(function (ex) {
        AdminLayout.content.innerHTML =
          '<div class="admin-alert admin-alert-danger">' + esc(ex.message) + '</div>';
      });
  }

  Portal.onReady(init);
})();
