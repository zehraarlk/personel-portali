/*
 * Personeller listesi — React admin/src/pages/yonetim/YonetimPages.jsx
 * (PersonellerIndex) birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var rows = [];
  var err = '';
  var loading = true;

  function onDelete(id) {
    if (!window.confirm('Bu personeli silmek istiyor musunuz?')) return;
    AdminApi.deletePersonel(id)
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
      '<h2><i class="fas fa-users" aria-hidden="true"></i>Personeller</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
      '<a href="' + AdminConfig.href('/admin/personeller/ekle') + '" class="admin-btn admin-btn-primary">' +
      '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Personel' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-card admin-card--flush">' +
      '<div class="admin-table-wrap">' +
      '<table class="admin-table admin-table--crud">' +
      '<thead>' +
      '<tr>' +
      '<th>#</th>' +
      '<th>Foto</th>' +
      '<th>Ad Soyad</th>' +
      '<th>Sicil</th>' +
      '<th>E-posta</th>' +
      '<th>Telefon</th>' +
      '<th>Doğum</th>' +
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
        '<td colspan="8" class="admin-empty">Kayıt yok. Yeni personel ekleyin.</td>';
      tbody.appendChild(trEmpty);
    }
    rows.forEach(function (row, index) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="admin-td-index">' + (index + 1) + '</td>' +
        '<td class="admin-td-media">' +
        '<img class="thumb" src="' + esc(row.foto || Portal.BRAND_IMG) + '" alt=""' +
        ' style="width: 40px; height: 40px; border-radius: 50%" />' +
        '</td>' +
        '<td><div class="admin-row-title">' + esc(row.ad_soyad) + '</div></td>' +
        '<td>' + esc(row.sicil_no) + '</td>' +
        '<td>' + esc(row.email) + '</td>' +
        '<td>' + esc(row.telefon || '—') + '</td>' +
        '<td>' + esc(row.dogum_tarihi || '—') + '</td>';

      var img = tr.querySelector('img.thumb');
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });

      var tdAction = document.createElement('td');
      tdAction.appendChild(
        AdminWidgets.rowActions({
          editTo: '/admin/personeller/' + row.id + '/duzenle',
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
    AdminApi.listPersoneller()
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
