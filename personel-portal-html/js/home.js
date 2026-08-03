/*
 * Ana sayfa — React frontend/src/pages/Home.jsx birebir portu.
 * Haber slider (otomatik geçiş + thumbnail rayı), duyuru bandı (marquee),
 * doğum günü kartları ve otomasyon sistemleri.
 */
(function () {
  'use strict';

  var RAIL_PAGE_SIZE = 4;

  /* React useState karşılıkları */
  var data = null;
  var loading = true;
  var error = null;
  var haberIndex = 0;
  var railPage = 0;
  var isPaused = false;

  var sliderTimer = null;
  var root = null;

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

  function railPageCount() {
    return Math.max(1, Math.ceil(getHaberler().length / RAIL_PAGE_SIZE));
  }

  /* React: useEffect [haberIndex] -> setRailPage(Math.floor(haberIndex / RAIL_PAGE_SIZE)) */
  function setHaberIndex(next) {
    haberIndex = next;
    railPage = Math.floor(haberIndex / RAIL_PAGE_SIZE);
    renderHaberler();
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
    setHaberIndex(next * RAIL_PAGE_SIZE);
  }

  function handleRailNextPage() {
    var next = Math.min(railPageCount() - 1, railPage + 1);
    railPage = next;
    setHaberIndex(next * RAIL_PAGE_SIZE);
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
    var railStart = railPage * RAIL_PAGE_SIZE;
    var railItems = list.slice(railStart, railStart + RAIL_PAGE_SIZE);

    /* MediaFrame DOM öğesi döndürdüğü için yer tutucu ile eklenir */
    var slots = [];
    function mediaSlot(options) {
      slots.push(options);
      return '<span data-media-slot="' + (slots.length - 1) + '"></span>';
    }

    var html =
      '<div class="relative flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden min-h-[380px] md:min-h-[460px] group">';

    if (aktif) {
      /* Büyük Haber Alanı — Tıklanınca Etkinlik Detayına Gider */
      html +=
        '<div class="relative flex-1 bg-slate-950 overflow-hidden cursor-pointer">' +
        mediaSlot({
          src: Portal.asset(aktif.resim),
          alt: aktif.baslik,
          dark: true,
          className: 'absolute inset-0 transition-transform duration-500 group-hover:scale-105',
          eager: true,
        }) +
        '<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>' +
        '<div class="absolute inset-x-0 bottom-0 p-6 md:p-8">' +
        '<div class="mb-3 flex items-center gap-2">' +
        '<span class="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">Öne Çıkan</span>' +
        '<span class="text-xs text-white/80 font-medium">' + esc(data.tarih_tr) + '</span>' +
        '</div>' +
        '<h2 class="max-w-4xl text-xl md:text-3xl font-bold leading-tight text-white drop-shadow hover:text-amber-300 transition-colors">' +
        esc(aktif.baslik) +
        '</h2>' +
        '</div>' +
        '</div>';

      /* Önceki / Sonraki İlerleme Butonları */
      if (list.length > 1) {
        html +=
          '<button type="button" aria-label="Önceki Haber" class="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition border border-white/10 hover:bg-amber-500 hover:text-white">' +
          '<i class="' + icon('onceki') + '" aria-hidden="true"></i>' +
          '</button>' +
          '<button type="button" aria-label="Sonraki Haber" class="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition border border-white/10 hover:bg-amber-500 hover:text-white">' +
          '<i class="' + icon('sonraki') + '" aria-hidden="true"></i>' +
          '</button>';
      }
    } else {
      html += '<p class="m-auto p-8 text-slate-400">Haber bulunamadı.</p>';
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
          '<button type="button" class="group/thumb relative flex flex-1 min-w-0 items-center gap-3 overflow-hidden rounded-xl border p-2 pr-3 text-left transition-all duration-200 ' +
          (isCurrent
            ? 'border-amber-400 bg-white shadow-md ring-1 ring-amber-400/40'
            : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-sm') +
          '">' +
          '<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ' +
          (isCurrent ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 group-hover/thumb:bg-slate-200') +
          '">' +
          (realIndex + 1) +
          '</span>' +
          '<div class="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">' +
          mediaSlot({ src: Portal.asset(h.resim), alt: '', className: 'absolute inset-0' }) +
          (!isCurrent ? '<div class="absolute inset-0 bg-white/40"></div>' : '') +
          '</div>' +
          '<span class="line-clamp-2 text-xs font-semibold leading-snug ' +
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

    /* Olaylar */
    var hero = section.querySelector('div.cursor-pointer');
    if (hero) {
      hero.addEventListener('click', function () {
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
        if (realIndex === haberIndex) {
          /* Zaten seçili habere tekrar tıklarsa direkt etkinliğe gitsin */
          handleHaberClick(getHaberler()[realIndex]);
        } else {
          /* Seçili değilse önce slider'da o haberi seçsin */
          setHaberIndex(realIndex);
        }
      });
    });
  }

  /* 2. DUYURU BANT KISMI */
  function duyurularBandiHtml() {
    var duyurular = getDuyurular();
    var items = duyurular.concat(duyurular);

    var html =
      '<section id="duyurular-bandi" class="flex items-stretch rounded-2xl bg-[#0b3757] border-b-4 border-amber-500 shadow-md overflow-hidden text-white gap-4 select-none min-h-[132px]">' +
      '<div class="shrink-0 flex items-center gap-2.5 z-10 bg-[#022842] pl-5 pr-6">' +
      '<i class="' + icon('duyuru_zili') + ' text-2xl text-amber-400" aria-hidden="true"></i>' +
      '<span class="font-black text-sm md:text-base tracking-wide uppercase">Duyurular</span>' +
      '</div>' +
      '<div class="flex-1 min-w-0 overflow-hidden relative flex items-center py-3 pr-4" data-duyuru-marquee-host>' +
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
      '<div class="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">';

    if (dogumGunleri.length) {
      dogumGunleri.forEach(function (p) {
        var foto = p.foto ? Portal.asset(p.foto) : Portal.BRAND_IMG;
        html +=
          '<div class="group relative flex flex-col items-center justify-center rounded-2xl border border-[#022842]/10 bg-white/90 p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:bg-white hover:shadow-lg">' +
          '<div class="relative mb-3">' +
          '<div class="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-[#022842]/20 transition-transform duration-300 group-hover:scale-105 group-hover:ring-amber-500">' +
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
        '<div class="col-span-full flex items-center justify-center gap-2 py-8 text-sm text-slate-500 bg-white/60 rounded-xl border border-[#022842]/10">' +
        '<i class="' + icon('tarih') + ' text-[#022842]/60" aria-hidden="true"></i>' +
        ' Bugün doğum günü olan personel bulunmamaktadır.' +
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
      '<div class="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">' +
      '<div class="flex items-center gap-3">' +
      '<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#022842] text-amber-400 shadow-sm">' +
      '<i class="' + icon('otomasyon_sistem') + ' text-xl" aria-hidden="true"></i>' +
      '</div>' +
      '<div>' +
      '<h2 class="text-lg md:text-xl font-bold text-[#022842]">Kurum İçi Otomasyon Sistemleri</h2>' +
      '<p class="text-xs text-slate-500 font-medium">Hızlı erişim ve yönetim portalları</p>' +
      '</div>' +
      '</div>' +
      '<span class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-[#022842] border border-slate-200/60">' +
      otomasyon.length +
      ' Uygulama</span>' +
      '</div>' +
      '<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">';

    otomasyon.forEach(function (link) {
      var logo = link.logo ? Portal.asset(link.logo) : Portal.BRAND_IMG;
      html +=
        '<a href="' + esc(link.hedef_url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(link.baslik) + '" class="group relative flex aspect-square items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#022842]/30 hover:bg-white hover:shadow-lg">' +
        '<span class="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 transition-all duration-300 group-hover:bg-[#022842] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5">' +
        '<i class="' + icon('harici_baglanti') + ' text-sm" aria-hidden="true"></i>' +
        '</span>' +
        '<div class="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 shadow-xs border border-slate-100 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">' +
        '<img src="' + esc(logo) + '" alt="' + esc(link.baslik) + '" class="h-full w-full object-contain" />' +
        '</div>' +
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
      '<div class="flex flex-col gap-6">' +
      '<section id="haberler" class="flex flex-col gap-3"></section>' +
      duyurularBandiHtml() +
      dogumGunuHtml() +
      otomasyonHtml() +
      '</div>';

    renderHaberler();
    bindMarquee();
  }

  function init() {
    root = document.querySelector('main.app-main');
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
