/*
 * Duyurular — React frontend/src/pages/Duyurular.jsx birebir karşılığı.
 */
(function () {
  'use strict';

  var esc = Portal.escapeHtml;

  var EMPTY_DATA = {
    duyurular: [],
    kategoriler: [],
  };

  var DUYURULAR_PER_PAGE = 12;

  var SORT_OPTIONS = [
    { value: 'yeni', label: 'En Yeni', icon: 'new_releases' },
    { value: 'eski', label: 'En Eski', icon: 'history' },
    { value: 'az', label: 'A–Z', icon: 'sort_by_alpha' },
    { value: 'za', label: 'Z–A', icon: 'sort_by_alpha' },
  ];

  var DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  /* SortOptionIcon bileşeni */
  function sortOptionIconHtml(option, className) {
    className = className || '';
    var alfabetik = option.value === 'az' || option.value === 'za';

    if (!alfabetik) {
      return (
        '<span aria-hidden="true" class="material-symbols-outlined shrink-0 text-[18px] ' + className + '">' +
        option.icon +
        '</span>'
      );
    }

    var ilkHarf = option.value === 'az' ? 'A' : 'Z';
    var sonHarf = option.value === 'az' ? 'Z' : 'A';

    return (
      '<span aria-hidden="true" class="relative inline-flex h-5 w-[23px] shrink-0 ' + className + '">' +
      '<span class="absolute left-0 top-0 text-[10px] font-black leading-[10px]">' + ilkHarf + '</span>' +
      '<span class="absolute bottom-0 left-0 text-[10px] font-black leading-[10px]">' + sonHarf + '</span>' +
      '<span class="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[14px] leading-none">arrow_downward</span>' +
      '</span>'
    );
  }

  function getPaginationItems(currentPage, totalPages) {
    if (totalPages <= 7) {
      var all = [];
      for (var i = 1; i <= totalPages; i += 1) all.push(i);
      return all;
    }

    var items = [1];
    var rangeStart = Math.max(2, currentPage - 1);
    var rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    if (rangeStart > 2) items.push('left-ellipsis');

    for (var page = rangeStart; page <= rangeEnd; page += 1) {
      items.push(page);
    }

    if (rangeEnd < totalPages - 1) items.push('right-ellipsis');

    items.push(totalPages);
    return items;
  }

  function formatDate(value) {
    if (!value) return '';

    var parts = String(value).split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);

    return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
  }

  function getDuyuruTimestamp(duyuru) {
    if (duyuru && duyuru.tarih) {
      var timestamp = new Date(duyuru.tarih + 'T00:00:00').getTime();
      if (!Number.isNaN(timestamp)) return timestamp;
    }

    var numericId = Number(duyuru && duyuru.id);
    return Number.isFinite(numericId) ? numericId : 0;
  }

  function getCategoryIcon(category) {
    var value = (
      ((category && category.slug) != null ? category.slug : '') +
      ' ' +
      ((category && category.ad) != null ? category.ad : '')
    ).toLocaleLowerCase('tr-TR');

    if (value.indexOf('eğitim') !== -1 || value.indexOf('egitim') !== -1) return 'school';
    if (value.indexOf('etkinlik') !== -1) return 'event';
    if (value.indexOf('insan') !== -1 || value.indexOf('personel') !== -1) return 'groups';
    if (value.indexOf('sağlık') !== -1 || value.indexOf('saglik') !== -1) return 'health_and_safety';
    if (value.indexOf('teknoloji') !== -1 || value.indexOf('bilgi') !== -1) return 'devices';

    return 'campaign';
  }

  /* --- durum (useState karşılıkları) --- */
  var data = EMPTY_DATA;
  var kategori = '';
  var kategoriMenuAcik = false;
  var siralamaMenuAcik = false;
  var arama = '';
  var siralama = 'yeni';
  var sayfa = 1;
  var loading = true;
  var error = '';

  var loadToken = 0;

  /* son render'da hesaplanan türev değerler */
  var filtrelenmisDuyurular = [];
  var toplamSayfa = 1;
  var sayfaNumaralari = [];
  var listeDurumu = ''; // 'bos-kategori' | 'grid' | 'bos-arama'

  var root = null;
  var mountedNode = null;

  /* DuyuruCard bileşeni */
  function duyuruCardHtml(duyuru) {
    var detayYolu = '/duyurular/' + encodeURIComponent(duyuru.id);

    var mediaHtml;
    if (duyuru.resim) {
      var frame = Media.frame({
        src: Portal.asset(duyuru.resim),
        alt: duyuru.baslik,
        className:
          'absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.05]',
      });
      mediaHtml = frame ? frame.outerHTML : '';
    } else {
      mediaHtml =
        '<div aria-hidden="true" class="absolute inset-0 bg-gradient-to-br from-[#eef3f7] via-[#e8eff5] to-[#d7e1ea]"></div>';
    }

    return (
      '<a href="' + Portal.href(detayYolu) + '"' +
      ' aria-label="' + esc(duyuru.baslik + ' duyurusunun detayını aç') + '"' +
      ' class="group flex h-full cursor-pointer select-none flex-col overflow-hidden rounded-[22px] border border-[#dde5eb] bg-white shadow-[0_14px_34px_rgba(2,40,66,0.08)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.012] hover:border-[#022842]/28 hover:shadow-[0_24px_56px_rgba(2,40,66,0.16)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#022842]/20">' +
      '<div class="relative">' +
      '<div class="relative aspect-[16/10] overflow-hidden rounded-t-[22px] bg-[#e8eef3]">' +
      mediaHtml +
      '<div class="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#022842]/14 to-transparent"></div>' +
      '</div>' +
      (duyuru.kategori
        ? '<div class="absolute bottom-0 left-4 right-4 z-10 translate-y-1/2">' +
          '<span class="inline-flex max-w-full items-center rounded-full bg-[#022842] px-4.5 py-1.5 text-[13px] font-semibold leading-5 text-white shadow-[0_10px_22px_rgba(2,40,66,0.22)]">' +
          '<span class="truncate">' + esc(duyuru.kategori) + '</span>' +
          '</span>' +
          '</div>'
        : '') +
      '</div>' +
      '<div class="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6 ' + (duyuru.kategori ? 'pt-8' : 'pt-5') + '">' +
      (duyuru.tarih
        ? '<time datetime="' + esc(duyuru.tarih) + '" class="inline-flex items-center gap-2 text-sm font-medium text-[#6a7784]">' +
          '<span class="material-symbols-outlined text-[18px] text-[#7b8794]">calendar_month</span>' +
          esc(formatDate(duyuru.tarih)) +
          '</time>'
        : '') +
      '<h2 class="mt-4 line-clamp-2 min-h-[3.3rem] text-[1.3rem] font-black leading-[1.12] tracking-tight text-[#022842] transition-all duration-300 group-hover:translate-x-0.5 sm:text-[1.45rem]">' +
      esc(duyuru.baslik) +
      '</h2>' +
      '<span aria-hidden="true" class="mt-2 h-[3px] w-9 rounded-full bg-[#022842] transition-all duration-300 group-hover:w-11"></span>' +
      (duyuru.aciklama
        ? '<p class="mt-4 line-clamp-3 min-h-[5.7rem] text-[15px] leading-7 text-[#5d6977]">' + esc(duyuru.aciklama) + '</p>'
        : '<p class="mt-4 min-h-[5.7rem] text-[15px] leading-7 text-[#8a98a2]">Duyuru açıklaması bulunmuyor.</p>') +
      '<div class="mt-auto pt-5">' +
      '<span class="inline-flex min-h-[50px] w-full items-center justify-between gap-4 rounded-[14px] border border-[#022842]/18 bg-white px-5 text-[15px] font-bold text-[#022842] shadow-[0_8px_22px_rgba(2,40,66,0.06)] transition-all duration-300 group-hover:border-[#022842] group-hover:bg-[#022842] group-hover:text-white group-hover:shadow-[0_14px_30px_rgba(2,40,66,0.18)] sm:w-auto sm:min-w-[190px]">' +
      '<span>Detaylı Bilgi</span>' +
      '<span aria-hidden="true" class="text-[22px] leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>' +
      '</span>' +
      '</div>' +
      '</div>' +
      '</a>'
    );
  }

  /* useMemo(filtrelenmisDuyurular) karşılığı */
  function filtrele() {
    var sorgu = arama.trim().toLocaleLowerCase('tr-TR');

    var sonuclar = sorgu
      ? data.duyurular.filter(function (duyuru) {
          var aranacakMetin = [duyuru.baslik, duyuru.aciklama, duyuru.kategori, duyuru.tarih]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('tr-TR');

          return aranacakMetin.indexOf(sorgu) !== -1;
        })
      : data.duyurular;

    return sonuclar.slice().sort(function (a, b) {
      if (siralama === 'eski') {
        return getDuyuruTimestamp(a) - getDuyuruTimestamp(b);
      }

      if (siralama === 'az') {
        return String(a.baslik == null ? '' : a.baslik).localeCompare(
          String(b.baslik == null ? '' : b.baslik),
          'tr-TR',
          { sensitivity: 'base' }
        );
      }

      if (siralama === 'za') {
        return String(b.baslik == null ? '' : b.baslik).localeCompare(
          String(a.baslik == null ? '' : a.baslik),
          'tr-TR',
          { sensitivity: 'base' }
        );
      }

      return getDuyuruTimestamp(b) - getDuyuruTimestamp(a);
    });
  }

  function findAktifKategori() {
    for (var i = 0; i < data.kategoriler.length; i += 1) {
      if (data.kategoriler[i].slug === kategori) return data.kategoriler[i];
    }
    return null;
  }

  function loadingHtml() {
    return (
      '<div class="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8">' +
      '<div class="rounded-2xl border border-outline-variant/20 bg-white p-8 text-on-surface-variant shadow-sm">' +
      '<div class="flex items-center gap-3">' +
      '<span class="material-symbols-outlined animate-spin text-[#022842]">progress_activity</span>' +
      'Duyurular yükleniyor…' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function errorHtml() {
    return (
      '<div class="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8">' +
      '<div class="rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">' +
      '<div class="flex items-start gap-3">' +
      '<span class="material-symbols-outlined">error</span>' +
      '<div class="flex-1">' +
      '<p class="font-semibold">Duyurular yüklenemedi</p>' +
      '<p class="mt-1 text-sm">' + esc(error) + '</p>' +
      '<button type="button" class="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#022842] px-4 text-sm font-semibold text-white transition hover:bg-[#0a3a5c]">' +
      '<span class="material-symbols-outlined text-[18px]">refresh</span>' +
      'Yeniden dene' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function kategoriNavInnerHtml() {
    var aktifKategori = findAktifKategori();
    var aktifKategoriAdi = (aktifKategori && aktifKategori.ad) || 'Tüm Duyurular';

    var html =
      '<button type="button" aria-haspopup="menu" aria-expanded="' + (kategoriMenuAcik ? 'true' : 'false') + '"' +
      ' class="inline-flex h-[44px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#cfd9e2] bg-white px-4 py-2 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#022842]/35 hover:bg-[#f7fafc] focus:outline-none focus:ring-4 focus:ring-[#022842]/10">' +
      '<span class="inline-flex min-w-0 items-center gap-2">' +
      '<span class="material-symbols-outlined text-[18px] text-[#022842]">' +
      (aktifKategori ? getCategoryIcon(aktifKategori) : 'campaign') +
      '</span>' +
      '<span class="truncate">' + esc(kategori === '' ? 'Tüm Duyurular' : aktifKategoriAdi) + '</span>' +
      '</span>' +
      '<span class="material-symbols-outlined text-[19px] text-[#022842] transition-transform duration-200 ' + (kategoriMenuAcik ? 'rotate-180' : '') + '">expand_more</span>' +
      '</button>';

    if (kategoriMenuAcik) {
      html +=
        '<div role="menu" class="absolute left-0 top-full mt-2 min-w-[250px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]">' +
        '<button type="button" role="menuitemradio" aria-checked="' + (kategori === '' ? 'true' : 'false') + '"' +
        ' class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ' +
        (kategori === ''
          ? 'bg-[#e8f1f8] text-[#022842]'
          : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]') +
        '">' +
        '<span class="material-symbols-outlined text-[18px] text-[#022842]">campaign</span>' +
        'Tüm Duyurular' +
        '</button>' +
        data.kategoriler
          .map(function (item) {
            return (
              '<button type="button" role="menuitemradio" aria-checked="' + (kategori === item.slug ? 'true' : 'false') + '"' +
              ' class="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ' +
              (kategori === item.slug
                ? 'bg-[#e8f1f8] text-[#022842]'
                : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]') +
              '">' +
              '<span class="material-symbols-outlined text-[18px] text-[#022842]">' + getCategoryIcon(item) + '</span>' +
              esc(item.ad) +
              '</button>'
            );
          })
          .join('') +
        '</div>';
    }

    return html;
  }

  function siralamaNavInnerHtml() {
    var aktifSiralama = SORT_OPTIONS[0];
    for (var i = 0; i < SORT_OPTIONS.length; i += 1) {
      if (SORT_OPTIONS[i].value === siralama) {
        aktifSiralama = SORT_OPTIONS[i];
        break;
      }
    }

    var html =
      '<button type="button" aria-haspopup="menu" aria-expanded="' + (siralamaMenuAcik ? 'true' : 'false') + '"' +
      ' class="inline-flex h-[44px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#cfd9e2] bg-white px-4 py-2 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#022842]/35 hover:bg-[#f7fafc] focus:outline-none focus:ring-4 focus:ring-[#022842]/10">' +
      '<span class="inline-flex min-w-0 items-center gap-2">' +
      sortOptionIconHtml(aktifSiralama, 'text-[#022842]') +
      '<span class="truncate">' + aktifSiralama.label + '</span>' +
      '</span>' +
      '<span class="material-symbols-outlined text-[19px] text-[#022842] transition-transform duration-200 ' + (siralamaMenuAcik ? 'rotate-180' : '') + '">expand_more</span>' +
      '</button>';

    if (siralamaMenuAcik) {
      html +=
        '<div role="menu" class="absolute right-0 top-full mt-2 min-w-[230px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]">' +
        SORT_OPTIONS.map(function (option, index) {
          return (
            '<button type="button" role="menuitemradio" aria-checked="' + (siralama === option.value ? 'true' : 'false') + '"' +
            ' class="' + (index > 0 ? 'mt-1 ' : '') + 'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ' +
            (siralama === option.value
              ? 'bg-[#e8f1f8] text-[#022842]'
              : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]') +
            '">' +
            sortOptionIconHtml(option, siralama === option.value ? 'text-[#022842]' : 'text-[#33495a]') +
            option.label +
            '</button>'
          );
        }).join('') +
        '</div>';
    }

    return html;
  }

  function paginationHtml() {
    var html =
      '<nav class="mx-auto mt-8 flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[#022842]/10 bg-white/90 p-1.5 shadow-[0_6px_18px_rgba(2,40,66,0.08)] backdrop-blur sm:gap-2 sm:p-2" aria-label="Duyuru sayfaları">' +
      '<button type="button"' + (sayfa === 1 ? ' disabled' : '') +
      ' class="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#d5dde5] bg-white px-3 text-xs font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:text-sm" aria-label="Önceki sayfa">' +
      '<span class="material-symbols-outlined text-lg">chevron_left</span>' +
      '<span class="hidden sm:inline">Önceki</span>' +
      '</button>';

    sayfaNumaralari.forEach(function (item) {
      if (typeof item === 'number') {
        html +=
          '<button type="button"' + (sayfa === item ? ' aria-current="page"' : '') +
          ' class="relative inline-flex h-10 min-w-10 items-center justify-center overflow-hidden rounded-lg border px-3 text-sm font-extrabold transition ' +
          (sayfa === item
            ? "border-[#022842] bg-[#022842] text-white shadow-[0_5px_14px_rgba(2,40,66,0.22)] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-[#f5a623] after:content-['']"
            : 'border-[#d5dde5] bg-white text-[#536575] shadow-sm hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842]') +
          '">' +
          item +
          '</button>';
      } else {
        html +=
          '<span class="inline-flex h-10 min-w-6 items-center justify-center text-lg font-bold text-[#7a8994]" aria-hidden="true">…</span>';
      }
    });

    html +=
      '<button type="button"' + (sayfa === toplamSayfa ? ' disabled' : '') +
      ' class="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#d5dde5] bg-white px-3 text-xs font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:text-sm" aria-label="Sonraki sayfa">' +
      '<span class="hidden sm:inline">Sonraki</span>' +
      '<span class="material-symbols-outlined text-lg">chevron_right</span>' +
      '</button>' +
      '</nav>';

    return html;
  }

  function contentHtml() {
    filtrelenmisDuyurular = filtrele();
    toplamSayfa = Math.max(1, Math.ceil(filtrelenmisDuyurular.length / DUYURULAR_PER_PAGE));
    if (sayfa > toplamSayfa) sayfa = toplamSayfa;

    var baslangic = (sayfa - 1) * DUYURULAR_PER_PAGE;
    var sayfadakiDuyurular = filtrelenmisDuyurular.slice(baslangic, baslangic + DUYURULAR_PER_PAGE);
    sayfaNumaralari = getPaginationItems(sayfa, toplamSayfa);

    var aktifKategori = findAktifKategori();
    var aktifKategoriAdi = (aktifKategori && aktifKategori.ad) || 'Tüm Duyurular';

    var html = '<div class="mx-auto w-full max-w-[1440px] px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-4">';

    /* başlık */
    html +=
      '<header class="mb-6 flex w-full items-center gap-4 bg-[#f7fafc] py-3">' +
      '<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#073a68_0%,#022842_100%)] text-white shadow-[0_8px_20px_rgba(2,40,66,0.2)]">' +
      '<span class="material-symbols-outlined text-[30px]">campaign</span>' +
      '</div>' +
      '<div class="min-w-0">' +
      '<h1 class="text-2xl font-black leading-tight tracking-tight text-[#022842] md:text-[26px]">Duyurular</h1>' +
      '<p class="mt-1 text-xs font-medium leading-5 text-[#1f4f7f] md:text-[13px]">Kurum içi güncel duyuru ve bilgilendirmeleri tek ekrandan takip edebilirsiniz.</p>' +
      '</div>' +
      '</header>';

    /* arama + filtre çubuğu */
    html += '<div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">';

    html +=
      '<div class="relative w-full lg:min-w-0 lg:flex-1">' +
      '<label for="duyuru-search" class="sr-only">Duyurularda ara</label>' +
      '<span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-[#022842]">search</span>' +
      '<input id="duyuru-search" type="text" role="searchbox" inputmode="search" value="' + esc(arama) + '" placeholder="Duyurularda ara..." autocomplete="off" class="h-[44px] w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-9 text-sm text-[#0b1c30] shadow-sm outline-none transition placeholder:text-[#7a8994] hover:border-[#022842]/35 focus:border-[#022842] focus:ring-4 focus:ring-[#022842]/10" />' +
      (arama
        ? '<button type="button" class="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#022842] transition hover:bg-[#eef5fa] hover:text-[#0a3a5c]" aria-label="Aramayı temizle">' +
          '<span class="material-symbols-outlined text-[18px]">close</span>' +
          '</button>'
        : '') +
      '</div>';

    if (data.kategoriler.length > 0) {
      html +=
        '<nav class="relative z-50 w-full lg:w-[230px] lg:shrink-0" aria-label="Duyuru kategorileri">' +
        kategoriNavInnerHtml() +
        '</nav>';
    }

    html +=
      '<nav class="relative z-50 w-full lg:w-[230px] lg:shrink-0" aria-label="Duyuru sıralama seçenekleri">' +
      siralamaNavInnerHtml() +
      '</nav>';

    html += '</div>';

    /* liste bölümü */
    html += '<section class="scroll-mt-4 pb-10">';

    html +=
      '<div class="mb-5 flex items-center gap-3">' +
      '<div class="flex shrink-0 items-center gap-2">' +
      '<span class="material-symbols-outlined text-[24px] leading-none text-[#022842]">' +
      (kategori === '' ? 'campaign' : getCategoryIcon(aktifKategori)) +
      '</span>' +
      '<h2 class="text-lg font-extrabold leading-none tracking-tight text-[#022842] md:text-[16px]">' +
      esc(kategori === '' ? 'Tüm Duyurular' : aktifKategoriAdi) +
      '</h2>' +
      '<span class="text-sm font-semibold italic text-[#516b86] md:text-[14px]">– ' +
      (filtrelenmisDuyurular.length > 0 ? filtrelenmisDuyurular.length + ' duyuru' : 'Duyuru bulunamadı') +
      '</span>' +
      '</div>' +
      '<div aria-hidden="true" class="h-px flex-1 bg-[#022842]/20"></div>' +
      '</div>';

    if (data.duyurular.length === 0) {
      listeDurumu = 'bos-kategori';
      html +=
        '<div class="rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white to-[#eef5fa] px-6 py-12 text-center shadow-[0_10px_28px_rgba(2,40,66,0.07)]">' +
        '<span class="material-symbols-outlined mb-4 text-5xl text-[#7a8994]">campaign</span>' +
        '<h3 class="text-lg font-extrabold text-[#0b1c30]">Bu kategoride duyuru bulunamadı</h3>' +
        '<p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">Bu kategoriye henüz duyuru eklenmemiş olabilir. Diğer içerikleri görmek için tüm duyuru arşivine dönebilirsiniz.</p>' +
        (kategori !== ''
          ? '<button type="button" class="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#022842] px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(2,40,66,0.18)] transition hover:bg-[#0a3a5c]">' +
            '<span class="material-symbols-outlined text-[19px]">campaign</span>' +
            'Tüm duyuruları göster' +
            '</button>'
          : '') +
        '</div>';
    } else if (filtrelenmisDuyurular.length > 0) {
      listeDurumu = 'grid';
      html +=
        '<div class="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">' +
        sayfadakiDuyurular.map(duyuruCardHtml).join('') +
        '</div>';

      if (toplamSayfa > 1) {
        html += paginationHtml();
      }
    } else {
      listeDurumu = 'bos-arama';
      html +=
        '<div class="rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white to-[#eef5fa] px-6 py-12 text-center shadow-[0_10px_28px_rgba(2,40,66,0.07)]">' +
        '<span class="material-symbols-outlined mb-4 text-5xl text-[#7a8994]">search_off</span>' +
        '<h3 class="text-lg font-extrabold text-[#0b1c30]">Aradığınız duyuru bulunamadı</h3>' +
        '<p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">“' + esc(arama.trim()) + '” ifadesiyle eşleşen bir sonuç yok. Farklı bir kelime deneyin veya aramayı temizleyin.</p>' +
        '<button type="button" class="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-[#022842]/15 bg-white px-4 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0]">' +
        '<span class="material-symbols-outlined text-[19px]">backspace</span>' +
        'Aramayı temizle' +
        '</button>' +
        '</div>';
    }

    html += '</section>';
    html += '</div>';

    return html;
  }

  function setContent(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    var node = template.content.firstElementChild;

    if (mountedNode && mountedNode.parentNode) {
      mountedNode.parentNode.removeChild(mountedNode);
    }

    /* içerik her zaman footer'dan önce gelir */
    root.insertBefore(node, root.lastElementChild);
    mountedNode = node;
  }

  function bindKategoriNav(nav) {
    if (!nav) return;

    var toggle = nav.querySelector('button[aria-haspopup="menu"]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        kategoriMenuAcik = !kategoriMenuAcik;
        siralamaMenuAcik = false;
        updateMenus();
      });
    }

    nav.querySelectorAll('button[role="menuitemradio"]').forEach(function (btn, index) {
      var slug = index === 0 ? '' : data.kategoriler[index - 1].slug;
      btn.addEventListener('click', function () {
        var degisti = kategori !== slug;
        kategori = slug;
        kategoriMenuAcik = false;
        if (degisti) {
          sayfa = 1;
          load(); /* kategori fetch bağımlılığı — yeniden yükle */
        } else {
          updateMenus();
        }
      });
    });
  }

  function bindSiralamaNav(nav) {
    if (!nav) return;

    var toggle = nav.querySelector('button[aria-haspopup="menu"]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        siralamaMenuAcik = !siralamaMenuAcik;
        kategoriMenuAcik = false;
        updateMenus();
      });
    }

    nav.querySelectorAll('button[role="menuitemradio"]').forEach(function (btn, index) {
      var value = SORT_OPTIONS[index].value;
      btn.addEventListener('click', function () {
        var degisti = siralama !== value;
        siralama = value;
        siralamaMenuAcik = false;
        if (degisti) {
          sayfa = 1;
          renderPage();
        } else {
          updateMenus();
        }
      });
    });
  }

  function updateMenus() {
    if (!mountedNode) return;

    var kategoriNav = mountedNode.querySelector('nav[aria-label="Duyuru kategorileri"]');
    if (kategoriNav) {
      kategoriNav.innerHTML = kategoriNavInnerHtml();
      bindKategoriNav(kategoriNav);
    }

    var siralamaNav = mountedNode.querySelector('nav[aria-label="Duyuru sıralama seçenekleri"]');
    if (siralamaNav) {
      siralamaNav.innerHTML = siralamaNavInnerHtml();
      bindSiralamaNav(siralamaNav);
    }
  }

  function sayfayaGit(yeniSayfa) {
    var hedefSayfa = Math.min(Math.max(yeniSayfa, 1), toplamSayfa);

    if (hedefSayfa === sayfa) return;

    sayfa = hedefSayfa;
    renderPage();

    window.requestAnimationFrame(function () {
      var liste = mountedNode && mountedNode.querySelector('section.scroll-mt-4');
      if (liste) {
        liste.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function bindPagination() {
    var nav = mountedNode.querySelector('nav[aria-label="Duyuru sayfaları"]');
    if (!nav) return;

    var numaralar = sayfaNumaralari.filter(function (item) {
      return typeof item === 'number';
    });

    var buttons = nav.querySelectorAll('button');
    buttons.forEach(function (btn, index) {
      if (index === 0) {
        btn.addEventListener('click', function () {
          sayfayaGit(sayfa - 1);
        });
      } else if (index === buttons.length - 1) {
        btn.addEventListener('click', function () {
          sayfayaGit(sayfa + 1);
        });
      } else {
        var hedef = numaralar[index - 1];
        btn.addEventListener('click', function () {
          sayfayaGit(hedef);
        });
      }
    });
  }

  function bindContent() {
    if (!mountedNode) return;

    if (loading) return;

    if (error) {
      var retry = mountedNode.querySelector('button');
      if (retry) {
        retry.addEventListener('click', function () {
          load(); /* reloadToken karşılığı */
        });
      }
      return;
    }

    var input = mountedNode.querySelector('#duyuru-search');
    if (input) {
      input.addEventListener('input', function (event) {
        var selStart = event.target.selectionStart;
        var selEnd = event.target.selectionEnd;
        arama = event.target.value;
        sayfa = 1;
        renderPage();
        var yeniInput = mountedNode.querySelector('#duyuru-search');
        if (yeniInput) {
          yeniInput.focus();
          try {
            yeniInput.setSelectionRange(selStart, selEnd);
          } catch (e) {
            /* type=search dışı tarayıcı farkları */
          }
        }
      });
    }

    var temizle = mountedNode.querySelector('button[aria-label="Aramayı temizle"]');
    if (temizle) {
      temizle.addEventListener('click', function () {
        arama = '';
        sayfa = 1;
        renderPage();
      });
    }

    bindKategoriNav(mountedNode.querySelector('nav[aria-label="Duyuru kategorileri"]'));
    bindSiralamaNav(mountedNode.querySelector('nav[aria-label="Duyuru sıralama seçenekleri"]'));

    var section = mountedNode.querySelector('section.scroll-mt-4');
    if (!section) return;

    if (listeDurumu === 'grid') {
      bindPagination();
    } else if (listeDurumu === 'bos-kategori') {
      var tumunuGoster = section.querySelector('button');
      if (tumunuGoster) {
        tumunuGoster.addEventListener('click', function () {
          kategori = '';
          arama = '';
          sayfa = 1;
          load();
        });
      }
    } else if (listeDurumu === 'bos-arama') {
      var aramaTemizle = section.querySelector('button');
      if (aramaTemizle) {
        aramaTemizle.addEventListener('click', function () {
          arama = '';
          sayfa = 1;
          renderPage();
        });
      }
    }
  }

  function renderPage() {
    var html;
    if (loading) {
      html = loadingHtml();
    } else if (error) {
      html = errorHtml();
    } else {
      html = contentHtml();
    }

    setContent(html);
    bindContent();
  }

  function load() {
    loading = true;
    error = '';
    renderPage();

    var current = ++loadToken;

    Api.fetchDuyurular(kategori)
      .then(function (result) {
        if (current !== loadToken) return;
        data = {
          duyurular: Array.isArray(result.duyurular) ? result.duyurular : [],
          kategoriler: Array.isArray(result.kategoriler) ? result.kategoriler : [],
        };
        loading = false;
        renderPage();
      })
      .catch(function (requestError) {
        if (current !== loadToken) return;
        error = (requestError && requestError.message) || 'Duyurular yüklenemedi.';
        data = {
          duyurular: [],
          kategoriler: data.kategoriler,
        };
        loading = false;
        renderPage();
      });
  }

  function init() {
    var mainEl = document.querySelector('main');
    root = mainEl ? mainEl.firstElementChild : null;
    if (!root) return;

    /* menüler açıkken dış tıklama / Escape ile kapatma */
    document.addEventListener('pointerdown', function (event) {
      if (!kategoriMenuAcik && !siralamaMenuAcik) return;

      var kategoriNav = mountedNode && mountedNode.querySelector('nav[aria-label="Duyuru kategorileri"]');
      var siralamaNav = mountedNode && mountedNode.querySelector('nav[aria-label="Duyuru sıralama seçenekleri"]');
      var degisti = false;

      if (kategoriMenuAcik && kategoriNav && !kategoriNav.contains(event.target)) {
        kategoriMenuAcik = false;
        degisti = true;
      }

      if (siralamaMenuAcik && siralamaNav && !siralamaNav.contains(event.target)) {
        siralamaMenuAcik = false;
        degisti = true;
      }

      if (degisti) updateMenus();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && (kategoriMenuAcik || siralamaMenuAcik)) {
        kategoriMenuAcik = false;
        siralamaMenuAcik = false;
        updateMenus();
      }
    });

    load();
  }

  Portal.onReady(init);
})();
