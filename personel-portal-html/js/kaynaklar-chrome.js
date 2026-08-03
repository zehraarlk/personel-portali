/*
 * Kaynaklar sayfalarının ortak başlık + arama + hızlı erişim satırı —
 * React frontend/src/pages/kaynaklar/KaynaklarChrome.jsx + config.js portu.
 * Kullanım:
 *   var chrome = KaynaklarChrome.mount(pageEl, {
 *     pageKey, query, onQueryChange, onClear,
 *     title?, description?, searchPlaceholder?, searchId?, iconClassName?
 *   });
 *   chrome.setQuery('...'); // programatik sorgu değişiminde input + Temizle senkronu
 */
(function () {
  'use strict';

  /* frontend/src/pages/kaynaklar/config.js — KAYNAK_QUICK_LINKS */
  var KAYNAK_QUICK_LINKS = [
    {
      to: '/protokoller',
      label: 'Protokoller',
      iconKey: 'protokoller',
    },
    {
      to: '/dokumanlar',
      label: 'Dokümanlar',
      iconKey: 'dokumanlar',
    },
    {
      to: '/mevzuatlar',
      label: 'Mevzuatlar',
      iconKey: 'mevzuatlar',
    },
    {
      to: '/egitimler',
      label: 'Eğitimler',
      iconKey: 'egitimler',
    },
  ];

  /* frontend/src/pages/kaynaklar/config.js — KAYNAK_PAGES */
  var KAYNAK_PAGES = {
    protokoller: {
      title: 'Protokoller',
      description:
        'Kurumsal indirim ve personel anlaşmalarını inceleyin; belgeye tek tıkla ulaşın.',
      searchPlaceholder: 'Protokol veya kurum adı ara…',
      searchId: 'protokol-ara',
      statLabel: 'protokol',
      iconKey: 'protokoller',
    },

    dokumanlar: {
      title: 'Dokümanlar',
      description:
        'Kurumsal formlar, belgeler ve personel dokümanlarına buradan ulaşın.',
      searchPlaceholder: 'Doküman adı ara…',
      searchId: 'dokuman-ara',
      statLabel: 'aktif doküman',
      iconKey: 'dokumanlar',
    },

    mevzuatlar: {
      title: 'Mevzuatlar',
      description:
        'Personelimizi ilgilendiren kanun, yönetmelik ve mevzuat metinlerine buradan ulaşabilirsiniz.',
      searchPlaceholder: 'Kanun veya mevzuat adı ara…',
      searchId: 'mevzuat-ara',
      statLabel: 'aktif mevzuat',
      iconKey: 'mevzuatlar',
    },

    egitimler: {
      title: 'Eğitimler',
      description:
        'Personel eğitim materyallerine ve ilgili kaynaklara buradan erişin.',
      searchPlaceholder: 'Eğitim adı ara…',
      searchId: 'egitim-ara',
      statLabel: 'aktif eğitim',
      iconKey: 'egitimler',
    },
  };

  function mount(container, options) {
    options = options || {};
    var page = KAYNAK_PAGES[options.pageKey] || {};

    var resolvedTitle = options.title != null ? options.title : page.title;
    var resolvedDescription =
      options.description != null ? options.description : page.description;
    var resolvedPlaceholder =
      options.searchPlaceholder != null
        ? options.searchPlaceholder
        : page.searchPlaceholder;
    var resolvedSearchId =
      options.searchId != null
        ? options.searchId
        : page.searchId != null
          ? page.searchId
          : options.pageKey + '-ara';
    var routePath = Portal.route();

    function headIconClass() {
      return options.iconClassName || SiteIcons.icon(page.iconKey || options.pageKey);
    }

    var header = document.createElement('header');
    header.className = 'mevzuat-head';
    header.innerHTML =
      '<div class="mevzuat-head-left">' +
      '<span class="mevzuat-head-icon">' +
      '<i class="' + Portal.escapeHtml(headIconClass()) + '" aria-hidden="true"></i>' +
      '</span>' +
      '<div>' +
      '<h1>' + Portal.escapeHtml(resolvedTitle) + '</h1>' +
      '<p>' + Portal.escapeHtml(resolvedDescription) + '</p>' +
      '</div>' +
      '</div>';

    var tabsHtml = KAYNAK_QUICK_LINKS.map(function (item) {
      var active =
        routePath === item.to || routePath.indexOf(item.to + '/') === 0;
      return (
        '<a href="' + Portal.escapeHtml(Portal.href(item.to)) + '"' +
        ' class="prt-tabs__link' + (active ? ' is-active' : '') + '"' +
        (active ? ' aria-current="page"' : '') +
        '>' +
        '<i class="' + Portal.escapeHtml(SiteIcons.icon(item.iconKey)) + '" aria-hidden="true"></i>' +
        Portal.escapeHtml(item.label) +
        '</a>'
      );
    }).join('');

    var toolbar = document.createElement('div');
    toolbar.className = 'mevzuat-toolbar-row';
    toolbar.innerHTML =
      '<div class="prt-search mevzuat-toolbar-row__search">' +
      '<label class="prt-search__field" for="' + Portal.escapeHtml(resolvedSearchId) + '">' +
      '<i class="' + Portal.escapeHtml(SiteIcons.icon('arama')) + '" aria-hidden="true"></i>' +
      '<input id="' + Portal.escapeHtml(resolvedSearchId) + '" type="search" placeholder="' +
      Portal.escapeHtml(resolvedPlaceholder) + '" autocomplete="off" />' +
      '</label>' +
      '</div>' +
      '<nav class="prt-tabs mevzuat-toolbar-row__tabs" aria-label="Hızlı erişim">' +
      tabsHtml +
      '</nav>';

    var searchWrap = toolbar.querySelector('.prt-search');
    var input = toolbar.querySelector('input');

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'prt-search__clear';
    clearBtn.textContent = 'Temizle';

    var query = options.query == null ? '' : String(options.query);
    input.value = query;

    /* React'ta buton yalnızca query doluyken render edilir */
    function updateClear() {
      if (query) {
        if (!clearBtn.parentNode) searchWrap.appendChild(clearBtn);
      } else if (clearBtn.parentNode) {
        searchWrap.removeChild(clearBtn);
      }
    }
    updateClear();

    input.addEventListener('input', function () {
      query = input.value;
      updateClear();
      if (options.onQueryChange) options.onQueryChange(input.value);
    });

    clearBtn.addEventListener('click', function () {
      if (options.onClear) options.onClear();
    });

    container.appendChild(header);
    container.appendChild(toolbar);

    function refreshIcons() {
      var headIcon = header.querySelector('.mevzuat-head-icon i');
      if (headIcon) headIcon.className = headIconClass();
      var searchIcon = toolbar.querySelector('.prt-search__field i');
      if (searchIcon) searchIcon.className = SiteIcons.icon('arama');
      var links = toolbar.querySelectorAll('.prt-tabs__link');
      KAYNAK_QUICK_LINKS.forEach(function (item, index) {
        var el = links[index] && links[index].querySelector('i');
        if (el) el.className = SiteIcons.icon(item.iconKey);
      });
    }

    /* useSiteIcons: ikonlar DB'den gelince yeniden boya */
    SiteIcons.load().then(refreshIcons);

    return {
      setQuery: function (value) {
        query = value == null ? '' : String(value);
        if (input.value !== query) input.value = query;
        updateClear();
      },
      refreshIcons: refreshIcons,
    };
  }

  window.KaynaklarChrome = {
    KAYNAK_QUICK_LINKS: KAYNAK_QUICK_LINKS,
    KAYNAK_PAGES: KAYNAK_PAGES,
    mount: mount,
  };
})();
