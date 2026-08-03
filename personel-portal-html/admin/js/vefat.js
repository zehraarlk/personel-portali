/*
 * Vefat Bilgileri listesi — React admin/src/pages/vefat/VefatPages.jsx
 * (VefatIndex) birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  function formatDateDisplay(row) {
    if (row && row.vefat_tarihi_metin) return row.vefat_tarihi_metin;
    if (!row || !row.vefat_tarihi) return '—';
    try {
      return new Date(row.vefat_tarihi + 'T00:00:00').toLocaleDateString('tr-TR');
    } catch (e) {
      return row.vefat_tarihi;
    }
  }

  function clip(text, max) {
    var raw = (text || '').trim();
    if (!raw) return '—';
    return raw.length > max ? raw.slice(0, max - 1) + '…' : raw;
  }

  var rows = [];
  var err = '';
  var loading = true;

  function render() {
    var content = AdminLayout.content;
    content.innerHTML = '';

    var module = document.createElement('div');
    module.className = 'admin-module';
    content.appendChild(module);

    module.insertAdjacentHTML(
      'beforeend',
      '<header class="admin-page-head">' +
        '<div class="admin-page-head__text">' +
        '<h2><i class="fas fa-ribbon" aria-hidden="true"></i>Vefat Bilgileri</h2>' +
        '</div>' +
        '<div class="admin-page-head__actions">' +
        '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
        '<a href="' + AdminConfig.href('/admin/vefat/ekle') + '" class="admin-btn admin-btn-primary">' +
        '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Kayıt' +
        '</a>' +
        '</div>' +
        '</header>'
    );

    if (err) {
      module.appendChild(
        AdminWidgets.alert({
          type: 'danger',
          text: err,
          onClose: function () {
            err = '';
            render();
          },
        })
      );
    }

    /* React'ta rows.map loading koşuluna bağlı DEĞİL — yeniden yükleme
       sırasında "Yükleniyor…" satırı + mevcut satırlar birlikte görünür. */
    var bodyHtml = '';
    if (loading) {
      bodyHtml += '<tr><td colspan="4" class="admin-empty">Yükleniyor…</td></tr>';
    }
    if (!loading && rows.length === 0) {
      bodyHtml += '<tr><td colspan="4" class="admin-empty">Henüz vefat bilgisi eklenmemiş.</td></tr>';
    }
    rows.forEach(function (row) {
      bodyHtml +=
        '<tr>' +
        '<td><div class="admin-row-title">' + esc(row.vefat_eden_adi) + '</div></td>' +
        '<td><div class="admin-row-meta">' + esc(clip(row.iliski_pozisyon, 50)) + '</div></td>' +
        '<td>' + esc(formatDateDisplay(row)) + '</td>' +
        '<td></td>' +
        '</tr>';
    });

    module.insertAdjacentHTML(
      'beforeend',
      '<div class="admin-card admin-card--flush">' +
        '<div class="admin-table-wrap">' +
        '<table class="admin-table admin-table--crud">' +
        '<thead>' +
        '<tr><th>Vefat Eden</th><th>İlişki</th><th>Tarih</th><th>İşlem</th></tr>' +
        '</thead>' +
        '<tbody>' + bodyHtml + '</tbody>' +
        '</table>' +
        '</div>' +
        '</div>'
    );

    var trs = module.querySelectorAll('tbody tr');
    var offset = trs.length - rows.length;
    rows.forEach(function (row, i) {
      trs[offset + i].lastElementChild.appendChild(
        AdminWidgets.rowActions({
          editTo: '/admin/vefat/' + row.id + '/duzenle',
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
    AdminApi.listVefat()
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
    if (!window.confirm('Bu vefat bilgisini silmek istediğinize emin misiniz?')) return;
    AdminApi.deleteVefat(id)
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
