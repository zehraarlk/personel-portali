/*
 * Mevzuatlar — React frontend/src/pages/kaynaklar/Mevzuatlar.jsx portu.
 */
(function () {
  'use strict';

  var SAYFA_BASI = 9;

  function normalizeIcon(ikon) {
    var raw = (ikon || 'fas fa-balance-scale').trim();
    if (raw.indexOf('fa-') === 0 && raw.indexOf(' ') === -1) {
      return 'fas ' + raw;
    }
    return raw;
  }

  var items = [];
  var altKategoriler = [];
  var altKategori = null;
  var query = '';
  var sayfa = 0;
  var loading = true;
  var error = null;
  var menuAcik = false;

  var ilkYuklemeTamam = false;
  var oncekiAltKategori = null;

  var pageEl = null;
  var chrome = null;

  var fetchSeq = 0;
  var gecikmeTimer = null;

  function scheduleFetch() {
    if (gecikmeTimer) clearTimeout(gecikmeTimer);
    fetchSeq += 1;
    var seq = fetchSeq;

    if (!ilkYuklemeTamam) {
      loading = true;
    }
    error = null;

    var kategoriDegisti = oncekiAltKategori !== altKategori;
    oncekiAltKategori = altKategori;
    var bekleSuresi = kategoriDegisti ? 0 : 300;

    gecikmeTimer = setTimeout(function () {
      Api.fetchMevzuatlar(query.trim(), altKategori)
        .then(function (data) {
          if (seq !== fetchSeq) return;
          items = (data && data.mevzuatlar) != null ? data.mevzuatlar : [];
          altKategoriler =
            (data && data.alt_kategoriler) != null ? data.alt_kategoriler : [];
          error = null;
        })
        .catch(function () {
          if (seq !== fetchSeq) return;
          items = [];
          error = 'Mevzuatlar yüklenirken bir sorun oluştu.';
        })
        .finally(function () {
          if (seq !== fetchSeq) return;
          loading = false;
          ilkYuklemeTamam = true;
          render();
        });
    }, bekleSuresi);
  }

  function clearSearch() {
    if (query !== '') {
      query = '';
      sayfa = 0;
      scheduleFetch();
    }
    chrome.setQuery('');
    render();
  }

  function handleQueryChange(value) {
    if (value !== query) {
      query = value;
      sayfa = 0;
      scheduleFetch();
    }
    render();
  }

  function scrollToFiltre() {
    var filtre = pageEl.querySelector('.mevzuat-filter-bar');
    if (filtre) filtre.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function selectKategori(slug) {
    var degisti = altKategori !== slug || query !== '';
    altKategori = slug;
    if (query !== '') {
      query = '';
      chrome.setQuery('');
    }
    menuAcik = false;
    if (degisti) {
      sayfa = 0;
      scheduleFetch();
    }
    render();
    scrollToFiltre();
  }

  function renderCard(item) {
    var href = item.dosya_yolu || item.resmi_sayfa || '';

    var inner =
      '<div class="mevzuat-card__head">' +
      '<span class="mevzuat-card__icon" aria-hidden="true">' +
      '<i class="' + Portal.escapeHtml(normalizeIcon(item.ikon)) + '"></i>' +
      '</span>' +
      '<h2 class="mevzuat-card__title">' + Portal.escapeHtml(item.baslik) + '</h2>' +
      '</div>' +
      '<p class="mevzuat-card__desc">' +
      Portal.escapeHtml(item.aciklama || 'Açıklama bulunmuyor.') +
      '</p>' +
      '<div class="mevzuat-card__foot">' +
      '<span class="mevzuat-card__meta">' +
      '<i class="far fa-calendar-alt" aria-hidden="true"></i>' +
      Portal.escapeHtml(item.tarih || '—') +
      '</span>' +
      '<span class="mevzuat-card__meta">' +
      '<i class="far fa-file-alt" aria-hidden="true"></i>' +
      Portal.escapeHtml(item.boyut || '—') +
      '</span>' +
      (href
        ? '<span class="mevzuat-card__link">Görüntüle<i class="fas fa-arrow-right" aria-hidden="true"></i></span>'
        : '') +
      '</div>';

    if (href) {
      return (
        '<a class="mevzuat-card" href="' + Portal.escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' +
        Portal.escapeHtml(item.baslik + ' bağlantısını aç') + '">' +
        inner +
        '</a>'
      );
    }
    return '<article class="mevzuat-card">' + inner + '</article>';
  }

  function setContent(html) {
    /* İlk 2 çocuk KaynaklarChrome'a ait (header + toolbar) */
    while (pageEl.children.length > 2) pageEl.removeChild(pageEl.lastElementChild);
    pageEl.insertAdjacentHTML('beforeend', html);
  }

  function bindEvents() {
    var menuBtn = pageEl.querySelector('.mevzuat-menu__btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        menuAcik = !menuAcik;
        render();
      });
    }

    var overlay = pageEl.querySelector('.mevzuat-menu__overlay');
    if (overlay) {
      overlay.addEventListener('click', function () {
        menuAcik = false;
        render();
      });
    }

    var menuItems = pageEl.querySelectorAll('.mevzuat-menu__item');
    menuItems.forEach(function (button, index) {
      button.addEventListener('click', function () {
        if (index === 0) {
          selectKategori(null);
        } else {
          selectKategori(altKategoriler[index - 1].slug);
        }
      });
    });

    var emptyClear = pageEl.querySelector('.protokoller-empty .protokoller-toolbar__btn');
    if (emptyClear) emptyClear.addEventListener('click', clearSearch);

    var arrows = pageEl.querySelectorAll('.mevzuat-pagination__arrow');
    if (arrows[0]) {
      arrows[0].addEventListener('click', function () {
        sayfa = Math.max(0, sayfa - 1);
        render();
        scrollToFiltre();
      });
    }
    if (arrows[1]) {
      arrows[1].addEventListener('click', function () {
        var toplamSayfa = Math.max(1, Math.ceil(items.length / SAYFA_BASI));
        sayfa = Math.min(toplamSayfa - 1, sayfa + 1);
        render();
        scrollToFiltre();
      });
    }

    var nums = pageEl.querySelectorAll('.mevzuat-pagination__num');
    nums.forEach(function (button, index) {
      button.addEventListener('click', function () {
        sayfa = index;
        render();
        scrollToFiltre();
      });
    });
  }

  function render() {
    var filtered = items;
    var toplamSayfa = Math.max(1, Math.ceil(filtered.length / SAYFA_BASI));
    var gosterilenler = filtered.slice(
      sayfa * SAYFA_BASI,
      sayfa * SAYFA_BASI + SAYFA_BASI
    );

    var aktifAltKategoriAdi = 'Tümü';
    if (altKategori) {
      aktifAltKategoriAdi = 'Seçili kategori';
      for (var i = 0; i < altKategoriler.length; i++) {
        if (altKategoriler[i].slug === altKategori) {
          aktifAltKategoriAdi =
            altKategoriler[i].ad != null ? altKategoriler[i].ad : 'Seçili kategori';
          break;
        }
      }
    }

    var html = '';

    html +=
      '<div class="mevzuat-filter-bar">' +
      '<p class="mevzuat-filter-bar__label">Kategori: <strong>' +
      Portal.escapeHtml(aktifAltKategoriAdi) +
      '</strong></p>' +
      '<div class="mevzuat-menu">' +
      '<button type="button" class="mevzuat-menu__btn" aria-expanded="' +
      (menuAcik ? 'true' : 'false') +
      '" aria-controls="mevzuat-kategori-listesi">' +
      '<i class="fas fa-bars" aria-hidden="true"></i>Kategoriler' +
      '</button>';

    if (menuAcik) {
      html +=
        '<button type="button" class="mevzuat-menu__overlay" aria-label="Kategori menüsünü kapat"></button>' +
        '<div id="mevzuat-kategori-listesi" class="mevzuat-menu__list">' +
        '<button type="button" class="mevzuat-menu__item' +
        (altKategori === null ? ' is-active' : '') + '">' +
        '<i class="fas fa-list" aria-hidden="true"></i>Tümü' +
        '</button>' +
        altKategoriler
          .map(function (kategori) {
            return (
              '<button type="button" class="mevzuat-menu__item' +
              (altKategori === kategori.slug ? ' is-active' : '') + '">' +
              '<i class="fas fa-balance-scale" aria-hidden="true"></i>' +
              Portal.escapeHtml(kategori.ad) +
              '</button>'
            );
          })
          .join('') +
        '</div>';
    }

    html += '</div></div>';

    if (query && !loading && !error) {
      html +=
        '<p class="protokoller-filter-note">“<strong>' +
        Portal.escapeHtml(query) +
        '</strong>” için ' + filtered.length + ' sonuç</p>';
    }

    if (loading) {
      html +=
        '<div class="protokoller-state" role="status">' +
        '<span class="protokoller-state__pulse" aria-hidden="true"></span>' +
        'Mevzuatlar yükleniyor…' +
        '</div>';
    }

    if (!loading && error) {
      html +=
        '<p class="protokoller-state protokoller-state--error" role="alert">' +
        Portal.escapeHtml(error) +
        '</p>';
    }

    if (!loading && !error && filtered.length === 0) {
      html +=
        '<div class="protokoller-empty">' +
        '<i class="fas fa-balance-scale" aria-hidden="true"></i>' +
        '<h2>Sonuç bulunamadı</h2>' +
        '<p>Aramanızı veya kategori seçiminizi değiştirerek tekrar deneyebilirsiniz.</p>' +
        (query
          ? '<button type="button" class="protokoller-toolbar__btn">Aramayı temizle</button>'
          : '') +
        '</div>';
    }

    if (!loading && !error && gosterilenler.length > 0) {
      html +=
        '<div class="mevzuat-grid">' + gosterilenler.map(renderCard).join('') + '</div>';
    }

    if (!loading && !error && toplamSayfa > 1) {
      var numsHtml = '';
      for (var n = 0; n < toplamSayfa; n++) {
        numsHtml +=
          '<button type="button"' +
          (sayfa === n ? ' aria-current="page"' : '') +
          ' class="mevzuat-pagination__num' + (sayfa === n ? ' is-active' : '') + '">' +
          (n + 1) +
          '</button>';
      }

      html +=
        '<div class="mevzuat-pagination">' +
        '<button type="button"' + (sayfa === 0 ? ' disabled' : '') +
        ' class="mevzuat-pagination__arrow" aria-label="Önceki sayfa">' +
        '<i class="fas fa-chevron-left" aria-hidden="true"></i>' +
        '</button>' +
        numsHtml +
        '<button type="button"' + (sayfa >= toplamSayfa - 1 ? ' disabled' : '') +
        ' class="mevzuat-pagination__arrow" aria-label="Sonraki sayfa">' +
        '<i class="fas fa-chevron-right" aria-hidden="true"></i>' +
        '</button>' +
        '</div>';
    }

    setContent(html);
    bindEvents();
  }

  function onWindowKeyDown(event) {
    if (menuAcik && event.key === 'Escape') {
      menuAcik = false;
      render();
    }
  }

  function init() {
    pageEl = document.querySelector('.kaynaklar-page');

    chrome = KaynaklarChrome.mount(pageEl, {
      pageKey: 'mevzuatlar',
      query: query,
      onQueryChange: handleQueryChange,
      onClear: clearSearch,
      iconClassName: 'fas fa-balance-scale',
    });

    window.addEventListener('keydown', onWindowKeyDown);

    render();
    scheduleFetch();
  }

  Portal.onReady(init);
})();
