/*
 * Dokümanlar — React frontend/src/pages/kaynaklar/Dokumanlar.jsx portu
 * (DocumentsDropdown dahil).
 */
(function () {
  'use strict';

  var DEFAULT_PAGE_SIZE = 8;

  var PAGE_SIZE_OPTIONS = [
    { value: 8, label: '8 / sayfa' },
    { value: 12, label: '12 / sayfa' },
    { value: 16, label: '16 / sayfa' },
  ];

  var CHEVRON_DOWN_SVG =
    '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">' +
    '<path d="m5.5 7.75 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>' +
    '</svg>';

  var CHECK_SVG =
    '<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false">' +
    '<path d="m4.5 10.25 3.25 3.25 7.75-7.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>' +
    '</svg>';

  var DROPDOWN_ID = 'documents-page-size';
  var DROPDOWN_LABEL = 'Sayfa başına doküman sayısı';

  function getFileType(item) {
    var rawType = item.dosya_turu || item.uzanti || item.tip;

    if (rawType) {
      return String(rawType).replace('.', '').trim().toUpperCase();
    }

    var filePath = item.dosya_yolu || item.resmi_sayfa || '';
    var cleanPath = filePath.split('?')[0].split('#')[0];
    var fileName = cleanPath.split('/').pop() || '';

    return fileName.indexOf('.') !== -1
      ? fileName.split('.').pop().toUpperCase()
      : 'DOSYA';
  }

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLocaleLowerCase('tr-TR');
  }

  function parseDocumentDate(value) {
    if (!value) return 0;

    var text = String(value).trim();
    var turkishDate = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

    if (turkishDate) {
      var day = turkishDate[1];
      var month = turkishDate[2];
      var year = turkishDate[3];
      return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
    }

    var parsed = Date.parse(text);
    return isNaN(parsed) ? 0 : parsed;
  }

  function getDocumentHref(item) {
    return item.dosya_yolu || item.resmi_sayfa || '';
  }

  /* --- durum --- */
  var items = [];
  var query = '';
  var search = '';
  var viewMode = 'grid';
  var currentPage = 1;
  var pageSize = DEFAULT_PAGE_SIZE;
  var loading = true;
  var error = '';

  /* DocumentsDropdown durumu */
  var dropdownOpen = false;
  var pendingFocus = null; /* 'trigger' | opsiyon index'i */
  var globalListenersBound = false;

  var pageEl = null;
  var chrome = null;

  var fetchSeq = 0;
  var fetchTimer = null;

  function scheduleFetch() {
    if (fetchTimer) clearTimeout(fetchTimer);
    fetchSeq += 1;
    var seq = fetchSeq;

    loading = true;
    error = '';

    fetchTimer = setTimeout(function () {
      Api.fetchDokumanlar(search)
        .then(function (data) {
          if (seq !== fetchSeq) return;
          items = Array.isArray(data.dokumanlar) ? data.dokumanlar : [];
        })
        .catch(function (requestError) {
          if (seq !== fetchSeq) return;
          items = [];
          error = requestError.message || 'Dokümanlar yüklenirken bir sorun oluştu.';
        })
        .finally(function () {
          if (seq !== fetchSeq) return;
          loading = false;
          render();
        });
    }, 300);
  }

  function getFilteredItems() {
    var normalizedQuery = normalizeText(search);

    var result = items.filter(function (item) {
      if (!normalizedQuery) return true;

      var searchableText = normalizeText(
        (item.baslik || '') + ' ' + (item.aciklama || '') + ' ' + getFileType(item)
      );

      return searchableText.indexOf(normalizedQuery) !== -1;
    });

    return result.slice().sort(function (first, second) {
      return parseDocumentDate(second.tarih) - parseDocumentDate(first.tarih);
    });
  }

  function handleQueryChange(value) {
    query = value;
    var nextSearch = value.trim();
    if (nextSearch !== search) {
      search = nextSearch;
      currentPage = 1;
      scheduleFetch();
    }
    render();
  }

  function clearSearch() {
    query = '';
    if (search !== '') {
      search = '';
      currentPage = 1;
      scheduleFetch();
    }
    chrome.setQuery('');
    render();
  }

  function renderCard(item) {
    var href = getDocumentHref(item);
    var isDownloadable = Boolean(item.dosya_yolu);

    var actionHtml = '';
    if (href) {
      actionHtml =
        '<a class="documents-card__action" href="' + Portal.escapeHtml(href) + '"' +
        (isDownloadable
          ? ' download="" rel="noopener noreferrer"'
          : ' target="_blank" rel="noopener noreferrer"') +
        ' aria-label="' +
        Portal.escapeHtml(
          (item.baslik || 'Doküman') + ' ' + (isDownloadable ? 'indir' : 'görüntüle')
        ) +
        '">' +
        '<i class="' + (isDownloadable ? 'fas fa-download' : 'fas fa-external-link-alt') + '" aria-hidden="true"></i>' +
        '</a>';
    }

    return (
      '<article class="documents-card" style="border-radius: 24px; overflow: hidden">' +
      '<span class="documents-card__file documents-card__file--plain" aria-hidden="true">' +
      '<i class="far fa-file-alt documents-card__file-icon"></i>' +
      '</span>' +
      '<div class="documents-card__content">' +
      '<h2>' + Portal.escapeHtml(item.baslik || 'İsimsiz doküman') + '</h2>' +
      '<p>' + Portal.escapeHtml(item.aciklama || 'Bu doküman için açıklama bulunmuyor.') + '</p>' +
      '</div>' +
      '<footer class="documents-card__footer">' +
      '<div class="documents-card__meta">' +
      (item.tarih
        ? '<span><i class="far fa-calendar-alt" aria-hidden="true"></i>' +
          Portal.escapeHtml(item.tarih) + '</span>'
        : '') +
      (item.boyut
        ? '<span><i class="far fa-file-alt" aria-hidden="true"></i>' +
          Portal.escapeHtml(item.boyut) + '</span>'
        : '') +
      '</div>' +
      actionHtml +
      '</footer>' +
      '</article>'
    );
  }

  function renderDropdown() {
    var selectedOption = null;
    for (var i = 0; i < PAGE_SIZE_OPTIONS.length; i++) {
      if (String(PAGE_SIZE_OPTIONS[i].value) === String(pageSize)) {
        selectedOption = PAGE_SIZE_OPTIONS[i];
        break;
      }
    }
    if (!selectedOption) selectedOption = PAGE_SIZE_OPTIONS[0];

    var html =
      '<div class="documents-dropdown documents-dropdown--compact documents-dropdown--up' +
      (dropdownOpen ? ' is-open' : '') +
      '">' +
      '<button id="' + DROPDOWN_ID + '" type="button" class="documents-dropdown__trigger"' +
      ' aria-label="' + DROPDOWN_LABEL + '" aria-haspopup="listbox"' +
      ' aria-expanded="' + (dropdownOpen ? 'true' : 'false') + '"' +
      ' aria-controls="' + DROPDOWN_ID + '-menu">' +
      '<span class="documents-dropdown__value">' + Portal.escapeHtml(selectedOption.label) + '</span>' +
      '<span class="documents-dropdown__chevron" aria-hidden="true">' + CHEVRON_DOWN_SVG + '</span>' +
      '</button>';

    if (dropdownOpen) {
      html +=
        '<div id="' + DROPDOWN_ID + '-menu" class="documents-dropdown__menu" role="listbox"' +
        ' aria-label="' + DROPDOWN_LABEL + '"' +
        ' aria-activedescendant="' + DROPDOWN_ID + '-option-' + String(pageSize) + '">';

      html += PAGE_SIZE_OPTIONS.map(function (option) {
        var selected = String(option.value) === String(pageSize);
        return (
          '<button id="' + DROPDOWN_ID + '-option-' + String(option.value) + '" type="button"' +
          ' class="documents-dropdown__option' + (selected ? ' is-selected' : '') + '"' +
          ' role="option" aria-selected="' + (selected ? 'true' : 'false') + '">' +
          '<span class="documents-dropdown__option-main">' +
          '<span>' + Portal.escapeHtml(option.label) + '</span>' +
          '</span>' +
          '<span class="documents-dropdown__option-tail" aria-hidden="true">' +
          (selected ? CHECK_SVG : '') +
          '</span>' +
          '</button>'
        );
      }).join('');

      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function focusOption(index) {
    var menu = document.getElementById(DROPDOWN_ID + '-menu');
    if (!menu) return;
    var optionButtons = menu.querySelectorAll('[role="option"]');
    if (optionButtons[index]) optionButtons[index].focus();
  }

  function openAndFocusSelected() {
    dropdownOpen = true;
    var selectedIndex = 0;
    for (var i = 0; i < PAGE_SIZE_OPTIONS.length; i++) {
      if (String(PAGE_SIZE_OPTIONS[i].value) === String(pageSize)) {
        selectedIndex = i;
        break;
      }
    }
    pendingFocus = selectedIndex;
    render();
  }

  function chooseOption(nextValue) {
    pageSize = Number(nextValue);
    currentPage = 1;
    dropdownOpen = false;
    pendingFocus = 'trigger';
    render();
  }

  function onDocumentPointerDown(event) {
    var root = pageEl.querySelector('.documents-dropdown');
    if (!root || !root.contains(event.target)) {
      dropdownOpen = false;
      render();
    }
  }

  function onDocumentKeyDown(event) {
    if (event.key === 'Escape') {
      dropdownOpen = false;
      pendingFocus = 'trigger';
      render();
    }
  }

  function syncGlobalListeners() {
    if (dropdownOpen && !globalListenersBound) {
      document.addEventListener('pointerdown', onDocumentPointerDown);
      document.addEventListener('keydown', onDocumentKeyDown);
      globalListenersBound = true;
    } else if (!dropdownOpen && globalListenersBound) {
      document.removeEventListener('pointerdown', onDocumentPointerDown);
      document.removeEventListener('keydown', onDocumentKeyDown);
      globalListenersBound = false;
    }
  }

  function setContent(html) {
    /* İlk 2 çocuk KaynaklarChrome'a ait (header + toolbar) */
    while (pageEl.children.length > 2) pageEl.removeChild(pageEl.lastElementChild);
    pageEl.insertAdjacentHTML('beforeend', html);
  }

  function bindEvents() {
    var noteButton = pageEl.querySelector('.documents-result-note button');
    if (noteButton) noteButton.addEventListener('click', clearSearch);

    var emptyButton = pageEl.querySelector('.documents-empty button');
    if (emptyButton) emptyButton.addEventListener('click', clearSearch);

    var arrows = pageEl.querySelectorAll('.documents-pagination__arrow');
    if (arrows[0]) {
      arrows[0].addEventListener('click', function () {
        currentPage = Math.max(1, currentPage - 1);
        render();
      });
    }
    if (arrows[1]) {
      arrows[1].addEventListener('click', function () {
        var totalPages = Math.max(1, Math.ceil(getFilteredItems().length / pageSize));
        currentPage = Math.min(totalPages, currentPage + 1);
        render();
      });
    }

    var pageButtons = pageEl.querySelectorAll('.documents-pagination__page');
    pageButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentPage = Number(button.textContent);
        render();
      });
    });

    var trigger = document.getElementById(DROPDOWN_ID);
    if (trigger) {
      trigger.addEventListener('click', function () {
        dropdownOpen = !dropdownOpen;
        render();
      });
      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          openAndFocusSelected();
        }
      });
    }

    var menu = document.getElementById(DROPDOWN_ID + '-menu');
    if (menu) {
      var optionButtons = menu.querySelectorAll('[role="option"]');
      optionButtons.forEach(function (button, index) {
        button.addEventListener('click', function () {
          chooseOption(PAGE_SIZE_OPTIONS[index].value);
        });
        button.addEventListener('keydown', function (event) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusOption((index + 1) % PAGE_SIZE_OPTIONS.length);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusOption((index - 1 + PAGE_SIZE_OPTIONS.length) % PAGE_SIZE_OPTIONS.length);
          } else if (event.key === 'Home') {
            event.preventDefault();
            focusOption(0);
          } else if (event.key === 'End') {
            event.preventDefault();
            focusOption(PAGE_SIZE_OPTIONS.length - 1);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            dropdownOpen = false;
            pendingFocus = 'trigger';
            render();
          }
        });
      });
    }

    var viewButtons = pageEl.querySelectorAll('.documents-view-switch button');
    if (viewButtons[0]) {
      viewButtons[0].addEventListener('click', function () {
        viewMode = 'grid';
        render();
      });
    }
    if (viewButtons[1]) {
      viewButtons[1].addEventListener('click', function () {
        viewMode = 'list';
        render();
      });
    }
  }

  function render() {
    var filteredItems = getFilteredItems();
    var totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    var visibleItems = filteredItems.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    var html = '';

    if (search && !loading && !error) {
      html +=
        '<div class="documents-result-note">' +
        '<span>“<strong>' + Portal.escapeHtml(search) + '</strong>” için ' +
        filteredItems.length + ' sonuç</span>' +
        '<button type="button">Aramayı temizle</button>' +
        '</div>';
    }

    if (loading) {
      html +=
        '<div class="documents-state" role="status">' +
        '<span class="documents-state__spinner" aria-hidden="true"></span>' +
        'Dokümanlar yükleniyor…' +
        '</div>';
    }

    if (!loading && error) {
      html +=
        '<div class="documents-state documents-state--error" role="alert">' +
        '<i class="fas fa-exclamation-circle" aria-hidden="true"></i>' +
        Portal.escapeHtml(error) +
        '</div>';
    }

    if (!loading && !error && filteredItems.length === 0) {
      html +=
        '<div class="documents-empty">' +
        '<span class="documents-empty__icon" aria-hidden="true">' +
        '<i class="far fa-folder-open"></i>' +
        '</span>' +
        '<h2>Doküman bulunamadı</h2>' +
        '<p>Arama ifadenizi değiştirerek tekrar deneyin.</p>' +
        '<button type="button">Aramayı temizle</button>' +
        '</div>';
    }

    if (!loading && !error && visibleItems.length > 0) {
      html +=
        '<section class="documents-list documents-list--' + viewMode +
        '" aria-label="Doküman listesi" style="margin-top: 1.5rem">' +
        visibleItems.map(renderCard).join('') +
        '</section>';
    }

    var footerRendered = !loading && !error && filteredItems.length > 0;
    if (!footerRendered) {
      /* React'ta sayfalama unmount olunca dropdown state'i sıfırlanır */
      dropdownOpen = false;
    }

    if (footerRendered) {
      var pagesHtml = '';
      var visiblePages = [];
      for (var n = 1; n <= totalPages; n++) {
        if (
          totalPages <= 5 ||
          n === 1 ||
          n === totalPages ||
          Math.abs(n - currentPage) <= 1
        ) {
          visiblePages.push(n);
        }
      }
      visiblePages.forEach(function (pageNumber, index) {
        var previousPage = visiblePages[index - 1];
        var showGap = previousPage && pageNumber - previousPage > 1;
        pagesHtml +=
          '<span class="documents-pagination__item">' +
          (showGap ? '<span class="documents-pagination__gap">…</span>' : '') +
          '<button type="button" class="documents-pagination__page' +
          (currentPage === pageNumber ? ' is-active' : '') + '"' +
          (currentPage === pageNumber ? ' aria-current="page"' : '') + '>' +
          pageNumber +
          '</button>' +
          '</span>';
      });

      html +=
        '<footer class="documents-pagination" aria-label="Sayfalama">' +
        '<span>Toplam ' + filteredItems.length + ' doküman</span>' +
        '<div class="documents-pagination__controls">' +
        '<button type="button" class="documents-pagination__arrow"' +
        (currentPage === 1 ? ' disabled' : '') +
        ' aria-label="Önceki sayfa">' +
        '<i class="fas fa-chevron-left" aria-hidden="true"></i>' +
        '</button>' +
        pagesHtml +
        '<button type="button" class="documents-pagination__arrow"' +
        (currentPage === totalPages ? ' disabled' : '') +
        ' aria-label="Sonraki sayfa">' +
        '<i class="fas fa-chevron-right" aria-hidden="true"></i>' +
        '</button>' +
        renderDropdown() +
        '<div class="documents-view-switch" aria-label="Görünüm seçimi">' +
        '<button type="button" class="' + (viewMode === 'grid' ? 'is-active' : '') +
        '" aria-label="Kart görünümü" aria-pressed="' + (viewMode === 'grid' ? 'true' : 'false') + '">' +
        '<i class="fas fa-th-large" aria-hidden="true"></i>' +
        '</button>' +
        '<button type="button" class="' + (viewMode === 'list' ? 'is-active' : '') +
        '" aria-label="Liste görünümü" aria-pressed="' + (viewMode === 'list' ? 'true' : 'false') + '">' +
        '<i class="fas fa-list" aria-hidden="true"></i>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</footer>';
    }

    /* Yeniden çizim odağı düşürmesin: id'li öğe (dropdown) odaktaysa geri ver */
    var activeId =
      document.activeElement && pageEl.contains(document.activeElement)
        ? document.activeElement.id
        : '';

    setContent(html);
    bindEvents();
    syncGlobalListeners();

    if (pendingFocus !== null) {
      var focusTarget = pendingFocus;
      pendingFocus = null;
      window.requestAnimationFrame(function () {
        if (focusTarget === 'trigger') {
          var trigger = document.getElementById(DROPDOWN_ID);
          if (trigger) trigger.focus();
        } else {
          focusOption(focusTarget);
        }
      });
    } else if (activeId) {
      var previouslyFocused = document.getElementById(activeId);
      if (previouslyFocused) previouslyFocused.focus();
    }
  }

  function init() {
    pageEl = document.querySelector('.kaynaklar-page');

    chrome = KaynaklarChrome.mount(pageEl, {
      pageKey: 'dokumanlar',
      query: query,
      onQueryChange: handleQueryChange,
      onClear: clearSearch,
      iconClassName: 'far fa-file-alt',
    });

    render();
    scheduleFetch();
  }

  Portal.onReady(init);
})();
