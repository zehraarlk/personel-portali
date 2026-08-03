/*
 * Doğum Günü Bilgisi — React admin/src/pages/dogum-gunu/DogumGunuPages.jsx
 * (DogumGunuIndex) birebir karşılığı. Yalnızca liste (ekle/düzenle yok);
 * satır aksiyonu personel düzenleme sayfasına götürür.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var SCOPES = [
    { id: 'today', label: 'Bugün' },
    { id: 'month', label: 'Bu ay' },
    { id: 'all', label: 'Tümü' },
  ];

  function formatDogum(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR');
    } catch (e) {
      return iso;
    }
  }

  function emptyMessage(scope) {
    if (scope === 'month') return 'Bu ay doğum günü olan personel bulunamadı.';
    if (scope === 'all') return 'Doğum tarihi kayıtlı personel bulunamadı.';
    return 'Bugün doğum günü olan personel bulunmamaktadır.';
  }

  var scope = 'today';
  var rows = [];
  var tarihTr = '';
  var toplam = 0;
  var err = '';
  var loading = true;

  function countLabel() {
    return scope === 'today' ? 'Bugün' : scope === 'month' ? 'Bu ay' : 'Toplam';
  }

  function render() {
    var content = AdminLayout.content;
    content.innerHTML = '';

    var module = document.createElement('div');
    module.className = 'admin-module';
    content.appendChild(module);

    var optionsHtml = '';
    SCOPES.forEach(function (s) {
      optionsHtml += '<option value="' + s.id + '">' + s.label + '</option>';
    });

    module.insertAdjacentHTML(
      'beforeend',
      '<header class="admin-page-head">' +
        '<div class="admin-page-head__text">' +
        '<h2><i class="fas fa-birthday-cake" aria-hidden="true"></i>Doğum Günü Bilgisi</h2>' +
        (tarihTr ? '<p>' + esc(tarihTr) + '</p>' : '') +
        '</div>' +
        '<div class="admin-page-head__actions">' +
        '<span class="admin-count-pill">' + countLabel() + ' <strong>' + toplam + '</strong></span>' +
        '<a href="' + AdminConfig.href('/admin/personeller/ekle') + '" class="admin-btn admin-btn-primary">' +
        '<i class="fas fa-user-plus" aria-hidden="true"></i> Yeni Personel' +
        '</a>' +
        '</div>' +
        '</header>' +
        '<div class="admin-dg-toolbar">' +
        '<label class="admin-dg-toolbar__filter" for="dg-scope-filter">' +
        '<span class="admin-yl-toolbar__label">' +
        '<i class="fas fa-filter" aria-hidden="true"></i>' +
        'Filtre' +
        '</span>' +
        '<select id="dg-scope-filter" class="admin-toolbar-select" aria-label="Doğum günü filtresi">' +
        optionsHtml +
        '</select>' +
        '</label>' +
        '<a href="' + AdminConfig.href('/admin/personeller') + '" class="admin-btn admin-btn-secondary admin-btn-sm">' +
        '<i class="fas fa-users" aria-hidden="true"></i> Personeller' +
        '</a>' +
        '</div>'
    );

    var select = module.querySelector('#dg-scope-filter');
    select.value = scope;
    select.addEventListener('change', function () {
      scope = select.value;
      load();
    });

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

    var bodyHtml = '';
    if (loading) {
      bodyHtml = '<tr><td colspan="6" class="admin-empty">Yükleniyor…</td></tr>';
    } else if (rows.length === 0) {
      bodyHtml = '<tr><td colspan="6" class="admin-empty">' + esc(emptyMessage(scope)) + '</td></tr>';
    } else {
      rows.forEach(function (row) {
        bodyHtml +=
          '<tr>' +
          '<td class="admin-td-media">' +
          '<img class="thumb" src="' + esc(row.foto || Portal.BRAND_IMG) + '" alt="" style="width: 40px; height: 40px; border-radius: 50%;" />' +
          '</td>' +
          '<td><div class="admin-row-title">' + esc(row.ad_soyad) + '</div></td>' +
          '<td>' + esc(row.sicil_no || '—') + '</td>' +
          '<td>' + esc(row.email || '—') + '</td>' +
          '<td>' + esc(formatDogum(row.dogum_tarihi)) + '</td>' +
          '<td>' +
          '<a href="' + AdminConfig.href('/admin/personeller/' + row.id + '/duzenle') + '" class="admin-btn admin-btn-secondary admin-btn-sm" title="Personeli düzenle">' +
          '<i class="fas fa-pen" aria-hidden="true"></i> Düzenle' +
          '</a>' +
          '</td>' +
          '</tr>';
      });
    }

    module.insertAdjacentHTML(
      'beforeend',
      '<div class="admin-card admin-card--flush">' +
        '<div class="admin-table-wrap">' +
        '<table class="admin-table admin-table--crud">' +
        '<thead>' +
        '<tr><th>Foto</th><th>Ad Soyad</th><th>Sicil</th><th>E-posta</th><th>Doğum Tarihi</th><th>İşlem</th></tr>' +
        '</thead>' +
        '<tbody>' + bodyHtml + '</tbody>' +
        '</table>' +
        '</div>' +
        '</div>'
    );

    module.querySelectorAll('img.thumb').forEach(function (img) {
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });
    });
  }

  var requestSeq = 0;

  function load() {
    loading = true;
    err = '';
    render();
    requestSeq += 1;
    var seq = requestSeq;
    AdminApi.listDogumGunu(scope)
      .then(function (data) {
        if (seq !== requestSeq) return;
        rows = Array.isArray(data && data.kayitlar) ? data.kayitlar : [];
        toplam = Number(data && data.toplam) || 0;
        tarihTr = (data && data.tarih_tr) || '';
      })
      .catch(function (ex) {
        if (seq !== requestSeq) return;
        err = ex.message;
      })
      .finally(function () {
        if (seq !== requestSeq) return;
        loading = false;
        render();
      });
  }

  Portal.onReady(load);
})();
