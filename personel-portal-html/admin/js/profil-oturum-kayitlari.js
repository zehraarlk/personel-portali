/*
 * Oturum kayıtları — React admin/src/pages/SessionHistory.jsx birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  function formatTs(value) {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('tr-TR');
    } catch (e) {
      return value;
    }
  }

  var KAPANIS_LABEL = {
    manuel: 'Manuel çıkış',
    sekme: 'Sekme kapandı',
    otomatik: 'Otomatik (yeni giriş)',
    eski: 'Eski oturum',
    cikis: 'Çıkış',
  };

  function formatKapanis(tip) {
    if (!tip) return 'Kapalı';
    return KAPANIS_LABEL[String(tip).toLowerCase()] || tip;
  }

  var rows = [];
  var err = '';
  var loading = true;

  function render() {
    var content = AdminLayout.content;
    content.innerHTML = '';

    if (loading) {
      content.innerHTML = '<p class="admin-muted">Yükleniyor…</p>';
      return;
    }

    if (err) {
      var alertEl = AdminWidgets.alert({
        type: 'danger',
        text: err,
        onClose: function () {
          err = '';
          render();
        },
      });
      content.appendChild(alertEl);
      return;
    }

    var bodyHtml = '';
    if (rows.length === 0) {
      bodyHtml = '<tr><td colspan="5" class="admin-empty">Kayıt yok.</td></tr>';
    }
    rows.forEach(function (r) {
      bodyHtml +=
        '<tr>' +
        '<td>' + esc(r.id) + '</td>' +
        '<td>' + esc(formatTs(r.giris_zamani)) + '</td>' +
        '<td>' + esc(formatTs(r.cikis_zamani)) + '</td>' +
        '<td>' + esc(r.ip_adresi || '—') + '</td>' +
        '<td>' +
        (r.aktif ? '<span class="admin-chip">Açık</span>' : esc(formatKapanis(r.kapanis_tipi))) +
        '</td>' +
        '</tr>';
    });

    content.innerHTML =
      '<div class="admin-card">' +
      '<div class="admin-card-header">' +
      '<h2><i class="fas fa-history" aria-hidden="true"></i> Oturum kayıtları</h2>' +
      '<a href="' + AdminConfig.href('/admin') + '" class="admin-btn admin-btn-secondary admin-btn-sm">' +
      'Dashboard' +
      '</a>' +
      '</div>' +
      '<div class="admin-table-wrap">' +
      '<table class="admin-table">' +
      '<thead>' +
      '<tr>' +
      '<th>#</th>' +
      '<th>Giriş</th>' +
      '<th>Çıkış</th>' +
      '<th>IP</th>' +
      '<th>Durum</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' + bodyHtml + '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>';
  }

  function init() {
    AdminApi.fetchProfileSessions()
      .then(function (data) {
        rows = ((data && data.oturumlar) || []).slice(0, 10);
      })
      .catch(function (ex) {
        err = ex.message;
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  Portal.onReady(init);
})();
