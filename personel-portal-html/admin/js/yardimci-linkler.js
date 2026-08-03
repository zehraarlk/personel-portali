/*
 * Yardımcı linkler listesi — React
 * admin/src/pages/yardimci-linkler/YardimciLinklerPages.jsx
 * (YardimciLinklerIndex) birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  /* React: toLogoSrc — statik sürümde kök yol Portal.asset ile çözülür */
  function toLogoSrc(path) {
    if (!path) return '';
    if (
      path.indexOf('blob:') === 0 ||
      path.indexOf('data:') === 0 ||
      path.indexOf('http') === 0
    ) {
      return path;
    }
    return Portal.asset(path.replace(/^\.\.\//, '/'));
  }

  function shortLink(url) {
    if (!url) return '—';
    try {
      var u = new URL(url);
      return u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
    } catch (e) {
      var clean = String(url);
      return clean.length > 42 ? clean.slice(0, 40) + '…' : clean;
    }
  }

  var rows = [];
  var kategoriler = [];
  var filterKat = '';
  var err = '';
  var loading = true;

  function render() {
    var content = AdminLayout.content;

    var optionsHtml = '<option value="">Tümü</option>';
    kategoriler.forEach(function (k) {
      optionsHtml += '<option value="' + esc(String(k.id)) + '">' + esc(k.ad) + '</option>';
    });

    var bodyHtml = '';
    if (loading) {
      bodyHtml += '<tr><td colspan="5" class="admin-empty">Yükleniyor…</td></tr>';
    }
    if (!loading && rows.length === 0) {
      bodyHtml += '<tr><td colspan="5" class="admin-empty">Bu kategoride link yok. Yeni kayıt ekleyin.</td></tr>';
    }
    rows.forEach(function (row) {
      var logoSrc = toLogoSrc(row.logo_display || row.logo_url);
      bodyHtml +=
        '<tr>' +
        '<td class="admin-td-media admin-td-media--yl-logo">' +
        (logoSrc
          ? '<img class="admin-yl-thumb" src="' + esc(logoSrc) + '" alt="" />'
          : '<span class="admin-muted">—</span>') +
        '</td>' +
        '<td>' +
        '<div class="admin-row-title">' + esc(row.baslik) + '</div>' +
        '</td>' +
        '<td>' +
        '<span class="admin-yl-kat">' + esc(row.kategori_ad || '—') + '</span>' +
        '</td>' +
        '<td>' +
        (row.hedef_url
          ? '<a href="' + esc(row.hedef_url) + '" target="_blank" rel="noreferrer" class="admin-link-muted">' +
            esc(shortLink(row.hedef_url)) +
            '</a>'
          : '—') +
        '</td>' +
        '<td></td>' +
        '</tr>';
    });

    content.innerHTML =
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-link" aria-hidden="true"></i>Yardımcı Linkler</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
      '<a href="' + AdminConfig.href('/admin/yardimci-linkler/ekle') + '" class="admin-btn admin-btn-primary">' +
      '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Link' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-card admin-card--flush admin-yl-card">' +
      '<div class="admin-yl-toolbar">' +
      '<label class="admin-yl-toolbar__label" for="yl-kat-filter">' +
      '<i class="fas fa-folder-open" aria-hidden="true"></i>' +
      '<span>Kategori</span>' +
      '</label>' +
      '<select id="yl-kat-filter" class="admin-toolbar-select" aria-label="Kategori filtresi">' +
      optionsHtml +
      '</select>' +
      '</div>' +
      '<div class="admin-table-wrap">' +
      '<table class="admin-table admin-table--crud">' +
      '<thead>' +
      '<tr>' +
      '<th>Logo</th>' +
      '<th>Başlık</th>' +
      '<th>Kategori</th>' +
      '<th>URL</th>' +
      '<th>İşlem</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' + bodyHtml + '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>' +
      '</div>';

    var moduleEl = content.querySelector('.admin-module');
    var cardEl = moduleEl.querySelector('.admin-card');

    if (err) {
      var alertEl = AdminWidgets.alert({
        type: 'danger',
        text: err,
        onClose: function () {
          err = '';
          render();
        },
      });
      moduleEl.insertBefore(alertEl, cardEl);
    }

    var select = content.querySelector('#yl-kat-filter');
    select.value = filterKat;
    select.addEventListener('change', function () {
      filterKat = select.value;
      load();
    });

    content.querySelectorAll('img.admin-yl-thumb').forEach(function (img) {
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });
    });

    /* React'ta loading satırı ve mevcut satırlar birlikte render edilebilir */
    var offset = loading ? 1 : 0;
    var trs = content.querySelectorAll('.admin-table tbody tr');
    rows.forEach(function (row, index) {
      var td = trs[index + offset].lastElementChild;
      td.appendChild(
        AdminWidgets.rowActions({
          editTo: '/admin/yardimci-linkler/' + row.id + '/duzenle',
          onDelete: function () {
            onDelete(row.id);
          },
        })
      );
    });
  }

  function load() {
    loading = true;
    render();
    AdminApi.listYardimciLinkler(filterKat || undefined)
      .then(function (data) {
        rows = Array.isArray(data) ? data : data.results || [];
      })
      .catch(function (ex) {
        err = ex.message;
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  function onDelete(id) {
    if (!window.confirm('Bu linki silmek istiyor musunuz?')) return;
    AdminApi.deleteYardimciLink(id)
      .then(function () {
        load();
      })
      .catch(function (ex) {
        err = ex.message;
        render();
      });
  }

  function init() {
    AdminApi.listYardimciLinkKategoriler()
      .then(function (data) {
        kategoriler = Array.isArray(data) ? data : data.results || [];
        render();
      })
      .catch(function () {
        kategoriler = [];
        render();
      });
    load();
  }

  Portal.onReady(init);
})();
