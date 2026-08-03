/*
 * Anketler — React frontend/src/pages/Anketler.jsx birebir portu.
 */
(function () {
  'use strict';

  var FILTERS = [
    { id: 'all', label: 'Tümü', iconKey: 'anketler' },
    { id: 'favorites', label: 'Favoriler', iconKey: 'favori', iconFallback: 'fas fa-star' },
    { id: 'active', label: 'Aktif', iconKey: 'aktif', iconFallback: 'fas fa-play' },
    { id: 'pending', label: 'Beklemede', iconKey: 'beklemede', iconFallback: 'fas fa-clock' },
    { id: 'completed', label: 'Tamamlanan', iconKey: 'tamam', iconFallback: 'fas fa-check' },
  ];

  /* useState karşılıkları */
  var rows = [];
  var loading = true;
  var error = '';
  var search = '';
  var filter = 'all';
  var sort = 'newest';

  var pageEl = null;
  var countStrong = null;
  var currentResult = null;
  var tabEntries = [];

  function emptyMessage(currentFilter, query) {
    if (currentFilter === 'favorites') return 'Henüz favori anketiniz bulunmuyor.';
    if (query) return 'Aradığınız kriterlere uygun anket bulunamadı.';
    return 'Bu kategoride anket bulunamadı.';
  }

  function statusFa(statusClass) {
    if (statusClass === 'is-pending') return 'fas fa-clock';
    if (statusClass === 'is-completed') return 'fas fa-check-circle';
    if (statusClass === 'is-expired') return 'fas fa-times-circle';
    return 'fas fa-play-circle';
  }

  /* useMemo(filtered) karşılığı */
  function getFiltered() {
    var q = search.trim().toLocaleLowerCase('tr-TR');
    var items = rows.filter(function (item) {
      if (filter === 'favorites') return Boolean(item.favorite);
      if (filter !== 'all' && item.kategori_slug !== filter) return false;
      return true;
    });

    if (q) {
      items = items.filter(function (item) {
        var hay = ((item.baslik || '') + ' ' + (item.excerpt || '') + ' ' + (item.aciklama || ''))
          .toLocaleLowerCase('tr-TR');
        return hay.indexOf(q) !== -1;
      });
    }

    items = items.slice().sort(function (a, b) {
      if (sort === 'popular') {
        return ((b.percent || 0) - (a.percent || 0)) || (b.id - a.id);
      }
      var dateA = Date.parse(a.baslangic_tarihi || '') || 0;
      var dateB = Date.parse(b.baslangic_tarihi || '') || 0;
      if (sort === 'oldest') return (dateA - dateB) || (a.id - b.id);
      return (dateB - dateA) || (b.id - a.id);
    });

    return items;
  }

  function buildCard(item) {
    var esc = Portal.escapeHtml;
    var article = document.createElement('article');
    article.className = 'ak-card';

    var badge = document.createElement('span');
    badge.className = 'ak-badge ' + (item.status_class || 'is-active');
    badge.innerHTML =
      '<i class="' + statusFa(item.status_class) + '" aria-hidden="true"></i>' +
      esc(item.status_label || 'Aktif');
    article.appendChild(badge);

    var media = document.createElement('div');
    media.className = 'ak-card__media';
    var frame = Media.frame({
      src: item.resim ? Portal.asset(item.resim) : Portal.BRAND_IMG,
      alt: item.baslik || '',
      forceCover: true,
    });
    if (frame) media.appendChild(frame);
    article.appendChild(media);

    var body = document.createElement('div');
    body.className = 'ak-card__body';
    var html =
      '<h2 class="ak-card__title">' + esc(item.baslik) + '</h2>' +
      '<p class="ak-card__desc">' + esc(item.excerpt || item.aciklama || '') + '</p>';
    if (item.date_label) {
      html +=
        '<p class="ak-card__meta">' +
        '<i class="fas fa-calendar-alt" aria-hidden="true"></i>' +
        esc(item.date_label) +
        '</p>';
    }
    html +=
      '<div class="ak-progress">' +
      '<div class="ak-progress__meta">' +
      '<span>' + esc(item.katilim_sayisi || 0) + '/' + esc(item.hedef_katilim || 1) + '</span>' +
      '<span>%' + esc(item.percent || 0) + '</span>' +
      '</div>' +
      '<div class="ak-progress__track">' +
      '<div class="ak-progress__bar" style="width: ' + Math.min(100, item.percent || 0) + '%"></div>' +
      '</div>' +
      '</div>';
    html +=
      '<a href="' + Portal.href('/anketler/' + item.id) + '" class="ak-card__cta' +
      (item.participated ? ' is-done' : '') + '">' +
      '<i class="' + (item.participated ? 'fas fa-eye' : 'fas fa-pen') + '" aria-hidden="true"></i>' +
      (item.participated ? 'Cevapları Gör' : 'Ankete Katıl') +
      '</a>';
    body.innerHTML = html;
    article.appendChild(body);

    return article;
  }

  function render() {
    var filtered = getFiltered();
    countStrong.textContent = filtered.length;

    var next;
    if (loading) {
      next = document.createElement('div');
      next.className = 'ak-state';
      next.textContent = 'Yükleniyor…';
    } else if (error) {
      next = document.createElement('div');
      next.className = 'ak-state is-error';
      next.textContent = error;
    } else if (filtered.length === 0) {
      next = document.createElement('div');
      next.className = 'ak-state';
      next.innerHTML =
        '<i class="' + SiteIcons.icon('anketler') + '" aria-hidden="true"></i>' +
        '<p>' + Portal.escapeHtml(emptyMessage(filter, search)) + '</p>';
    } else {
      next = document.createElement('div');
      next.className = 'ak-grid';
      filtered.forEach(function (item) {
        next.appendChild(buildCard(item));
      });
    }

    currentResult.replaceWith(next);
    currentResult = next;
  }

  function buildTabs() {
    var nav = pageEl.querySelector('.ak-tabs');
    FILTERS.forEach(function (tab) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ak-tab' + (filter === tab.id ? ' is-active' : '');
      var iconEl = document.createElement('i');
      iconEl.className = SiteIcons.icon(tab.iconKey, tab.iconFallback || 'fas fa-poll');
      iconEl.setAttribute('aria-hidden', 'true');
      btn.appendChild(iconEl);
      btn.appendChild(document.createTextNode(tab.label));
      btn.addEventListener('click', function () {
        filter = tab.id;
        updateTabs();
        render();
      });
      nav.appendChild(btn);
      tabEntries.push({ tab: tab, btn: btn, iconEl: iconEl });
    });
  }

  function updateTabs() {
    tabEntries.forEach(function (entry) {
      entry.btn.className = 'ak-tab' + (filter === entry.tab.id ? ' is-active' : '');
    });
  }

  function updateTabIcons() {
    tabEntries.forEach(function (entry) {
      entry.iconEl.className = SiteIcons.icon(entry.tab.iconKey, entry.tab.iconFallback || 'fas fa-poll');
    });
  }

  function init() {
    pageEl = document.querySelector('.anketler-page');
    countStrong = pageEl.querySelector('.ak-count strong');
    currentResult = pageEl.querySelector('.ak-count').nextElementSibling;

    buildTabs();
    SiteIcons.apply(document);
    SiteIcons.load().then(function () {
      SiteIcons.apply(document);
      updateTabIcons();
      render();
    });

    pageEl.querySelector('.ak-search').addEventListener('submit', function (e) {
      e.preventDefault();
      search = document.getElementById('anket-search').value.trim();
      render();
    });

    pageEl.querySelector('.ak-sort select').addEventListener('change', function (e) {
      sort = e.target.value;
      render();
    });

    loading = true;
    Api.fetchAnketler()
      .then(function (data) {
        rows = data && Array.isArray(data.anketler) ? data.anketler : [];
        error = '';
      })
      .catch(function (ex) {
        error = (ex && ex.message) || 'Anketler yüklenemedi.';
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  Portal.onReady(init);
})();
