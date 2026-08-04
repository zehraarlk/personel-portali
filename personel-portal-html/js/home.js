/*
 * Ana sayfa — React frontend/src/pages/Home.jsx birebir portu.
 * Haber slider (otomatik geçiş + thumbnail rayı), duyuru bandı (marquee),
 * doğum günü kartları ve otomasyon sistemleri.
 */
(function () {
  'use strict';

  var RAIL_PAGE_SIZE_DESKTOP = 4;
  var RAIL_PAGE_SIZE_MOBILE = 2;

  /* React useState karşılıkları */
  var data = null;
  var loading = true;
  var error = null;
  var haberIndex = 0;
  var railPage = 0;
  var isPaused = false;
  var railPageSize = RAIL_PAGE_SIZE_DESKTOP;

  var sliderTimer = null;
  var root = null;
  var railMq = null;

  function getRailPageSize() {
    return railPageSize;
  }

  function syncRailPageSize() {
    var next = railMq && railMq.matches ? RAIL_PAGE_SIZE_MOBILE : RAIL_PAGE_SIZE_DESKTOP;
    if (next === railPageSize) return;
    railPageSize = next;
    railPage = Math.floor(haberIndex / railPageSize);
    if (root && !loading && !error) renderHaberler();
  }

  function esc(value) {
    return Portal.escapeHtml(value);
  }

  function icon(key) {
    return SiteIcons.icon(key);
  }

  function getHaberler() {
    return (data && data.haberler) || [];
  }

  function getDuyurular() {
    return (data && data.duyurular) || [];
  }

  function getDogumGunleri() {
    return (data && data.dogum_gunleri) || [];
  }

  function getOtomasyon() {
    return (data && data.otomasyon) || [];
  }

  /* React: useEffect [haberIndex] -> setRailPage(Math.floor(haberIndex / RAIL_PAGE_SIZE)) */
  function setHaberIndex(next) {
    haberIndex = next;
    railPage = Math.floor(haberIndex / getRailPageSize());
    renderHaberler();
  }

  function railPageCount() {
    return Math.max(1, Math.ceil(getHaberler().length / getRailPageSize()));
  }

  /* Haber → etkinlik detay */
  function handleHaberClick(haber) {
    if (!haber || !haber.id) return;
    Portal.goto('/etkinlikler/' + haber.id);
  }

  function handlePrev() {
    var list = getHaberler();
    setHaberIndex(haberIndex === 0 ? list.length - 1 : haberIndex - 1);
  }

  function handleNext() {
    var list = getHaberler();
    setHaberIndex(haberIndex === list.length - 1 ? 0 : haberIndex + 1);
  }

  function handleRailPrevPage() {
    var next = Math.max(0, railPage - 1);
    railPage = next;
    setHaberIndex(next * getRailPageSize());
  }

  function handleRailNextPage() {
    var next = Math.min(railPageCount() - 1, railPage + 1);
    railPage = next;
    setHaberIndex(next * getRailPageSize());
  }

  /* Haber Slider Otomatik Geçiş — React: useEffect [data?.haberler] */
  function startHaberSlider() {
    if (sliderTimer) {
      clearInterval(sliderTimer);
      sliderTimer = null;
    }
    var list = getHaberler();
    if (list.length < 2) return;
    sliderTimer = setInterval(function () {
      setHaberIndex((haberIndex + 1) % getHaberler().length);
    }, 5000);
  }

  /* 1. HABER SLIDER — haberIndex/railPage değişince yalnızca bu bölüm yeniden boyanır */
  function renderHaberler() {
    var section = document.getElementById('haberler');
    if (!section) return;

    var list = getHaberler();
    var aktif = list[haberIndex];
    var pageCount = railPageCount();
    var size = getRailPageSize();
    var railStart = railPage * size;
    var railItems = list.slice(railStart, railStart + size);

    /* MediaFrame DOM öğesi döndürdüğü için yer tutucu ile eklenir */
    var slots = [];
    function mediaSlot(options) {
      slots.push(options);
      return '<span data-media-slot="' + (slots.length - 1) + '"></span>';
    }

    var html =
      '<div class="group relative h-[calc(100dvh-6.5rem)] min-h-[280px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-md">';

    if (aktif) {
      /* Büyük Haber Alanı — yalnızca başlık tıklanınca detaya gider */
      html +=
        '<div class="absolute inset-0 overflow-hidden bg-slate-950">' +
        mediaSlot({
          src: Portal.asset(aktif.resim),
          alt: aktif.baslik,
          dark: true,
          forceCover: true,
          className: 'absolute inset-0',
          eager: true,
        }) +
        '<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>' +
        '<div class="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">' +
        '<div class="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">' +
        '<span class="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">Öne Çıkan</span>' +
        '<span class="text-xs text-white/80 font-medium">' + esc(data.tarih_tr) + '</span>' +
        '</div>' +
        '<h2 class="max-w-4xl text-base font-bold leading-tight text-white drop-shadow sm:text-xl md:text-3xl">' +
        '<button type="button" data-haber-title class="cursor-pointer text-left transition-colors hover:text-amber-300">' +
        esc(aktif.baslik) +
        '</button>' +
        '</h2>' +
        '</div>' +
        '</div>';

      /* Önceki / Sonraki İlerleme Butonları */
      if (list.length > 1) {
        html +=
          '<button type="button" aria-label="Önceki Haber" class="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-amber-500 hover:text-white sm:left-4 sm:h-10 sm:w-10">' +
          '<i class="' + icon('onceki') + '" aria-hidden="true"></i>' +
          '</button>' +
          '<button type="button" aria-label="Sonraki Haber" class="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-amber-500 hover:text-white sm:right-4 sm:h-10 sm:w-10">' +
          '<i class="' + icon('sonraki') + '" aria-hidden="true"></i>' +
          '</button>';
      }
    } else {
      html += '<p class="absolute inset-0 flex items-center justify-center p-8 text-slate-400">Haber bulunamadı.</p>';
    }

    html += '</div>';

    /* Alt Thumbnail (Küçük Görsel) Çubuğu */
    if (list.length > 1) {
      html += '<div class="flex flex-col gap-2">' + '<div class="flex items-stretch gap-2.5">';

      if (pageCount > 1) {
        html +=
          '<button type="button"' +
          (railPage === 0 ? ' disabled' : '') +
          ' aria-label="Önceki Sayfa" class="shrink-0 flex h-auto w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-30 disabled:pointer-events-none">' +
          '<i class="' + icon('onceki') + '" aria-hidden="true"></i>' +
          '</button>';
      }

      html += '<div class="flex flex-1 gap-2.5 min-w-0">';
      railItems.forEach(function (h, i) {
        var realIndex = railStart + i;
        var isCurrent = realIndex === haberIndex;
        html +=
          '<button type="button" class="group/thumb relative flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border p-1.5 text-left transition-all duration-200 sm:gap-3 sm:p-2 sm:pr-3 ' +
          (isCurrent
            ? 'border-amber-400 bg-white shadow-md ring-1 ring-amber-400/40'
            : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-sm') +
          '">' +
          '<span class="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors sm:flex ' +
          (isCurrent ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 group-hover/thumb:bg-slate-200') +
          '">' +
          (realIndex + 1) +
          '</span>' +
          '<div class="relative h-12 w-full shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:h-14 sm:w-20 sm:max-w-[5rem]">' +
          mediaSlot({ src: Portal.asset(h.resim), alt: '', forceCover: true, className: 'absolute inset-0' }) +
          (!isCurrent ? '<div class="absolute inset-0 bg-white/40"></div>' : '') +
          '</div>' +
          '<span class="hidden min-w-0 flex-1 text-xs font-semibold leading-snug sm:line-clamp-2 sm:block ' +
          (isCurrent ? 'text-slate-900' : 'text-slate-600') +
          '">' +
          esc(h.baslik) +
          '</span>' +
          (isCurrent ? '<span class="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500"></span>' : '') +
          '</button>';
      });
      html += '</div>';

      if (pageCount > 1) {
        html +=
          '<button type="button"' +
          (railPage === pageCount - 1 ? ' disabled' : '') +
          ' aria-label="Sonraki Sayfa" class="shrink-0 flex h-auto w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-30 disabled:pointer-events-none">' +
          '<i class="' + icon('sonraki') + '" aria-hidden="true"></i>' +
          '</button>';
      }

      html += '</div>';

      if (pageCount > 1) {
        html += '<div class="flex items-center justify-center gap-1.5">';
        for (var d = 0; d < pageCount; d += 1) {
          html +=
            '<span class="h-1.5 rounded-full transition-all duration-200 ' +
            (d === railPage ? 'w-5 bg-amber-500' : 'w-1.5 bg-slate-300') +
            '"></span>';
        }
        html += '</div>';
      }

      html += '</div>';
    }

    section.innerHTML = html;

    /* MediaFrame yer tutucularını gerçek öğelerle değiştir */
    section.querySelectorAll('[data-media-slot]').forEach(function (el) {
      var options = slots[parseInt(el.getAttribute('data-media-slot'), 10)];
      var node = Media.frame(options);
      if (node) el.replaceWith(node);
      else el.remove();
    });

    /* Olaylar — yalnızca başlık detaya gider */
    var titleBtn = section.querySelector('[data-haber-title]');
    if (titleBtn) {
      titleBtn.addEventListener('click', function () {
        handleHaberClick(aktif);
      });
    }

    var prevBtn = section.querySelector('button[aria-label="Önceki Haber"]');
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        handlePrev();
      });
    }

    var nextBtn = section.querySelector('button[aria-label="Sonraki Haber"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        handleNext();
      });
    }

    var railPrevBtn = section.querySelector('button[aria-label="Önceki Sayfa"]');
    if (railPrevBtn) railPrevBtn.addEventListener('click', handleRailPrevPage);

    var railNextBtn = section.querySelector('button[aria-label="Sonraki Sayfa"]');
    if (railNextBtn) railNextBtn.addEventListener('click', handleRailNextPage);

    section.querySelectorAll('button[class~="group/thumb"]').forEach(function (btn, i) {
      var realIndex = railStart + i;
      btn.addEventListener('click', function () {
        setHaberIndex(realIndex);
      });
    });
  }

  /* 2. DUYURU BANT KISMI */
  function duyurularBandiHtml() {
    var duyurular = getDuyurular();
    var items = duyurular.concat(duyurular);

    var html =
      '<section id="duyurular-bandi" class="flex min-h-[100px] min-w-0 select-none flex-col overflow-hidden rounded-2xl border-b-4 border-amber-500 bg-[#0b3757] text-white shadow-md sm:min-h-[132px] sm:flex-row sm:items-stretch sm:gap-4">' +
      '<div class="z-10 flex shrink-0 items-center justify-center gap-2 bg-[#022842] px-4 py-2.5 sm:justify-start sm:gap-2.5 sm:py-0 sm:pl-5 sm:pr-6">' +
      '<i class="' + icon('duyuru_zili') + ' text-xl text-amber-400 sm:text-2xl" aria-hidden="true"></i>' +
      '<span class="text-xs font-black uppercase tracking-wide sm:text-sm md:text-base">Duyurular</span>' +
      '</div>' +
      '<div class="relative flex min-w-0 flex-1 items-center overflow-hidden py-3 pr-4" data-duyuru-marquee-host>' +
      '<div class="flex items-start gap-3 whitespace-nowrap w-max animate-marquee" style="animation-play-state: ' +
      (isPaused ? 'paused' : 'running') +
      '">';

    items.forEach(function (d) {
      if (!d || d.id == null || d.id === '') return;
      var detayHref = Portal.href('/duyurular/' + String(d.id));
      html +=
        '<a href="' + esc(detayHref) + '"' +
        ' data-duyuru-id="' + esc(String(d.id)) + '"' +
        ' aria-label="' + esc((d.baslik || 'Duyuru') + ' detayını aç') + '"' +
        ' class="duyuru-band-link flex flex-col shrink-0 w-44 gap-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-2 transition cursor-pointer text-left no-underline text-inherit">' +
        '<span class="pointer-events-none whitespace-normal line-clamp-1 text-[11px] font-bold leading-snug text-white/95">' +
        esc(d.baslik) +
        '</span>' +
        ((d.aciklama || d.icerik)
          ? '<span class="pointer-events-none whitespace-normal line-clamp-2 text-[10px] font-medium leading-snug text-white/70">' +
            esc(d.aciklama || d.icerik) +
            '</span>'
          : '') +
        '</a>';
    });

    html += '</div>' + '</div>' + '</section>';
    return html;
  }

  function bindMarquee() {
    var host = root.querySelector('[data-duyuru-marquee-host]');
    var track = host ? host.querySelector('.animate-marquee') : null;
    if (!host || !track) return;

    function pause() {
      isPaused = true;
      track.style.animationPlayState = 'paused';
    }

    function resume() {
      isPaused = false;
      track.style.animationPlayState = 'running';
    }

    host.addEventListener('mouseenter', pause);
    host.addEventListener('mouseleave', resume);
    host.addEventListener('focusin', pause);
    host.addEventListener('focusout', function (e) {
      if (!host.contains(e.relatedTarget)) resume();
    });

    /* Transform animasyonu native click'i bozabiliyor; pointer ile garanti yönlendir */
    var pressLink = null;
    host.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      pressLink = e.target.closest('a[data-duyuru-id]');
      if (pressLink) pause();
    });
    host.addEventListener('pointerup', function (e) {
      var link = e.target.closest('a[data-duyuru-id]');
      var from = pressLink;
      pressLink = null;
      if (!from || !link || link !== from) return;
      var id = link.getAttribute('data-duyuru-id');
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      Portal.goto('/duyurular/' + id);
    });
    host.addEventListener('pointercancel', function () {
      pressLink = null;
    });
  }

  /* 3. DOĞUM GÜNÜ ALANI (DİKEY DİKDÖRTGEN KART TASARIMI) */
  function dogumGunuHtml() {
    var dogumGunleri = getDogumGunleri();

    var html =
      '<section id="dogum-gunu" class="birthday-section relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/70 via-white to-[#022842]/5 p-5 md:p-6 shadow-sm">' +
      '<div class="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl"></div>' +
      '<div class="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-[#022842]/10 blur-2xl"></div>' +
      '<div class="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-amber-100/80 pb-3.5">' +
      '<div class="flex items-center gap-3">' +
      '<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-[#022842] text-white shadow-sm shadow-amber-200">' +
      '<i class="' + icon('dogum_sayfa') + ' text-xl" aria-hidden="true"></i>' +
      '</div>' +
      '<div>' +
      '<h2 class="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Bugün Doğum Günü Olanlar</h2>' +
      '<p class="text-xs text-slate-500 font-medium">Çalışma arkadaşlarımızın yeni yaşını kutlarız!</p>' +
      '</div>' +
      '</div>' +
      '<span class="inline-flex items-center gap-1.5 rounded-full bg-[#022842]/10 px-3.5 py-1 text-xs font-bold text-[#022842] border border-[#022842]/15">' +
      '<span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>' +
      esc((data && data.tarih_tr) || 'Bugün') +
      '</span>' +
      '</div>' +
      '<div class="relative grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">';

    if (dogumGunleri.length) {
      dogumGunleri.forEach(function (p) {
        var foto = p.foto ? Portal.asset(p.foto) : Portal.BRAND_IMG;
        html +=
          '<div class="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#022842]/10 bg-white/90 p-3 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:bg-white hover:shadow-lg sm:p-5">' +
          '<div class="relative mb-3">' +
          '<div class="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-[#022842]/20 transition-transform duration-300 group-hover:scale-105 group-hover:ring-amber-500 sm:h-20 sm:w-20">' +
          '<img src="' + esc(foto) + '" alt="' + esc(p.ad_soyad) + '" class="absolute inset-0 h-full w-full object-cover object-center" />' +
          '</div>' +
          '<span class="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs shadow-sm ring-2 ring-white">🎉</span>' +
          '</div>' +
          '<div class="flex flex-col items-center justify-center min-w-0 w-full">' +
          '<h3 class="w-full truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-[#022842]">' +
          esc(p.ad_soyad) +
          '</h3>' +
          '<span class="mt-1 inline-block text-xs font-semibold text-amber-600">Mutlu Yıllar!</span>' +
          '</div>' +
          '</div>';
      });
    } else {
      html +=
        '<div class="col-span-full flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-slate-500 bg-white/60 rounded-xl border border-[#022842]/10 sm:flex-row sm:px-6">' +
        '<i class="' + icon('tarih') + ' shrink-0 text-[#022842]/60" aria-hidden="true"></i>' +
        '<span class="min-w-0 max-w-prose text-pretty">Bugün doğum günü olan personel bulunmamaktadır.</span>' +
        '</div>';
    }

    html += '</div>' + '</section>';
    return html;
  }

  /* 4. OTOMASYON SİSTEMLERİ ALANI (BÜYÜK LOGOLU MINIMAL KARTLAR) */
  function otomasyonHtml() {
    var otomasyon = getOtomasyon();

    var html =
      '<section id="otomasyon" class="flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-sm p-5 md:p-6">' +
      '<div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">' +
      '<div class="flex min-w-0 items-center gap-3">' +
      '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#022842] text-amber-400 shadow-sm">' +
      '<i class="' + icon('otomasyon_sistem') + ' text-xl" aria-hidden="true"></i>' +
      '</div>' +
      '<div class="min-w-0">' +
      '<h2 class="text-base font-bold text-[#022842] sm:text-lg md:text-xl">Kurum İçi Otomasyon Sistemleri</h2>' +
      '<p class="text-xs font-medium text-slate-500">Hızlı erişim ve yönetim portalları</p>' +
      '</div>' +
      '</div>' +
      '<span class="rounded-lg border border-slate-200/60 bg-slate-100 px-3 py-1 text-xs font-bold text-[#022842]">' +
      otomasyon.length +
      ' Uygulama</span>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">';

    otomasyon.forEach(function (link) {
      var logo = link.logo ? Portal.asset(link.logo) : Portal.BRAND_IMG;
      html +=
        '<a href="' + esc(link.hedef_url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(link.baslik) + '" class="group relative flex flex-col items-center justify-start gap-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#022842]/30 hover:bg-white hover:shadow-lg sm:p-4">' +
        '<span class="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 transition-all duration-300 group-hover:bg-[#022842] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:top-3 sm:right-3 sm:h-7 sm:w-7">' +
        '<i class="' + icon('harici_baglanti') + ' text-sm" aria-hidden="true"></i>' +
        '</span>' +
        '<div class="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md sm:p-3">' +
        '<img src="' + esc(logo) + '" alt="' + esc(link.baslik) + '" class="max-h-full max-w-full object-contain" />' +
        '</div>' +
        '<span class="line-clamp-2 w-full text-center text-xs font-semibold leading-tight text-[#022842] sm:text-sm">' + esc(link.baslik) + '</span>' +
        '</a>';
    });

    html += '</div>' + '</section>';
    return html;
  }

  function renderAll() {
    if (!root) return;

    if (loading) {
      root.innerHTML =
        '<div class="rounded-2xl bg-white border border-slate-200 p-8 text-slate-500 text-center shadow-sm">Yükleniyor…</div>';
      return;
    }

    if (error) {
      root.innerHTML =
        '<div class="rounded-2xl bg-red-50 text-red-700 p-6 border border-red-200">Veriler alınamadı: ' +
        esc(error) +
        '</div>';
      return;
    }

    root.innerHTML =
      '<div class="flex min-w-0 flex-col gap-6">' +
      '<section id="haberler" class="flex min-w-0 flex-col gap-3"></section>' +
      duyurularBandiHtml() +
      dogumGunuHtml() +
      otomasyonHtml() +
      '</div>';

    renderHaberler();
    bindMarquee();
  }

  function init() {
    root = document.querySelector('main.app-main');

    if (window.matchMedia) {
      railMq = window.matchMedia('(max-width: 640px)');
      syncRailPageSize();
      if (railMq.addEventListener) railMq.addEventListener('change', syncRailPageSize);
      else if (railMq.addListener) railMq.addListener(syncRailPageSize);
    }

    renderAll();

    Api.fetchHomeDashboard()
      .then(function (payload) {
        data = payload;
      })
      .catch(function (err) {
        error = err.message;
      })
      .finally(function () {
        loading = false;
        renderAll();
        startHaberSlider();
      });

    /* İkonlar yüklenince yeniden boya (ilk boyamada yedek ikonlar kullanılır) */
    SiteIcons.load().then(function () {
      renderAll();
    });
  }

  Portal.onReady(init);
})();