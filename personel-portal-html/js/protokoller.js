/*
 * Protokoller — React frontend/src/pages/kaynaklar/Protokoller.jsx portu.
 */
(function () {
  'use strict';

  var page = KaynaklarChrome.KAYNAK_PAGES.protokoller;

  var items = [];
  var query = '';
  var loading = true;
  var error = null;

  var pageEl = null;
  var chrome = null;

  function normalizeIcon(ikon) {
    var raw = (ikon || 'fas fa-file-signature').trim();
    if (raw.indexOf('fa-') === 0 && raw.indexOf(' ') === -1) return 'fas ' + raw;
    return raw;
  }

  function getFiltered() {
    var q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return items;
    return items.filter(function (item) {
      var haystack = ((item.baslik || '') + ' ' + (item.aciklama || '')).toLocaleLowerCase(
        'tr-TR'
      );
      return haystack.indexOf(q) !== -1;
    });
  }

  function renderItem(item) {
    var href = item.dosya_yolu || item.resmi_sayfa || '';

    var content =
      '<span class="prt-item__icon" aria-hidden="true">' +
      '<i class="' + Portal.escapeHtml(normalizeIcon(item.ikon)) + '"></i>' +
      '</span>' +
      '<span class="prt-item__body">' +
      '<span class="prt-item__title">' + Portal.escapeHtml(item.baslik) + '</span>' +
      (item.aciklama
        ? '<span class="prt-item__desc">' + Portal.escapeHtml(item.aciklama) + '</span>'
        : '') +
      '<span class="prt-item__meta">' +
      '<span><i class="far fa-calendar-alt" aria-hidden="true"></i>' +
      Portal.escapeHtml(item.tarih || '—') +
      '</span>' +
      '<span><i class="far fa-file-alt" aria-hidden="true"></i>' +
      Portal.escapeHtml(item.boyut || '—') +
      '</span>' +
      '</span>' +
      '</span>' +
      (href
        ? '<span class="prt-item__action">İncele<i class="' +
          Portal.escapeHtml(SiteIcons.icon('sonraki')) +
          '" aria-hidden="true"></i></span>'
        : '');

    return (
      '<li class="prt-item">' +
      (href
        ? '<a href="' + Portal.escapeHtml(href) + '" class="prt-item__link" target="_blank" rel="noopener noreferrer" aria-label="' +
          Portal.escapeHtml(item.baslik + ' belgesini aç') + '">' + content + '</a>'
        : '<div class="prt-item__link is-static">' + content + '</div>') +
      '</li>'
    );
  }

  function setContent(html) {
    /* İlk 2 çocuk KaynaklarChrome'a ait (header + toolbar) */
    while (pageEl.children.length > 2) pageEl.removeChild(pageEl.lastElementChild);
    pageEl.insertAdjacentHTML('beforeend', html);
  }

  function render() {
    var filtered = getFiltered();
    var trimmed = query.trim();
    var html = '';

    html += '<div class="prt-results" aria-live="polite">';
    if (!loading && !error) {
      html += '<p class="prt-results__count">';
      if (trimmed) {
        html +=
          '“<strong>' + Portal.escapeHtml(trimmed) + '</strong>” için <strong>' +
          filtered.length + '</strong> sonuç';
      } else {
        html += 'Toplam <strong>' + filtered.length + '</strong> ' + page.statLabel;
      }
      html += '</p>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    if (loading) {
      html += '<p class="prt-state" role="status">Protokoller yükleniyor…</p>';
    }

    if (!loading && error) {
      html +=
        '<p class="prt-state prt-state--error" role="alert">' +
        Portal.escapeHtml(error) +
        '</p>';
    }

    if (!loading && !error && filtered.length === 0) {
      html +=
        '<div class="prt-empty">' +
        '<i class="' + Portal.escapeHtml(SiteIcons.icon('protokoller')) + '" aria-hidden="true"></i>' +
        '<h2>Sonuç bulunamadı</h2>' +
        '<p>Aramanızı değiştirerek tekrar deneyebilirsiniz.</p>' +
        (trimmed
          ? '<button type="button" class="prt-search__btn">Aramayı temizle</button>'
          : '') +
        '</div>';
    }

    if (!loading && !error && filtered.length > 0) {
      html += '<ul class="prt-list">' + filtered.map(renderItem).join('') + '</ul>';
    }

    setContent(html);

    var emptyClear = pageEl.querySelector('.prt-empty .prt-search__btn');
    if (emptyClear) emptyClear.addEventListener('click', clearSearch);
  }

  function clearSearch() {
    query = '';
    chrome.setQuery('');
    render();
  }

  function init() {
    pageEl = document.querySelector('.kaynaklar-page');

    chrome = KaynaklarChrome.mount(pageEl, {
      pageKey: 'protokoller',
      query: query,
      onQueryChange: function (value) {
        query = value;
        render();
      },
      onClear: clearSearch,
    });

    render();
    SiteIcons.load().then(render);

    Api.fetchProtokoller()
      .then(function (data) {
        items = data.protokoller != null ? data.protokoller : [];
        error = null;
      })
      .catch(function () {
        error = 'Protokoller yüklenirken bir sorun oluştu.';
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  Portal.onReady(init);
})();
