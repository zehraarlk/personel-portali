/*
 * Sizden Gelenler — React frontend/src/pages/SizdenGelenler.jsx birebir portu.
 */
(function () {
  'use strict';

  var SAYFA_BASI = 12;

  function formatTarih(tarih) {
    if (!tarih) return '—';
    var parcalar = tarih.split('-');
    if (parcalar.length !== 3) return tarih;
    return parcalar[2] + '.' + parcalar[1] + '.' + parcalar[0];
  }

  function init() {
    var esc = Portal.escapeHtml;
    var root = document.querySelector('main.app-main > .w-full');

    /* useState karşılıkları */
    var data = null;
    var arama = '';
    var menuAcik = false;

    /* useSearchParams karşılıkları */
    var sayfa = Number(Portal.param('sayfa') || 0);
    var seciliKategori = Portal.param('kategori') || null;

    /* render sonrası saklanan DOM referansları */
    var searchInput = null;
    var menuWrap = null;
    var anchorEl = null; /* listeRef */
    var gridEl = null;
    var featuredEl = null;
    var pagEl = null;

    function replaceQuery(next) {
      var qs = next.toString();
      var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      window.history.replaceState(null, '', url);
    }

    function sayfaAyarla(deger, kaydir) {
      if (kaydir === undefined) kaydir = true;
      var yeniDeger = typeof deger === 'function' ? deger(sayfa) : deger;
      var next = new URLSearchParams(window.location.search);
      if (yeniDeger === 0) next.delete('sayfa');
      else next.set('sayfa', String(yeniDeger));
      replaceQuery(next);
      sayfa = yeniDeger;
      if (kaydir && anchorEl) anchorEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      renderIcerik();
    }

    function kategoriSec(slug) {
      arama = '';
      if (searchInput) searchInput.value = '';
      var next = new URLSearchParams(window.location.search);
      if (slug) next.set('kategori', slug);
      else next.delete('kategori');
      next.delete('sayfa');
      replaceQuery(next);
      seciliKategori = slug;
      sayfa = 0;
      window.scrollTo({ top: 0, behavior: 'auto' });
      renderIcerik();
    }

    /* header (ilk çocuk) sabit kalır; sonrasındaki durum içeriği değişir */
    function setStateHtml(html) {
      var header = root.firstElementChild;
      while (header.nextSibling) root.removeChild(header.nextSibling);
      header.insertAdjacentHTML('afterend', html);
    }

    function menuItemHtml(secili, etiket) {
      return (
        '<button class="flex w-full items-center px-4 py-0.25 text-left text-[11px] font-semibold transition ' +
        (secili ? 'bg-[#022842] text-white' : 'text-[#33495a] hover:bg-[#f8fbfd]') +
        '">' +
        esc(etiket) +
        '</button>'
      );
    }

    function renderMenu() {
      var kategoriler = (data && data.kategoriler) || [];
      var html =
        '<button class="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-[#022842]/10 bg-white shadow-sm" aria-label="Müdürlükler menüsü">' +
        '<span class="material-symbols-outlined text-[19px] text-[#022842]">menu</span>' +
        '</button>';
      if (menuAcik) {
        html +=
          '<div class="fixed inset-0 z-30"></div>' +
          '<div class="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-[#022842]/10 bg-white shadow-[0_16px_36px_rgba(2,40,66,0.14)]">' +
          menuItemHtml(seciliKategori === null, 'Tümü') +
          kategoriler
            .map(function (k) {
              return menuItemHtml(seciliKategori === k.slug, k.ad);
            })
            .join('') +
          '</div>';
      }
      menuWrap.innerHTML = html;

      menuWrap.firstElementChild.addEventListener('click', function () {
        menuAcik = !menuAcik;
        renderMenu();
      });

      if (menuAcik) {
        menuWrap.children[1].addEventListener('click', function () {
          menuAcik = false;
          renderMenu();
        });
        var dropdown = menuWrap.children[2];
        var butonlar = dropdown.querySelectorAll('button');
        butonlar[0].addEventListener('click', function () {
          kategoriSec(null);
          menuAcik = false;
          renderMenu();
        });
        kategoriler.forEach(function (k, i) {
          butonlar[i + 1].addEventListener('click', function () {
            kategoriSec(k.slug);
            menuAcik = false;
            renderMenu();
          });
        });
      }
    }

    function renderIcerik() {
      var icerikler = (data && data.icerikler) || [];

      var oneCikan = icerikler
        .slice()
        .sort(function (a, b) {
          return b.goruntulenme - a.goruntulenme;
        })[0];

      var sonuc = seciliKategori
        ? icerikler.filter(function (i) {
            return i.kategori_slug === seciliKategori;
          })
        : icerikler;

      if (arama.trim()) {
        var q = arama.trim().toLocaleLowerCase('tr-TR');
        sonuc = sonuc.filter(function (i) {
          return (
            i.baslik.toLocaleLowerCase('tr-TR').indexOf(q) !== -1 ||
            i.ozet.toLocaleLowerCase('tr-TR').indexOf(q) !== -1 ||
            i.kategori.toLocaleLowerCase('tr-TR').indexOf(q) !== -1
          );
        });
      }

      var toplamSayfa = Math.max(1, Math.ceil(sonuc.length / SAYFA_BASI));
      var gosterilenler = sonuc.slice(sayfa * SAYFA_BASI, sayfa * SAYFA_BASI + SAYFA_BASI);

      /* öne çıkan kart */
      if (featuredEl) {
        featuredEl.remove();
        featuredEl = null;
      }
      if (oneCikan && !seciliKategori && !arama) {
        anchorEl.insertAdjacentHTML(
          'beforebegin',
          '<a href="' + esc(Portal.href('/sizden-gelenler/detay', { id: oneCikan.id })) + '" class="mb-6 block overflow-hidden rounded-2xl bg-[#011f34] shadow-sm">' +
            '<div class="relative h-72">' +
            '<img src="' + esc(Portal.asset(oneCikan.resim)) + '" alt="' + esc(oneCikan.kategori) + '" class="h-full w-full object-cover opacity-80" />' +
            '<div class="absolute inset-0 bg-gradient-to-t from-[#011f34] via-[#011f34]/30 to-transparent"></div>' +
            '<div class="absolute inset-x-0 bottom-0 p-5">' +
            '<span class="mb-1.5 inline-block rounded-full bg-[#f5a623] px-2.5 py-1 text-[11px] font-bold text-[#022842]">Öne Çıkan · ' + esc(oneCikan.kategori) + '</span>' +
            '<p class="text-lg font-bold text-white">' + esc(oneCikan.baslik) + '</p>' +
            '</div>' +
            '</div>' +
            '</a>'
        );
        featuredEl = anchorEl.previousElementSibling;
      }

      /* liste */
      gridEl.innerHTML = gosterilenler.length
        ? gosterilenler
            .map(function (item) {
              return (
                '<a href="' + esc(Portal.href('/sizden-gelenler/detay', { id: item.id, ref: sayfa })) + '" class="group flex gap-3 overflow-hidden rounded-xl border border-[#022842]/10 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">' +
                '<div class="h-[60px] w-[78px] shrink-0 overflow-hidden rounded-lg bg-[#dce6ed]">' +
                '<img src="' + esc(Portal.asset(item.resim)) + '" alt="' + esc(item.kategori) + '" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />' +
                '</div>' +
                '<div class="min-w-0 flex-1 self-center">' +
                '<p class="mb-0.5 text-[11px] font-bold uppercase text-[#c2410c]">' + esc(item.kategori) + '</p>' +
                '<p class="line-clamp-1 text-sm font-semibold text-[#022842]">' + esc(item.baslik) + '</p>' +
                '<p class="mt-0.5 text-[11px] text-[#9aa5ad]">' + esc(formatTarih(item.tarih)) + '</p>' +
                '</div>' +
                '</a>'
              );
            })
            .join('')
        : '<div class="col-span-full rounded-2xl border border-[#022842]/10 bg-white p-8 text-center shadow-sm">' +
          '<span class="material-symbols-outlined mb-2 text-4xl text-[#c7cdd2]">search_off</span>' +
          '<p class="text-sm text-[#5b6b78]">Aramanla eşleşen içerik bulunamadı.</p>' +
          '</div>';

      /* sayfalama */
      if (pagEl) {
        pagEl.remove();
        pagEl = null;
      }
      if (toplamSayfa > 1) {
        var sayfaButonlari = '';
        for (var n = 0; n < toplamSayfa; n++) {
          sayfaButonlari +=
            '<button class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ' +
            (sayfa === n ? 'bg-[#022842] text-white' : 'border border-[#022842]/10 bg-white text-[#022842]') +
            '">' + (n + 1) + '</button>';
        }
        gridEl.insertAdjacentHTML(
          'afterend',
          '<div class="mt-6 flex items-center justify-center gap-1.5">' +
            '<button' + (sayfa === 0 ? ' disabled' : '') + ' class="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30">' +
            '<span class="material-symbols-outlined text-[14px] text-[#5b6b78]">chevron_left</span>' +
            '</button>' +
            sayfaButonlari +
            '<button' + (sayfa >= toplamSayfa - 1 ? ' disabled' : '') + ' class="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30">' +
            '<span class="material-symbols-outlined text-[14px] text-[#5b6b78]">chevron_right</span>' +
            '</button>' +
            '</div>'
        );
        pagEl = gridEl.nextElementSibling;

        var butonlar = pagEl.querySelectorAll('button');
        butonlar[0].addEventListener('click', function () {
          sayfaAyarla(function (s) {
            return Math.max(0, s - 1);
          });
        });
        for (var i = 1; i < butonlar.length - 1; i++) {
          (function (hedef) {
            butonlar[hedef + 1].addEventListener('click', function () {
              sayfaAyarla(hedef);
            });
          })(i - 1);
        }
        butonlar[butonlar.length - 1].addEventListener('click', function () {
          sayfaAyarla(function (s) {
            return Math.min(toplamSayfa - 1, s + 1);
          });
        });
      }
    }

    function renderYuklendi() {
      setStateHtml(
        '<div class="mb-6 flex items-center gap-2">' +
          '<div class="flex flex-1 items-center gap-2 rounded-xl border border-[#022842]/10 bg-white px-3.5 py-2 shadow-sm">' +
          '<span class="material-symbols-outlined text-[17px] text-[#9aa5ad]">search</span>' +
          '<input type="text" placeholder="Ara…" class="w-full border-0 bg-transparent text-sm text-[#0b1c30] outline-none placeholder:text-[#9aa5ad]" />' +
          '</div>' +
          '<div class="relative shrink-0"></div>' +
          '</div>' +
          '<div class="scroll-mt-24"></div>' +
          '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2"></div>'
      );

      searchInput = root.querySelector('input');
      searchInput.value = arama;
      menuWrap = root.querySelector('.relative.shrink-0');
      anchorEl = root.querySelector('.scroll-mt-24');
      gridEl = root.querySelector('.grid');
      featuredEl = null;
      pagEl = null;

      searchInput.addEventListener('input', function (e) {
        arama = e.target.value;
        /* React'taki useEffect([seciliKategori, arama]) karşılığı: sayfayı sıfırla */
        sayfaAyarla(0, false);
      });

      renderMenu();
      renderIcerik();
    }

    Api.fetchSizdenGelenler()
      .then(function (sonuc) {
        data = sonuc;
        renderYuklendi();
      })
      .catch(function (err) {
        setStateHtml(
          '<div class="rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">' +
            'Veriler alınamadı: ' + esc(err.message) +
            '</div>'
        );
      });
  }

  Portal.onReady(init);
})();
