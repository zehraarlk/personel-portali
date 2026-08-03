/*
 * Oturum kayıtları — React frontend/src/pages/SessionHistory.jsx portu.
 */
(function () {
  'use strict';

  var KAPANIS_LABEL = {
    manuel: 'Manuel çıkış',
    sekme: 'Sekme kapandı',
    otomatik: 'Otomatik (yeni giriş)',
    eski: 'Eski oturum',
    cikis: 'Çıkış',
  };

  function formatTs(value) {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('tr-TR');
    } catch (e) {
      return value;
    }
  }

  function formatKapanis(tip) {
    if (!tip) return 'Kapalı';
    return KAPANIS_LABEL[String(tip).toLowerCase()] || tip;
  }

  function init() {
    var stateEl = document.getElementById('oturum-state');

    function renderRow(r) {
      var durum = r.aktif
        ? '<span class="profil-chip">Açık</span>'
        : '<span class="profil-muted">' + Portal.escapeHtml(formatKapanis(r.kapanis_tipi)) + '</span>';
      return (
        '<tr>' +
        '<td class="mono">' + Portal.escapeHtml(r.id) + '</td>' +
        '<td>' + Portal.escapeHtml(formatTs(r.giris_zamani)) + '</td>' +
        '<td>' + Portal.escapeHtml(formatTs(r.cikis_zamani)) + '</td>' +
        '<td class="mono">' + Portal.escapeHtml(r.ip_adresi || '—') + '</td>' +
        '<td>' + durum + '</td>' +
        '</tr>'
      );
    }

    function renderTable(rows) {
      var body = rows.length === 0
        ? '<tr><td colspan="5" class="profil-empty">Kayıt yok.</td></tr>'
        : rows.map(renderRow).join('');
      var card = document.createElement('div');
      card.className = 'profil-card';
      card.innerHTML =
        '<div class="profil-table-wrap">' +
        '<table class="profil-table">' +
        '<thead><tr><th>#</th><th>Giriş</th><th>Çıkış</th><th>IP</th><th>Durum</th></tr></thead>' +
        '<tbody>' + body + '</tbody>' +
        '</table>' +
        '</div>';
      stateEl.replaceWith(card);
    }

    function renderError(message) {
      var alert = document.createElement('p');
      alert.className = 'profil-alert profil-alert--error';
      alert.textContent = message;
      stateEl.replaceWith(alert);
    }

    Api.fetchProfileSessions()
      .then(function (data) {
        renderTable((data.oturumlar || []).slice(0, 10));
      })
      .catch(function (ex) {
        renderError((ex && ex.message) || '');
      });
  }

  Portal.onReady(init);
})();
