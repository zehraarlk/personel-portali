/*
 * Sizden Gelenler listesi — React admin/src/pages/sizden-gelenler/
 * SizdenGelenlerPages.jsx (SizdenGelenlerIndex) birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  function formatDate(value) {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('tr-TR');
    } catch (e) {
      return value;
    }
  }

  var rows = [];
  var err = '';
  var loading = true;

  function load() {
    loading = true;
    render();
    AdminApi.listSizdenGelenler()
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
    if (!window.confirm('Bu kaydı silmek istiyor musunuz?')) return;
    AdminApi.deleteSizdenGelen(id)
      .then(function () {
        load();
      })
      .catch(function (ex) {
        err = ex.message;
        render();
      });
  }

  function render() {
    var content = AdminLayout.content;
    content.innerHTML = '';

    var module = document.createElement('div');
    module.className = 'admin-module';

    var bodyHtml = '';
    if (loading) {
      bodyHtml += '<tr><td colspan="7" class="admin-empty">Yükleniyor…</td></tr>';
    }
    if (!loading && rows.length === 0) {
      bodyHtml += '<tr><td colspan="7" class="admin-empty">Henüz kayıt yok. Yeni kayıt ekleyin.</td></tr>';
    }
    rows.forEach(function (row, index) {
      bodyHtml +=
        '<tr>' +
        '<td class="admin-td-index">' + (index + 1) + '</td>' +
        '<td class="admin-td-media">' +
        '<img class="thumb" src="' +
        esc(row.gorsel_display ? Portal.asset(row.gorsel_display) : Portal.BRAND_IMG) +
        '" alt="" />' +
        '</td>' +
        '<td><div class="admin-row-title">' + esc(row.baslik) + '</div></td>' +
        '<td>' + esc(row.kategori_ad || '—') + '</td>' +
        '<td>' + esc(formatDate(row.tarih)) + '</td>' +
        '<td>' + esc(row.goruntulenme != null ? row.goruntulenme : 0) + '</td>' +
        '<td data-row-id="' + esc(row.id) + '"></td>' +
        '</tr>';
    });

    module.innerHTML =
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-comments" aria-hidden="true"></i>Sizden Gelenler</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
      '<a href="' + AdminConfig.href('/admin/sizden-gelenler/ekle') + '" class="admin-btn admin-btn-primary">' +
      '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Kayıt' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-card admin-card--flush">' +
      '<div class="admin-table-wrap">' +
      '<table class="admin-table admin-table--crud">' +
      '<thead>' +
      '<tr>' +
      '<th>#</th>' +
      '<th>Görsel</th>' +
      '<th>Başlık</th>' +
      '<th>Kategori</th>' +
      '<th>Tarih</th>' +
      '<th>Görüntülenme</th>' +
      '<th>İşlem</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' + bodyHtml + '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>';

    if (err) {
      var alertEl = AdminWidgets.alert({
        type: 'danger',
        text: err,
        onClose: function () {
          err = '';
        },
      });
      module.insertBefore(alertEl, module.querySelector('.admin-card'));
    }

    module.querySelectorAll('td[data-row-id]').forEach(function (td) {
      var rowId = td.getAttribute('data-row-id');
      td.removeAttribute('data-row-id');
      td.appendChild(
        AdminWidgets.rowActions({
          editTo: '/admin/sizden-gelenler/' + rowId + '/duzenle',
          onDelete: function () {
            onDelete(rowId);
          },
        })
      );
    });

    /* Kırık görsel -> marka görseli (React onError karşılığı) */
    module.querySelectorAll('img.thumb').forEach(function (img) {
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });
    });

    content.appendChild(module);
  }

  function init() {
    load();
  }

  Portal.onReady(init);
})();
