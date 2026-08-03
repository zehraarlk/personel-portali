/*
 * Videolar sayfası — React frontend/src/pages/Videos.jsx birebir karşılığı.
 * Layout'un videoPage varyantı: h-dvh + overflow-hidden kabuk, footer sayfa
 * içeriğinin İÇİNDE (React'ta Videos bileşeni <Footer /> render eder).
 */
(function () {
  'use strict';

  var esc = Portal.escapeHtml;

  var VIDEOS_PER_PAGE = 9;

  var SORT_OPTIONS = [
    { value: 'yeni', label: 'En Yeni', icon: 'new_releases' },
    { value: 'eski', label: 'En Eski', icon: 'history' },
    { value: 'az', label: 'A–Z', icon: 'sort_by_alpha' },
    { value: 'kisa', label: 'Süresi Kısa', icon: 'schedule' },
    { value: 'uzun', label: 'Süresi Uzun', icon: 'more_time' },
  ];

  var VIDEO_TYPE_OPTIONS = [
    { value: '', label: 'Tümü', icon: 'grid_view' },
    { value: 'shorts', label: 'Shorts', icon: 'smartphone' },
    { value: 'uzun-videolar', label: 'Uzun Videolar', icon: 'smart_display' },
  ];

  /* ---- durum (React useState karşılıkları) ---- */
  var data = { videolar: [], kategoriler: [], vitrin: null };
  var videoTuru = '';
  var videoTuruMenuAcik = false;
  var siralamaMenuAcik = false;
  var arama = '';
  var siralama = 'yeni';
  var sayfa = 1;
  var acikVideo = null;
  var loading = true;
  var error = '';

  /* ---- öğe referansları (React useRef karşılıkları) ---- */
  var pageRoot = null;
  var footerEl = null;
  var contentNodes = [];
  var videoTuruMenuEl = null;
  var siralamaMenuEl = null;
  var aramaKutusuEl = null;
  var aramaInputEl = null;
  var videoListesiEl = null;
  var modalEl = null;
  var menuListenersAttached = false;
  var oncekiOverflow = '';

  /* ================= saf yardımcılar (Videos.jsx üstündeki fonksiyonlar) ================= */

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

  function parseVideoDuration(duration) {
    if (!duration) return Number.POSITIVE_INFINITY;

    var parts = String(duration)
      .trim()
      .split(':')
      .map(function (part) { return Number(part); });

    for (var i = 0; i < parts.length; i += 1) {
      if (Number.isNaN(parts[i])) return Number.POSITIVE_INFINITY;
    }

    return parts.reduce(function (total, part) { return total * 60 + part; }, 0);
  }

  function getVideoTimestamp(video) {
    var candidate = null;
    if (video) {
      if (video.created_at != null) candidate = video.created_at;
      else if (video.updated_at != null) candidate = video.updated_at;
      else if (video.yayin_tarihi != null) candidate = video.yayin_tarihi;
      else if (video.tarih != null) candidate = video.tarih;
    }

    if (candidate) {
      var timestamp = new Date(candidate).getTime();
      if (!Number.isNaN(timestamp)) return timestamp;
    }

    var numericId = Number(video ? video.id : undefined);
    return Number.isFinite(numericId) ? numericId : 0;
  }

  function isShortVideo(video) {
    var durationInSeconds = parseVideoDuration(video ? video.sure : undefined);

    return Number.isFinite(durationInSeconds) && durationInSeconds < 60;
  }

  function getVideoTypeInfo(video) {
    return isShortVideo(video)
      ? { label: 'Shorts', icon: 'smartphone' }
      : { label: 'Video', icon: 'smart_display' };
  }

  function getAutoplayEmbedUrl(embedUrl) {
    if (!embedUrl) return '';

    var separator = embedUrl.indexOf('?') !== -1 ? '&' : '?';

    return embedUrl + separator + 'autoplay=1&mute=1&playsinline=1&rel=0';
  }

  function getModalEmbedUrl(video) {
    if (!video) return '';

    if (video.embed_url) {
      var separator = video.embed_url.indexOf('?') !== -1 ? '&' : '?';
      return video.embed_url + separator + 'autoplay=1&playsinline=1&rel=0';
    }

    if (!video.youtube_url) return '';

    try {
      var url = new URL(video.youtube_url);
      var videoId = '';

      if (url.hostname.indexOf('youtu.be') !== -1) {
        videoId = url.pathname.replace(/^\//, '').split('/')[0];
      } else if (url.pathname.indexOf('/shorts/') === 0) {
        var shortsKalan = url.pathname.split('/shorts/')[1];
        videoId = shortsKalan != null ? shortsKalan.split('/')[0] : '';
      } else if (url.pathname.indexOf('/embed/') === 0) {
        var embedKalan = url.pathname.split('/embed/')[1];
        videoId = embedKalan != null ? embedKalan.split('/')[0] : '';
      } else {
        videoId = url.searchParams.get('v') || '';
      }

      return videoId
        ? 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&playsinline=1&rel=0'
        : '';
    } catch (err) {
      return '';
    }
  }

  /* ================= türetilmiş veriler (useMemo karşılıkları) ================= */

  function aktifVideoTuruBul() {
    for (var i = 0; i < VIDEO_TYPE_OPTIONS.length; i += 1) {
      if (VIDEO_TYPE_OPTIONS[i].value === videoTuru) return VIDEO_TYPE_OPTIONS[i];
    }
    return VIDEO_TYPE_OPTIONS[0];
  }

  function aktifSiralamaBul() {
    for (var i = 0; i < SORT_OPTIONS.length; i += 1) {
      if (SORT_OPTIONS[i].value === siralama) return SORT_OPTIONS[i];
    }
    return SORT_OPTIONS[0];
  }

  function kartVideolariniHesapla() {
    if (!data.vitrin) {
      return data.videolar;
    }

    return data.videolar.filter(function (video) {
      return video.id !== data.vitrin.id;
    });
  }

  function filtrelenmisVideolariHesapla() {
    var kartVideolari = kartVideolariniHesapla();
    var sorgu = arama.trim().toLocaleLowerCase('tr-TR');

    var videoTuruneGoreSonuclar =
      videoTuru === 'shorts'
        ? kartVideolari.filter(function (video) { return isShortVideo(video); })
        : videoTuru === 'uzun-videolar'
          ? kartVideolari.filter(function (video) { return !isShortVideo(video); })
          : kartVideolari;

    var sonuclar = sorgu
      ? videoTuruneGoreSonuclar.filter(function (video) {
          var aranacakMetin = [
            video.baslik,
            video.aciklama,
            video.kategori ? video.kategori.ad : null,
          ]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('tr-TR');

          return aranacakMetin.indexOf(sorgu) !== -1;
        })
      : videoTuruneGoreSonuclar;

    return sonuclar.slice().sort(function (a, b) {
      if (siralama === 'eski') {
        return getVideoTimestamp(a) - getVideoTimestamp(b);
      }

      if (siralama === 'az') {
        return String(a.baslik != null ? a.baslik : '').localeCompare(
          String(b.baslik != null ? b.baslik : ''),
          'tr-TR',
          { sensitivity: 'base' }
        );
      }

      if (siralama === 'kisa') {
        return parseVideoDuration(a.sure) - parseVideoDuration(b.sure);
      }

      if (siralama === 'uzun') {
        var aSuresi = parseVideoDuration(a.sure);
        var bSuresi = parseVideoDuration(b.sure);

        if (!Number.isFinite(aSuresi)) return 1;
        if (!Number.isFinite(bSuresi)) return -1;

        return bSuresi - aSuresi;
      }

      return getVideoTimestamp(b) - getVideoTimestamp(a);
    });
  }

  /* ================= menü document dinleyicileri (dışarı tıklama / Escape) ================= */

  function menuDinleyicileriniEsitle() {
    var gerekli = videoTuruMenuAcik || siralamaMenuAcik;
    if (gerekli && !menuListenersAttached) {
      document.addEventListener('pointerdown', disariTiklamaDinleyici);
      document.addEventListener('keydown', menuEscapeDinleyici);
      menuListenersAttached = true;
    } else if (!gerekli && menuListenersAttached) {
      document.removeEventListener('pointerdown', disariTiklamaDinleyici);
      document.removeEventListener('keydown', menuEscapeDinleyici);
      menuListenersAttached = false;
    }
  }

  function disariTiklamaDinleyici(event) {
    if (videoTuruMenuAcik && videoTuruMenuEl && !videoTuruMenuEl.contains(event.target)) {
      videoTuruMenuAcik = false;
      videoTuruMenuGuncelle();
    }

    if (siralamaMenuAcik && siralamaMenuEl && !siralamaMenuEl.contains(event.target)) {
      siralamaMenuAcik = false;
      siralamaMenuGuncelle();
    }

    menuDinleyicileriniEsitle();
  }

  function menuEscapeDinleyici(event) {
    if (event.key === 'Escape') {
      videoTuruMenuAcik = false;
      siralamaMenuAcik = false;
      videoTuruMenuGuncelle();
      siralamaMenuGuncelle();
      menuDinleyicileriniEsitle();
    }
  }

  /* ================= durum değiştiriciler ================= */

  function videoTuruSec(value) {
    var degisti = videoTuru !== value;
    videoTuru = value;
    if (degisti) sayfa = 1;

    videoTuruMenuGuncelle();

    if (degisti) {
      listeGuncelle();

      if (videoTuru) {
        window.requestAnimationFrame(function () {
          if (videoListesiEl) {
            videoListesiEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    }
  }

  function siralamaSec(value) {
    var degisti = siralama !== value;
    siralama = value;
    if (degisti) sayfa = 1;

    siralamaMenuGuncelle();
    if (degisti) listeGuncelle();
  }

  function aramaDegisti(event) {
    var value = event.target.value;
    if (value === arama) return;

    arama = value;
    sayfa = 1;
    aramaTemizleGuncelle();
    listeGuncelle();
  }

  function aramayiTemizle() {
    if (arama === '') return;

    arama = '';
    sayfa = 1;
    if (aramaInputEl) aramaInputEl.value = '';
    aramaTemizleGuncelle();
    listeGuncelle();
  }

  /* "Tüm videoları göster": setVideoTuru('') + setArama('') */
  function filtreleriSifirla() {
    var degisti = videoTuru !== '' || arama !== '';
    videoTuru = '';
    arama = '';
    if (degisti) sayfa = 1;
    if (aramaInputEl) aramaInputEl.value = '';
    videoTuruMenuGuncelle();
    aramaTemizleGuncelle();
    if (degisti) listeGuncelle();
  }

  function sayfayaGit(yeniSayfa) {
    var filtrelenmis = filtrelenmisVideolariHesapla();
    var toplamSayfa = Math.max(1, Math.ceil(filtrelenmis.length / VIDEOS_PER_PAGE));
    var hedefSayfa = Math.min(Math.max(yeniSayfa, 1), toplamSayfa);

    if (hedefSayfa === sayfa) return;

    sayfa = hedefSayfa;
    listeGuncelle();

    window.requestAnimationFrame(function () {
      if (videoListesiEl) {
        videoListesiEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function videoyuAc(video) {
    videoTuruMenuAcik = false;
    videoTuruMenuGuncelle();
    menuDinleyicileriniEsitle();
    acikVideoyuAyarla(video);
  }

  /* acikVideo effect'i: body overflow kilidi + Escape ile kapatma */
  function acikVideoyuAyarla(video) {
    var oncekiAcik = acikVideo;
    acikVideo = video;

    if (acikVideo && !oncekiAcik) {
      oncekiOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', modalEscapeDinleyici);
    } else if (!acikVideo && oncekiAcik) {
      document.body.style.overflow = oncekiOverflow;
      document.removeEventListener('keydown', modalEscapeDinleyici);
    }

    modalGuncelle();
  }

  function modalEscapeDinleyici(event) {
    if (event.key === 'Escape') {
      acikVideoyuAyarla(null);
    }
  }

  /* ================= parça oluşturucular ================= */

  function loadingOlustur() {
    var div = document.createElement('div');
    div.className = 'mx-auto w-full max-w-[1440px] rounded-2xl border border-outline-variant/20 bg-white p-8 text-on-surface-variant shadow-sm';
    div.innerHTML =
      '<div class="flex items-center gap-3">' +
        '<span class="material-symbols-outlined animate-spin text-[#022842]">progress_activity</span>' +
        'Videolar yükleniyor…' +
      '</div>';
    return div;
  }

  function hataOlustur() {
    var div = document.createElement('div');
    div.className = 'mx-auto w-full max-w-[1440px] rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container';
    div.innerHTML =
      '<div class="flex items-start gap-3">' +
        '<span class="material-symbols-outlined">error</span>' +
        '<div>' +
          '<p class="font-semibold">Videolar yüklenemedi</p>' +
          '<p class="mt-1 text-sm">' + esc(error) + '</p>' +
        '</div>' +
      '</div>';
    return div;
  }

  function vitrinOlustur() {
    var section = document.createElement('section');
    section.className = 'relative z-10 h-full min-h-full w-full overflow-hidden bg-black shadow-[0_10px_18px_-9px_rgba(2,40,66,0.5)]';
    section.innerHTML =
      '<div class="pointer-events-none absolute left-4 top-4 z-20 md:left-6 md:top-6">' +
        '<div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#022842]/70 px-3 py-1.5 text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)] backdrop-blur-md">' +
          '<span class="material-symbols-outlined icon-filled text-[16px] text-[#f5a623]">workspace_premium</span>' +
          '<span class="text-[11px] font-semibold tracking-wide md:text-xs">Haftanın Videosu</span>' +
        '</div>' +
      '</div>' +
      '<div class="relative h-full w-full overflow-hidden">' +
        '<iframe class="absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] min-h-full w-[max(100%,177.77777778vh)] min-w-full -translate-x-1/2 -translate-y-1/2 border-0" src="' + esc(getAutoplayEmbedUrl(data.vitrin.embed_url)) + '" title="' + esc(data.vitrin.baslik) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
      '</div>' +
      '<div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-7 bg-gradient-to-b from-transparent via-[#dcecf7]/12 to-[#dcecf7]/38"></div>';
    return section;
  }

  function menuButonuHtml(aktif, acik) {
    return (
      '<button type="button" aria-haspopup="menu" aria-expanded="' + (acik ? 'true' : 'false') + '" class="inline-flex h-[44px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#cfd9e2] bg-white px-4 py-2 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#022842]/35 hover:bg-[#f7fafc] focus:outline-none focus:ring-4 focus:ring-[#022842]/10">' +
        '<span class="inline-flex min-w-0 items-center gap-2">' +
          '<span class="material-symbols-outlined text-[18px] text-[#022842]">' + aktif.icon + '</span>' +
          '<span class="truncate">' + esc(aktif.label) + '</span>' +
        '</span>' +
        '<span class="material-symbols-outlined text-[19px] text-[#022842] transition-transform duration-200' + (acik ? ' rotate-180' : '') + '">expand_more</span>' +
      '</button>'
    );
  }

  function menuOgeleriHtml(options, seciliDeger, ikonSinifi) {
    return options
      .map(function (option, index) {
        var secili = seciliDeger === option.value;
        return (
          '<button type="button" role="menuitemradio" aria-checked="' + (secili ? 'true' : 'false') + '" class="' +
          (index > 0 ? 'mt-1 ' : '') +
          'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ' +
          (secili
            ? 'bg-[#e8f1f8] text-[#022842]'
            : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]') +
          '">' +
          '<span class="' + ikonSinifi + '">' + option.icon + '</span>' +
          esc(option.label) +
          '</button>'
        );
      })
      .join('');
  }

  function videoTuruMenuGuncelle() {
    if (!videoTuruMenuEl) return;

    var odaktaydi = document.activeElement === videoTuruMenuEl.firstElementChild;
    var html = menuButonuHtml(aktifVideoTuruBul(), videoTuruMenuAcik);

    if (videoTuruMenuAcik) {
      html +=
        '<div role="menu" class="absolute left-0 top-full mt-2 min-w-[250px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]">' +
        menuOgeleriHtml(VIDEO_TYPE_OPTIONS, videoTuru, 'material-symbols-outlined text-[18px] text-[#022842]') +
        '</div>';
    }

    videoTuruMenuEl.innerHTML = html;
    if (odaktaydi) videoTuruMenuEl.firstElementChild.focus();
  }

  function siralamaMenuGuncelle() {
    if (!siralamaMenuEl) return;

    var odaktaydi = document.activeElement === siralamaMenuEl.firstElementChild;
    var html = menuButonuHtml(aktifSiralamaBul(), siralamaMenuAcik);

    if (siralamaMenuAcik) {
      html +=
        '<div role="menu" class="absolute left-0 top-full mt-2 min-w-[230px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]">' +
        menuOgeleriHtml(SORT_OPTIONS, siralama, 'material-symbols-outlined text-[18px]') +
        '</div>';
    }

    siralamaMenuEl.innerHTML = html;
    if (odaktaydi) siralamaMenuEl.firstElementChild.focus();
  }

  function videoTuruMenuTiklama(event) {
    var button = event.target.closest('button');
    if (!button || !videoTuruMenuEl.contains(button)) return;

    if (button.getAttribute('aria-haspopup') === 'menu') {
      videoTuruMenuAcik = !videoTuruMenuAcik;
      siralamaMenuAcik = false;
      videoTuruMenuGuncelle();
      siralamaMenuGuncelle();
      menuDinleyicileriniEsitle();
      return;
    }

    if (button.getAttribute('role') === 'menuitemradio') {
      var items = videoTuruMenuEl.querySelectorAll('[role="menuitemradio"]');
      var index = Array.prototype.indexOf.call(items, button);
      var option = VIDEO_TYPE_OPTIONS[index];
      if (!option) return;

      videoTuruMenuAcik = false;
      videoTuruSec(option.value);
      menuDinleyicileriniEsitle();
    }
  }

  function siralamaMenuTiklama(event) {
    var button = event.target.closest('button');
    if (!button || !siralamaMenuEl.contains(button)) return;

    if (button.getAttribute('aria-haspopup') === 'menu') {
      siralamaMenuAcik = !siralamaMenuAcik;
      videoTuruMenuAcik = false;
      siralamaMenuGuncelle();
      videoTuruMenuGuncelle();
      menuDinleyicileriniEsitle();
      return;
    }

    if (button.getAttribute('role') === 'menuitemradio') {
      var items = siralamaMenuEl.querySelectorAll('[role="menuitemradio"]');
      var index = Array.prototype.indexOf.call(items, button);
      var option = SORT_OPTIONS[index];
      if (!option) return;

      siralamaMenuAcik = false;
      siralamaSec(option.value);
      menuDinleyicileriniEsitle();
    }
  }

  function aramaTemizleGuncelle() {
    if (!aramaKutusuEl) return;

    var mevcut = aramaKutusuEl.querySelector('button');

    if (arama) {
      if (mevcut) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#022842] transition hover:bg-[#eef5fa] hover:text-[#0a3a5c]';
      button.setAttribute('aria-label', 'Aramayı temizle');
      button.innerHTML = '<span class="material-symbols-outlined text-[18px]">close</span>';
      button.addEventListener('click', aramayiTemizle);
      aramaKutusuEl.appendChild(button);
    } else if (mevcut) {
      mevcut.remove();
    }
  }

  function icerikOlustur() {
    var wrap = document.createElement('div');
    wrap.className = 'relative z-0 mx-auto w-full max-w-[1440px] px-4 pt-6 md:px-8 md:pt-8';

    var filtreBar = document.createElement('div');
    filtreBar.className = 'mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4';

    videoTuruMenuEl = document.createElement('nav');
    videoTuruMenuEl.className = 'relative z-50 w-full lg:w-[180px] lg:shrink-0';
    videoTuruMenuEl.setAttribute('aria-label', 'Video türleri');
    videoTuruMenuEl.addEventListener('click', videoTuruMenuTiklama);

    siralamaMenuEl = document.createElement('nav');
    siralamaMenuEl.className = 'relative z-50 w-full lg:w-[180px] lg:shrink-0';
    siralamaMenuEl.setAttribute('aria-label', 'Video sıralama seçenekleri');
    siralamaMenuEl.addEventListener('click', siralamaMenuTiklama);

    aramaKutusuEl = document.createElement('div');
    aramaKutusuEl.className = 'relative w-full xl:w-[520px] xl:flex-none';
    aramaKutusuEl.innerHTML =
      '<label for="video-search" class="sr-only">Video ara</label>' +
      '<span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-[#022842]">search</span>' +
      '<input id="video-search" type="text" role="searchbox" inputmode="search" placeholder="Videolarda ara..." autocomplete="off" class="h-[44px] w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-9 text-sm text-[#0b1c30] shadow-sm outline-none transition placeholder:text-[#7a8994] hover:border-[#022842]/35 focus:border-[#022842] focus:ring-4 focus:ring-[#022842]/10">';
    aramaInputEl = aramaKutusuEl.querySelector('input');
    aramaInputEl.value = arama;
    aramaInputEl.addEventListener('input', aramaDegisti);

    filtreBar.appendChild(videoTuruMenuEl);
    filtreBar.appendChild(siralamaMenuEl);
    filtreBar.appendChild(aramaKutusuEl);

    videoListesiEl = document.createElement('section');
    videoListesiEl.className = 'scroll-mt-4 pb-10';

    wrap.appendChild(filtreBar);
    wrap.appendChild(videoListesiEl);

    videoTuruMenuGuncelle();
    siralamaMenuGuncelle();
    aramaTemizleGuncelle();

    return wrap;
  }

  function tumVideolariGosterButonuOlustur(mtSinifiVarMi) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className =
      (mtSinifiVarMi ? 'mt-6 ' : '') +
      'inline-flex h-11 items-center gap-2 rounded-xl bg-[#022842] px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(2,40,66,0.18)] transition hover:bg-[#0a3a5c]';
    button.innerHTML =
      '<span class="material-symbols-outlined text-[19px]">video_library</span>' +
      'Tüm videoları göster';
    button.addEventListener('click', filtreleriSifirla);
    return button;
  }

  function arsivBosOlustur() {
    var div = document.createElement('div');
    div.className = 'rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white to-[#eef5fa] px-6 py-12 text-center shadow-[0_10px_28px_rgba(2,40,66,0.07)]';
    div.innerHTML =
      '<span class="material-symbols-outlined mb-4 text-5xl text-[#7a8994]">video_library</span>' +
      '<h3 class="text-lg font-extrabold text-[#0b1c30]">Henüz video bulunamadı</h3>' +
      '<p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">Video arşivine henüz içerik eklenmemiş olabilir.</p>';

    if (videoTuru !== '') {
      div.appendChild(tumVideolariGosterButonuOlustur(true));
    }

    return div;
  }

  function sonucYokOlustur() {
    var aramaMetni = arama.trim();

    var div = document.createElement('div');
    div.className = 'rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white to-[#eef5fa] px-6 py-12 text-center shadow-[0_10px_28px_rgba(2,40,66,0.07)]';
    div.innerHTML =
      '<span class="material-symbols-outlined mb-4 text-5xl text-[#7a8994]">search_off</span>' +
      '<h3 class="text-lg font-extrabold text-[#0b1c30]">' +
        (aramaMetni ? 'Aradığınız video bulunamadı' : 'Bu video türünde video bulunamadı') +
      '</h3>' +
      '<p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">' +
        (aramaMetni
          ? '“' + esc(aramaMetni) + '” ifadesiyle eşleşen bir sonuç yok. Farklı bir kelime deneyin veya filtreleri temizleyin.'
          : 'Seçtiğiniz video türünde içerik bulunmuyor. Tüm videolara dönerek diğer içeriklere göz atabilirsiniz.') +
      '</p>';

    var aksiyonlar = document.createElement('div');
    aksiyonlar.className = 'mt-6 flex flex-wrap items-center justify-center gap-3';

    if (aramaMetni) {
      var temizle = document.createElement('button');
      temizle.type = 'button';
      temizle.className = 'inline-flex h-11 items-center gap-2 rounded-xl border border-[#022842]/15 bg-white px-4 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0]';
      temizle.innerHTML =
        '<span class="material-symbols-outlined text-[19px]">backspace</span>' +
        'Aramayı temizle';
      temizle.addEventListener('click', aramayiTemizle);
      aksiyonlar.appendChild(temizle);
    }

    if (videoTuru !== '') {
      aksiyonlar.appendChild(tumVideolariGosterButonuOlustur(false));
    }

    div.appendChild(aksiyonlar);
    return div;
  }

  /* VideoCard bileşeni karşılığı */
  function videoKartiOlustur(video) {
    var videoTypeInfo = getVideoTypeInfo(video);

    var article = document.createElement('article');
    article.className = 'group relative z-0 h-full origin-center overflow-hidden rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] shadow-[0_6px_22px_rgba(2,40,66,0.07)] transition-all duration-300 ease-out hover:z-20 hover:-translate-y-2 hover:scale-[1.035] hover:border-[#022842]/25 hover:shadow-[0_24px_55px_rgba(2,40,66,0.22)] focus-within:z-20 focus-within:-translate-y-2 focus-within:scale-[1.035] focus-within:shadow-[0_24px_55px_rgba(2,40,66,0.22)]';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'flex h-full w-full flex-col text-left';
    button.setAttribute('aria-label', video.baslik + ' videosunu sayfada oynat');
    button.addEventListener('click', function () {
      videoyuAc(video);
    });

    var medya = document.createElement('div');
    medya.className = 'relative aspect-video overflow-hidden bg-[#0f172a]';
    medya.appendChild(
      Media.youtubeThumb({
        youtubeId: video.youtube_id,
        thumbnail: video.thumbnail,
        alt: video.baslik,
        className: 'absolute inset-0',
      })
    );

    var kaplamalar =
      '<div class="absolute inset-0 bg-gradient-to-t from-[#011f34]/55 via-transparent to-black/5 opacity-80 transition duration-300 group-hover:opacity-100"></div>' +
      '<div class="absolute inset-0 bg-[#011f34]/0 transition-colors duration-300 group-hover:bg-[#011f34]/35 group-focus-within:bg-[#011f34]/35"></div>' +
      '<span class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-[#022842]/85 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">' +
        '<span class="material-symbols-outlined text-[15px] text-[#f5a623]">' + videoTypeInfo.icon + '</span>' +
        '<span>' + esc(videoTypeInfo.label) + '</span>' +
      '</span>';

    if (video.sure) {
      kaplamalar +=
        '<span class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/65 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">' +
          '<span class="material-symbols-outlined text-[14px]">schedule</span>' +
          esc(video.sure) +
        '</span>';
    }

    kaplamalar +=
      '<span aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">' +
        '<svg viewBox="0 0 100 100" width="68" height="68" class="h-[68px] w-[68px] translate-x-0.5 scale-90 text-white/95 transition-transform duration-200 group-hover:scale-100 group-focus-within:scale-100 group-active:scale-95 sm:h-20 sm:w-20" style="filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.95))" focusable="false">' +
          '<path d="M31 18L82 50L31 82Z" fill="currentColor"></path>' +
        '</svg>' +
      '</span>';

    medya.insertAdjacentHTML('beforeend', kaplamalar);

    var govde = document.createElement('div');
    govde.className = 'flex flex-1 flex-col p-5';
    govde.innerHTML =
      '<h2 class="line-clamp-2 min-h-[3.25rem] text-lg font-extrabold leading-[1.45] tracking-tight text-[#0b1c30] transition group-hover:text-[#022842]">' + esc(video.baslik) + '</h2>' +
      (video.aciklama
        ? '<p class="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#61717d]">' + esc(video.aciklama) + '</p>'
        : '<p class="mt-2 min-h-12 text-sm leading-6 text-[#8a98a2]">Video açıklaması bulunmuyor.</p>');

    button.appendChild(medya);
    button.appendChild(govde);
    button.insertAdjacentHTML(
      'beforeend',
      '<span class="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#f5a623] transition-transform duration-300 group-hover:scale-x-100"></span>'
    );

    article.appendChild(button);
    return article;
  }

  function sayfalamaOlustur(toplamSayfa) {
    var nav = document.createElement('nav');
    nav.className = 'mx-auto mt-8 flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[#022842]/10 bg-white/90 p-1.5 shadow-[0_6px_18px_rgba(2,40,66,0.08)] backdrop-blur sm:gap-2 sm:p-2';
    nav.setAttribute('aria-label', 'Video sayfaları');

    var onceki = document.createElement('button');
    onceki.type = 'button';
    onceki.disabled = sayfa === 1;
    onceki.className = 'inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#d5dde5] bg-white px-3 text-xs font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:text-sm';
    onceki.setAttribute('aria-label', 'Önceki sayfa');
    onceki.innerHTML =
      '<span class="material-symbols-outlined text-lg">chevron_left</span>' +
      '<span class="hidden sm:inline">Önceki</span>';
    onceki.addEventListener('click', function () {
      sayfayaGit(sayfa - 1);
    });
    nav.appendChild(onceki);

    getPaginationItems(sayfa, toplamSayfa).forEach(function (item) {
      if (typeof item === 'number') {
        var sayfaButonu = document.createElement('button');
        sayfaButonu.type = 'button';
        if (sayfa === item) sayfaButonu.setAttribute('aria-current', 'page');
        sayfaButonu.className =
          'relative inline-flex h-10 min-w-10 items-center justify-center overflow-hidden rounded-lg border px-3 text-sm font-extrabold transition ' +
          (sayfa === item
            ? "border-[#022842] bg-[#022842] text-white shadow-[0_5px_14px_rgba(2,40,66,0.22)] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-[#f5a623] after:content-['']"
            : 'border-[#d5dde5] bg-white text-[#536575] shadow-sm hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842]');
        sayfaButonu.textContent = String(item);
        sayfaButonu.addEventListener('click', function () {
          sayfayaGit(item);
        });
        nav.appendChild(sayfaButonu);
      } else {
        var bosluk = document.createElement('span');
        bosluk.className = 'inline-flex h-10 min-w-6 items-center justify-center text-lg font-bold text-[#7a8994]';
        bosluk.setAttribute('aria-hidden', 'true');
        bosluk.textContent = '…';
        nav.appendChild(bosluk);
      }
    });

    var sonraki = document.createElement('button');
    sonraki.type = 'button';
    sonraki.disabled = sayfa === toplamSayfa;
    sonraki.className = 'inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#d5dde5] bg-white px-3 text-xs font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:text-sm';
    sonraki.setAttribute('aria-label', 'Sonraki sayfa');
    sonraki.innerHTML =
      '<span class="hidden sm:inline">Sonraki</span>' +
      '<span class="material-symbols-outlined text-lg">chevron_right</span>';
    sonraki.addEventListener('click', function () {
      sayfayaGit(sayfa + 1);
    });
    nav.appendChild(sonraki);

    return nav;
  }

  /* ================= liste bölümü render'ı ================= */

  function listeGuncelle() {
    if (!videoListesiEl) return;

    var filtrelenmisVideolar = filtrelenmisVideolariHesapla();
    var toplamSayfa = Math.max(1, Math.ceil(filtrelenmisVideolar.length / VIDEOS_PER_PAGE));

    /* sayfa > toplamSayfa effect'i */
    if (sayfa > toplamSayfa) sayfa = toplamSayfa;

    var baslangic = (sayfa - 1) * VIDEOS_PER_PAGE;
    var sayfadakiVideolar = filtrelenmisVideolar.slice(baslangic, baslangic + VIDEOS_PER_PAGE);

    videoListesiEl.innerHTML = '';

    var baslikSatiri = document.createElement('div');
    baslikSatiri.className = 'mb-5 flex items-center gap-2.5';
    baslikSatiri.innerHTML =
      '<span aria-hidden="true" class="h-2.5 w-px shrink-0 bg-[#022842]/25"></span>' +
      '<h2 class="flex shrink-0 items-center gap-1.5 text-[13px] font-extrabold tracking-wide text-[#022842] md:text-sm">' +
        '<span class="material-symbols-outlined text-[15px] text-[#f5a623]">video_library</span>' +
        esc(videoTuru === '' ? 'Video Arşivi' : aktifVideoTuruBul().label) +
      '</h2>' +
      '<div aria-hidden="true" class="h-px flex-1 bg-[#022842]/15"></div>' +
      '<span aria-hidden="true" class="h-2.5 w-px shrink-0 bg-[#022842]/25"></span>' +
      '<span class="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#022842]/15 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#536575]">' +
        (filtrelenmisVideolar.length > 0
          ? filtrelenmisVideolar.length + ' video'
          : 'Video bulunamadı') +
      '</span>';
    videoListesiEl.appendChild(baslikSatiri);

    if (data.videolar.length === 0) {
      videoListesiEl.appendChild(arsivBosOlustur());
      return;
    }

    if (filtrelenmisVideolar.length > 0) {
      var grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3';
      sayfadakiVideolar.forEach(function (video) {
        grid.appendChild(videoKartiOlustur(video));
      });
      videoListesiEl.appendChild(grid);

      if (toplamSayfa > 1) {
        videoListesiEl.appendChild(sayfalamaOlustur(toplamSayfa));
      }
      return;
    }

    videoListesiEl.appendChild(sonucYokOlustur());
  }

  /* ================= video modalı ================= */

  function modalGuncelle() {
    if (modalEl) {
      modalEl.remove();
      modalEl = null;
    }

    if (!acikVideo) return;

    var video = acikVideo;

    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', video.baslik + ' videosu');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[6px] sm:p-8';
    overlay.addEventListener('pointerdown', function (event) {
      if (event.target === overlay) {
        acikVideoyuAyarla(null);
      }
    });

    var kutu = document.createElement('div');
    kutu.className = 'relative overflow-hidden rounded-xl bg-black shadow-[0_22px_65px_rgba(0,0,0,0.45)]';
    kutu.style.width = 'min(94vw, 72rem, 146dvh)';
    kutu.innerHTML =
      '<button type="button" class="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/65 text-white shadow-md backdrop-blur-sm transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:ring-offset-2 focus:ring-offset-black" aria-label="Videoyu kapat">' +
        '<span class="material-symbols-outlined text-[22px]">close</span>' +
      '</button>' +
      '<div class="aspect-video w-full bg-black">' +
        '<iframe class="h-full w-full border-0" src="' + esc(getModalEmbedUrl(video)) + '" title="' + esc(video.baslik) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
      '</div>';
    kutu.querySelector('button').addEventListener('click', function () {
      acikVideoyuAyarla(null);
    });

    overlay.appendChild(kutu);
    pageRoot.appendChild(overlay);
    modalEl = overlay;
  }

  /* ================= sayfa içeriği render'ı (loading / hata / veri) ================= */

  function icerikEkle(node) {
    pageRoot.insertBefore(node, footerEl || null);
    contentNodes.push(node);
  }

  function icerikGuncelle() {
    contentNodes.forEach(function (node) {
      node.remove();
    });
    contentNodes = [];
    videoTuruMenuEl = null;
    siralamaMenuEl = null;
    aramaKutusuEl = null;
    aramaInputEl = null;
    videoListesiEl = null;

    if (loading) {
      icerikEkle(loadingOlustur());
      return;
    }

    if (error) {
      icerikEkle(hataOlustur());
      return;
    }

    if (data.vitrin) {
      icerikEkle(vitrinOlustur());
    }

    icerikEkle(icerikOlustur());
    listeGuncelle();
  }

  /* ================= veri yükleme ================= */

  async function videolariYukle() {
    loading = true;
    error = '';
    icerikGuncelle();

    try {
      var result = await Api.fetchVideos('');

      data = {
        videolar: result.videolar != null ? result.videolar : [],
        kategoriler: result.kategoriler != null ? result.kategoriler : [],
        vitrin: result.vitrin != null ? result.vitrin : null,
      };
    } catch (err) {
      error = (err && err.message) || 'Videolar yüklenemedi.';
    }

    loading = false;
    icerikGuncelle();
  }

  function init() {
    pageRoot = document.querySelector('main .h-full.w-full');
    if (!pageRoot) return;

    /* footer.js yer tutucuyu <footer class="site-footer"> ile değiştirmiş olur */
    footerEl = pageRoot.querySelector('.site-footer') || pageRoot.querySelector('#site-footer');

    videolariYukle();
  }

  Portal.onReady(init);
})();
