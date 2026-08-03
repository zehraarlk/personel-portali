/*
 * Protokoller listesi — React admin/src/pages/protokoller/ProtokollerPages.jsx
 * (ProtokollerIndex) birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  /** DB tarih alanı: "04.10.2023" ↔ date input "2023-10-04" */
  function toDateInput(value) {
    if (!value) return '';
    var raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    var m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return '';
    var d = m[1];
    var mo = m[2];
    var y = m[3];
    while (mo.length < 2) mo = '0' + mo;
    while (d.length < 2) d = '0' + d;
    return y + '-' + mo + '-' + d;
  }

  function displayDate(value) {
    if (!value) return '—';
    var iso = toDateInput(value);
    if (!iso) return value;
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR');
    } catch (e) {
      return value;
    }
  }

  function shortLink(url) {
    if (!url) return '—';
    try {
      var u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch (e) {
      var clean = String(url).replace(/^\.\.\//, '');
      return clean.length > 36 ? clean.slice(0, 34) + '…' : clean;
    }
  }

  /* Statik sürümde '../' ile başlayan dosya yolları kökten çözülür */
  function toHref(path) {
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

  var rows = [];
  var err = '';
  var loading = true;

  function render() {
    var content = AdminLayout.content;

    var bodyHtml = '';
    if (loading) {
      bodyHtml += '<tr><td colspan="7" class="admin-empty">Yükleniyor…</td></tr>';
    }
    if (!loading && rows.length === 0) {
      bodyHtml += '<tr><td colspan="7" class="admin-empty">Henüz protokol yok. Yeni kayıt ekleyin.</td></tr>';
    }
    rows.forEach(function (row, index) {
      var aciklama = row.aciklama
        ? row.aciklama.length > 110
          ? row.aciklama.slice(0, 108) + '…'
          : row.aciklama
        : '';
      bodyHtml +=
        '<tr>' +
        '<td class="admin-td-index">' + (index + 1) + '</td>' +
        '<td class="admin-td-media">' +
        '<span class="admin-icon-pill" title="' + esc(row.ikon || '') + '">' +
        '<i class="' + esc(row.ikon || 'fas fa-file-signature') + '" aria-hidden="true"></i>' +
        '</span>' +
        '</td>' +
        '<td>' +
        '<div class="admin-row-title">' + esc(row.baslik) + '</div>' +
        (row.aciklama ? '<div class="admin-row-meta">' + esc(aciklama) + '</div>' : '') +
        '</td>' +
        '<td>' +
        (row.dosya_yolu
          ? '<a href="' + esc(toHref(row.dosya_yolu)) + '" target="_blank" rel="noreferrer" class="admin-link-muted">' +
            esc(shortLink(row.dosya_yolu)) +
            '</a>'
          : '—') +
        '</td>' +
        '<td>' + esc(row.boyut || '—') + '</td>' +
        '<td>' + esc(displayDate(row.tarih)) + '</td>' +
        '<td></td>' +
        '</tr>';
    });

    content.innerHTML =
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-file-signature" aria-hidden="true"></i>Protokoller</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
      '<a href="' + AdminConfig.href('/admin/protokoller/ekle') + '" class="admin-btn admin-btn-primary">' +
      '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Protokol' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-card admin-card--flush">' +
      '<div class="admin-table-wrap">' +
      '<table class="admin-table admin-table--crud admin-table--kaynak">' +
      '<thead>' +
      '<tr>' +
      '<th>#</th>' +
      '<th>İkon</th>' +
      '<th>Protokol</th>' +
      '<th>Dosya</th>' +
      '<th>Boyut</th>' +
      '<th>Tarih</th>' +
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

    /* React'ta loading satırı ve mevcut satırlar birlikte render edilebilir */
    var offset = loading ? 1 : 0;
    var trs = content.querySelectorAll('.admin-table tbody tr');
    rows.forEach(function (row, index) {
      var td = trs[index + offset].lastElementChild;
      td.appendChild(
        AdminWidgets.rowActions({
          editTo: '/admin/protokoller/' + row.id + '/duzenle',
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
    AdminApi.listProtokoller()
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
    if (!window.confirm('Bu protokolü silmek istiyor musunuz?')) return;
    AdminApi.deleteProtokol(id)
      .then(function () {
        load();
      })
      .catch(function (ex) {
        err = ex.message;
        render();
      });
  }

  Portal.onReady(load);
})();
