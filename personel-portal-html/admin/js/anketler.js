/*
 * Anketler listesi — React admin/src/pages/anketler/AnketlerPages.jsx
 * (AnketlerIndex) birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var rows = [];
  var err = '';
  var loading = true;

  function formatDate(value) {
    if (!value) return '—';
    try {
      return new Date(value + 'T00:00:00').toLocaleDateString('tr-TR');
    } catch (e) {
      return value;
    }
  }

  function kategoriBadgeClass(slug) {
    switch (slug) {
      case 'active':
        return 'is-aktif';
      case 'pending':
        return 'is-beklemede';
      case 'completed':
        return 'is-tamam';
      case 'expired':
        return 'is-pasif';
      default:
        return 'is-pasif';
    }
  }

  /* React: row.resim_display || row.resim_url || BRAND_IMG (statik sürümde Portal.asset) */
  function thumbSrc(row) {
    var raw = row.resim_display || row.resim_url || '';
    if (!raw) return Portal.BRAND_IMG;
    if (
      raw.indexOf('blob:') === 0 ||
      raw.indexOf('data:') === 0 ||
      raw.indexOf('http') === 0
    ) {
      return raw;
    }
    return Portal.asset(raw.replace(/^\.\.\//, '/'));
  }

  function onDelete(id) {
    if (!window.confirm('Bu anketi ve sorularını silmek istiyor musunuz?')) return;
    AdminApi.deleteAnket(id)
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
    module.innerHTML =
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-poll" aria-hidden="true"></i>Anketler</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
      '<a href="' + AdminConfig.href('/admin/anketler/ekle') + '" class="admin-btn admin-btn-primary">' +
      '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Anket' +
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
      '<th>Anket</th>' +
      '<th>Tarih</th>' +
      '<th>Katılım</th>' +
      '<th>Durum</th>' +
      '<th>Favori</th>' +
      '<th>İşlem</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody></tbody>' +
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

    var tbody = module.querySelector('tbody');

    if (loading) {
      var trLoading = document.createElement('tr');
      trLoading.innerHTML = '<td colspan="8" class="admin-empty">Yükleniyor…</td>';
      tbody.appendChild(trLoading);
    }
    if (!loading && rows.length === 0) {
      var trEmpty = document.createElement('tr');
      trEmpty.innerHTML =
        '<td colspan="8" class="admin-empty">Henüz anket yok. Yeni kayıt ekleyin.</td>';
      tbody.appendChild(trEmpty);
    }
    rows.forEach(function (row, index) {
      var tr = document.createElement('tr');
      var aciklamaHtml = '';
      if (row.aciklama) {
        var metin =
          row.aciklama.length > 100 ? row.aciklama.slice(0, 98) + '…' : row.aciklama;
        aciklamaHtml = '<div class="admin-row-meta">' + esc(metin) + '</div>';
      }
      var katilim =
        String(row.katilim_sayisi == null ? 0 : row.katilim_sayisi) +
        (row.hedef_katilim != null ? ' / ' + row.hedef_katilim : '');
      tr.innerHTML =
        '<td class="admin-td-index">' + (index + 1) + '</td>' +
        '<td class="admin-td-media">' +
        '<img class="thumb" src="' + esc(thumbSrc(row)) + '" alt="" />' +
        '</td>' +
        '<td><div class="admin-row-title">' + esc(row.baslik) + '</div>' + aciklamaHtml + '</td>' +
        '<td>' + esc(formatDate(row.baslangic_tarihi)) + ' – ' + esc(formatDate(row.bitis_tarihi)) + '</td>' +
        '<td>' + esc(katilim) + '</td>' +
        '<td><span class="admin-badge-status ' + kategoriBadgeClass(row.kategori_slug || '') + '">' +
        esc(row.kategori_ad || '—') +
        '</span></td>' +
        '<td><span class="admin-badge-status ' + (row.favori ? 'is-aktif' : 'is-pasif') + '">' +
        (row.favori ? 'Evet' : 'Hayır') +
        '</span></td>';

      var img = tr.querySelector('img.thumb');
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });

      var tdAction = document.createElement('td');
      tdAction.appendChild(
        AdminWidgets.rowActions({
          editTo: '/admin/anketler/' + row.id + '/duzenle',
          onDelete: function () {
            onDelete(row.id);
          },
        })
      );
      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });

    content.appendChild(module);
  }

  function load() {
    loading = true;
    render();
    AdminApi.listAnketler()
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

  Portal.onReady(load);
})();
