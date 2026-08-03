/*
 * Videolar listesi — React admin/src/pages/videolar/VideolarPages.jsx
 * (VideolarIndex) birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

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
      bodyHtml += '<tr><td colspan="7" class="admin-empty">Henüz video yok. Yeni kayıt ekleyin.</td></tr>';
    }
    rows.forEach(function (row, index) {
      var thumb = row.thumbnail ? Portal.asset(row.thumbnail) : Portal.BRAND_IMG;
      bodyHtml +=
        '<tr>' +
        '<td class="admin-td-index">' + (index + 1) + '</td>' +
        '<td class="admin-td-media">' +
        '<img class="thumb" src="' + esc(thumb) + '" alt="" />' +
        '</td>' +
        '<td>' +
        '<div class="admin-row-title">' + esc(row.baslik) + '</div>' +
        '<div class="admin-row-meta">' + esc(row.youtube_id) + '</div>' +
        '</td>' +
        '<td>' + esc(row.kategori_ad || '—') + '</td>' +
        '<td>' + esc(row.sure || '—') + '</td>' +
        '<td>' +
        '<span class="admin-badge-status ' + (row.vitrin ? 'is-aktif' : 'is-pasif') + '">' +
        (row.vitrin ? 'Evet' : 'Hayır') +
        '</span>' +
        '</td>' +
        '<td></td>' +
        '</tr>';
    });

    content.innerHTML =
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-video" aria-hidden="true"></i>Videolar</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
      '<a href="' + AdminConfig.href('/admin/videolar/ekle') + '" class="admin-btn admin-btn-primary">' +
      '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Video' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-card admin-card--flush">' +
      '<div class="admin-table-wrap">' +
      '<table class="admin-table admin-table--crud">' +
      '<thead>' +
      '<tr>' +
      '<th>#</th>' +
      '<th>Önizleme</th>' +
      '<th>Video</th>' +
      '<th>Kategori</th>' +
      '<th>Süre</th>' +
      '<th>Vitrin</th>' +
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

    content.querySelectorAll('img.thumb').forEach(function (img) {
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
          editTo: '/admin/videolar/' + row.id + '/duzenle',
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
    AdminApi.listVideolar()
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
    if (!window.confirm('Bu videoyu silmek istiyor musunuz?')) return;
    AdminApi.deleteVideo(id)
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
