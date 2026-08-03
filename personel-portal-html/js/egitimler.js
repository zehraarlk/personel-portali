/*
 * Eğitimler — React frontend/src/pages/kaynaklar/Egitimler.jsx portu.
 * Kart stilleri React'taki gibi inline style olarak basılır; hover efektleri
 * (kart kenarlığı + ikon kutusu) mouseenter/mouseleave ile aynı değerlere
 * çekilir (React'ta hoveredId state'iyle yapılıyordu).
 */
(function () {
  'use strict';

  var ORANGE = '#f5a623';
  var BLUE = '#1c3a5e';
  var LINK_BLUE = '#3762e3';
  var RED = '#dc2626';
  var PAGE_SIZE = 6;

  function resolveLink(item, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (item[keys[i]]) return item[keys[i]];
    }
    return null;
  }

  var ORTAK_LINK_ALANLARI = [
    'video_url',
    'video',
    'video_link',
    'resmi_sayfa_url',
    'resmi_sayfa',
    'sunum_url',
    'dosya_yolu',
    'link',
  ];

  var LINK_BTN_STYLE =
    'flex: 1; height: 34px; justify-content: center; font-size: 13px; ' +
    'border: 0.5px solid rgba(0,0,0,0.15); border-radius: 8px; background: #f4f5f7; ' +
    'display: flex; align-items: center; gap: 5px; text-decoration: none; ' +
    'color: #333; white-space: nowrap';

  var items = [];
  var query = '';
  var loading = true;
  var error = null;
  var page = 1;

  var pageEl = null;
  var chrome = null;

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

  function renderCard(item) {
    var ortakLink = resolveLink(item, ORTAK_LINK_ALANLARI);

    var html =
      '<div style="display: flex; flex-direction: column; gap: 25px; padding: 14px 18px; ' +
      'background: #ffffff; border: 0.5px solid rgba(0,0,0,0.15); border-radius: 12px; ' +
      'transition: border-color 0.15s ease">' +
      '<div style="display: flex; align-items: center; gap: 16px">' +
      '<div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(28,58,94,0.10); ' +
      'display: flex; align-items: center; justify-content: center; flex-shrink: 0; ' +
      'transition: background-color 0.15s ease">' +
      '<i class="fas fa-graduation-cap" style="font-size: 20px; color: ' + BLUE +
      '; transition: color 0.15s ease" aria-hidden="true"></i>' +
      '</div>' +
      '<div style="flex: 1; min-width: 0">' +
      '<p style="font-weight: 500; font-size: 16px; margin: 0">' +
      Portal.escapeHtml(item.baslik) +
      '</p>' +
      '<p style="font-size: 13px; color: #888; margin: 6px 0 0; display: flex; align-items: center; gap: 14px">' +
      '<span style="display: flex; align-items: center; gap: 5px">' +
      '<i class="far fa-calendar-alt" style="color: ' + ORANGE + '; font-size: 13px" aria-hidden="true"></i>' +
      Portal.escapeHtml(item.tarih || '—') +
      '</span>' +
      '<span style="display: flex; align-items: center; gap: 5px">' +
      '<i class="far fa-file-alt" style="color: ' + ORANGE + '; font-size: 13px" aria-hidden="true"></i>' +
      Portal.escapeHtml(item.boyut || '—') +
      '</span>' +
      '</p>' +
      '</div>' +
      '</div>';

    if (ortakLink) {
      var escapedLink = Portal.escapeHtml(ortakLink);
      html +=
        '<div style="display: flex; gap: 8px">' +
        '<a href="' + escapedLink + '" target="_blank" rel="noopener noreferrer" ' +
        'class="eg-link-btn eg-link-btn--resmi" style="' + LINK_BTN_STYLE + '">' +
        '<i class="fas fa-globe" style="color: ' + LINK_BLUE + '" aria-hidden="true"></i>Resmi Sayfa' +
        '</a>' +
        '<a href="' + escapedLink + '" target="_blank" rel="noopener noreferrer" ' +
        'class="eg-link-btn eg-link-btn--video" style="' + LINK_BTN_STYLE + '">' +
        '<i class="fas fa-circle-play" style="color: ' + RED + '" aria-hidden="true"></i>Video' +
        '</a>' +
        '<a href="' + escapedLink + '" target="_blank" rel="noopener noreferrer" ' +
        'class="eg-link-btn eg-link-btn--sunum" style="' + LINK_BTN_STYLE + '">' +
        '<i class="fas fa-file-pdf" style="color: ' + ORANGE + '" aria-hidden="true"></i>Sunum' +
        '</a>' +
        '</div>';
    }

    html += '</div>';
    return html;
  }

  function setContent(html) {
    /* İlk 2 çocuk KaynaklarChrome'a ait (header + toolbar) */
    while (pageEl.children.length > 2) pageEl.removeChild(pageEl.lastElementChild);
    pageEl.insertAdjacentHTML('beforeend', html);
  }

  function clearSearch() {
    query = '';
    page = 1;
    chrome.setQuery('');
    render();
  }

  function bindEvents(totalPages, safePage) {
    var children = Array.prototype.slice.call(pageEl.children);

    var grid = null;
    var pagination = null;
    children.forEach(function (el) {
      if (el.style && el.style.display === 'grid') grid = el;
      if (el.style && el.style.display === 'flex' && el.style.justifyContent === 'center') {
        pagination = el;
      }
    });

    if (grid) {
      Array.prototype.forEach.call(grid.children, function (card) {
        var iconBox = card.firstElementChild ? card.firstElementChild.firstElementChild : null;
        card.addEventListener('mouseenter', function () {
          card.style.border = '0.5px solid ' + ORANGE;
          if (iconBox) iconBox.style.background = 'rgba(28,58,94,0.20)';
        });
        card.addEventListener('mouseleave', function () {
          card.style.border = '0.5px solid rgba(0,0,0,0.15)';
          if (iconBox) iconBox.style.background = 'rgba(28,58,94,0.10)';
        });
      });
    }

    if (pagination) {
      var buttons = pagination.querySelectorAll('button');
      buttons.forEach(function (button, index) {
        if (index === 0) {
          button.addEventListener('click', function () {
            page = Math.max(1, page - 1);
            render();
          });
        } else if (index === buttons.length - 1) {
          button.addEventListener('click', function () {
            page = Math.min(totalPages, page + 1);
            render();
          });
        } else {
          button.addEventListener('click', function () {
            page = index;
            render();
          });
        }
      });
    }
  }

  function render() {
    var filtered = getFiltered();
    var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    var safePage = Math.min(page, totalPages);
    var paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    var trimmed = query.trim();

    var html = '';

    if (trimmed && !loading && !error) {
      html +=
        '<p class="protokoller-filter-note">"<strong>' +
        Portal.escapeHtml(trimmed) +
        '</strong>" için ' + filtered.length + ' sonuç</p>';
    }

    if (loading) {
      html +=
        '<div class="protokoller-state" role="status">' +
        '<span class="protokoller-state__pulse" aria-hidden="true"></span>' +
        'Eğitimler yükleniyor…' +
        '</div>';
    }

    if (!loading && error) {
      html +=
        '<p class="protokoller-state protokoller-state--error">' +
        Portal.escapeHtml(error) +
        '</p>';
    }

    if (!loading && !error && filtered.length === 0) {
      html +=
        '<div class="protokoller-empty">' +
        '<i class="fas fa-graduation-cap" aria-hidden="true"></i>' +
        '<h2>Sonuç bulunamadı</h2>' +
        '<p>Aramanızı değiştirerek tekrar deneyebilirsiniz.</p>' +
        '</div>';
    }

    if (!loading && !error && filtered.length > 0) {
      html +=
        '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); ' +
        'grid-template-rows: repeat(' + Math.ceil(PAGE_SIZE / 2) + ', minmax(140px, auto)); gap: 30px">' +
        paged.map(renderCard).join('') +
        '</div>';
    }

    if (!loading && !error && totalPages > 1) {
      var arrowStyle =
        'width: 34px; height: 34px; border: 0.5px solid rgba(0,0,0,0.15); border-radius: 8px; ' +
        'background: transparent; display: flex; align-items: center; justify-content: center; ';

      var numsHtml = '';
      for (var n = 1; n <= totalPages; n++) {
        var isActive = n === safePage;
        numsHtml +=
          '<button type="button"' + (isActive ? ' aria-current="page"' : '') +
          ' style="width: 34px; height: 34px; border: 0.5px solid ' +
          (isActive ? BLUE : 'rgba(0,0,0,0.15)') + '; border-radius: 8px; background: ' +
          (isActive ? BLUE : 'transparent') + '; color: ' + (isActive ? '#fff' : '#333') +
          '; font-weight: ' + (isActive ? '600' : '400') + '; font-size: 13px; cursor: pointer">' +
          n +
          '</button>';
      }

      html +=
        '<div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 28px">' +
        '<button type="button"' + (safePage === 1 ? ' disabled' : '') +
        ' aria-label="Önceki sayfa" style="' + arrowStyle +
        'opacity: ' + (safePage === 1 ? '0.4' : '1') + '; cursor: ' +
        (safePage === 1 ? 'default' : 'pointer') + '">' +
        '<i class="fas fa-chevron-left" style="font-size: 12px" aria-hidden="true"></i>' +
        '</button>' +
        numsHtml +
        '<button type="button"' + (safePage === totalPages ? ' disabled' : '') +
        ' aria-label="Sonraki sayfa" style="' + arrowStyle +
        'opacity: ' + (safePage === totalPages ? '0.4' : '1') + '; cursor: ' +
        (safePage === totalPages ? 'default' : 'pointer') + '">' +
        '<i class="fas fa-chevron-right" style="font-size: 12px" aria-hidden="true"></i>' +
        '</button>' +
        '</div>';
    }

    setContent(html);
    bindEvents(totalPages, safePage);
  }

  function init() {
    pageEl = document.querySelector('.kaynaklar-page');

    chrome = KaynaklarChrome.mount(pageEl, {
      pageKey: 'egitimler',
      query: query,
      onQueryChange: function (value) {
        query = value;
        page = 1;
        render();
      },
      onClear: clearSearch,
      iconClassName: 'fas fa-graduation-cap',
    });

    render();

    Api.fetchEgitimler()
      .then(function (data) {
        items = data.egitimler != null ? data.egitimler : [];
        error = null;
      })
      .catch(function () {
        error = 'Eğitimler yüklenirken bir sorun oluştu.';
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  Portal.onReady(init);
})();
