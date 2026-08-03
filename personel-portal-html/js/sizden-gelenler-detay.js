/*
 * Sizden Gelenler Detay — React frontend/src/pages/SizdenGelenlerDetay.jsx birebir portu.
 */
(function () {
  'use strict';

  var PANEL_BASI = 6;

  function formatTarih(tarih) {
    if (!tarih) return '—';
    var parcalar = tarih.split('-');
    if (parcalar.length !== 3) return tarih;
    return parcalar[2] + '.' + parcalar[1] + '.' + parcalar[0];
  }

  function init() {
    var esc = Portal.escapeHtml;
    var wrap = document.querySelector('main.app-main > .w-full');
    var main = wrap.parentNode;

    /* useParams / useSearchParams karşılıkları */
    var id = Portal.param('id');
    var refSayfa = Portal.param('ref') || null;

    /* useState karşılıkları */
    var tumIcerikler = [];
    var icerik = null;
    var resimBuyuk = false;
    var panelSayfa = 0;

    var modalEl = null;

    /* geri dönüş linki (Link to={listeAdresi}) */
    var backLink = wrap.querySelector('a');
    backLink.setAttribute(
      'href',
      Portal.href('/sizden-gelenler', refSayfa ? { sayfa: refSayfa } : undefined)
    );

    /* geri linki (ilk çocuk) sabit kalır; sonrasındaki durum içeriği değişir */
    function setStateHtml(html) {
      while (backLink.nextSibling) wrap.removeChild(backLink.nextSibling);
      backLink.insertAdjacentHTML('afterend', html);
    }

    function renderModal() {
      if (modalEl) {
        modalEl.remove();
        modalEl = null;
      }
      if (!(resimBuyuk && icerik)) return;

      main.insertAdjacentHTML(
        'beforeend',
        '<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">' +
          '<div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">' +
          '<div class="relative">' +
          '<img src="' + esc(Portal.asset(icerik.resim)) + '" alt="' + esc(icerik.kategori) + '" class="max-h-[80vh] w-full object-contain" />' +
          '<button class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition" aria-label="Kapat">' +
          '<span class="material-symbols-outlined text-[18px]">close</span>' +
          '</button>' +
          '</div>' +
          '<div class="p-4">' +
          '<p class="text-base font-bold text-[#022842]">' + esc(icerik.baslik) + '</p>' +
          '<p class="mt-0.5 text-xs text-[#9aa5ad]">' + esc(formatTarih(icerik.tarih)) + '</p>' +
          '</div>' +
          '</div>' +
          '</div>'
      );
      modalEl = main.lastElementChild;

      function kapat() {
        resimBuyuk = false;
        renderModal();
      }

      modalEl.addEventListener('click', kapat);
      modalEl.firstElementChild.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      modalEl.querySelector('button[aria-label="Kapat"]').addEventListener('click', kapat);
    }

    function renderIcerik() {
      var digerIcerikler = icerik
        ? tumIcerikler.filter(function (i) {
            return String(i.id) !== id;
          })
        : [];

      var panelToplamSayfa = Math.max(1, Math.ceil(digerIcerikler.length / PANEL_BASI));
      var panelGosterilenler = digerIcerikler.slice(
        panelSayfa * PANEL_BASI,
        panelSayfa * PANEL_BASI + PANEL_BASI
      );

      var panelHtml = panelGosterilenler.length
        ? '<div class="flex flex-col gap-2">' +
          panelGosterilenler
            .map(function (item) {
              return (
                '<a href="' + esc(Portal.href('/sizden-gelenler/detay', { id: item.id, ref: refSayfa })) + '" class="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f8fbfd]">' +
                '<div class="h-[58px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[#dce6ed]">' +
                '<img src="' + esc(Portal.asset(item.resim)) + '" alt="' + esc(item.kategori) + '" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />' +
                '</div>' +
                '<div class="min-w-0">' +
                '<p class="line-clamp-2 text-xs font-bold leading-snug text-[#022842] group-hover:text-[#0a3a5c]">' + esc(item.baslik) + '</p>' +
                '<p class="mt-1 text-[10.5px] font-medium text-[#8696a4]">' + esc(formatTarih(item.tarih)) + '</p>' +
                '</div>' +
                '</a>'
              );
            })
            .join('') +
          '</div>'
        : '<p class="p-3 text-xs text-[#8696a4]">Başka içerik bulunmuyor.</p>';

      var panelAltHtml = '';
      if (panelToplamSayfa > 1) {
        panelAltHtml =
          '<div class="flex items-center justify-center gap-2 border-t border-[#022842]/10 px-3 py-2.5">' +
          '<button' + (panelSayfa === 0 ? ' disabled' : '') + ' class="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30" aria-label="Önceki">' +
          '<span class="material-symbols-outlined text-[15px] text-[#022842]">chevron_left</span>' +
          '</button>' +
          '<span class="text-[11px] font-semibold text-[#8696a4]">' + (panelSayfa + 1) + ' / ' + panelToplamSayfa + '</span>' +
          '<button' + (panelSayfa >= panelToplamSayfa - 1 ? ' disabled' : '') + ' class="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30" aria-label="Sonraki">' +
          '<span class="material-symbols-outlined text-[15px] text-[#022842]">chevron_right</span>' +
          '</button>' +
          '</div>';
      }

      setStateHtml(
        '<div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-stretch">' +
          '<div class="overflow-hidden rounded-3xl border border-[#022842]/10 bg-white shadow-sm">' +
          '<button type="button" class="relative block h-80 w-full cursor-pointer overflow-hidden bg-[#dce6ed] sm:h-[420px]" aria-label="Görseli büyüt">' +
          '<img src="' + esc(Portal.asset(icerik.resim)) + '" alt="' + esc(icerik.kategori) + '" class="h-full w-full object-cover" />' +
          '</button>' +
          '<div class="p-5 sm:p-7">' +
          '<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">' +
          '<span class="rounded-full bg-gray-100 border border-gray-200 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#022842]">' + esc(icerik.kategori) + '</span>' +
          '<span class="inline-flex items-center gap-1 text-[#8696a4]">' + esc(formatTarih(icerik.tarih)) + '</span>' +
          '<span class="text-[#c7cdd2]">|</span>' +
          '<span class="inline-flex items-center gap-1 text-[#8696a4]">' +
          '<span class="material-symbols-outlined text-[15px]">visibility</span>' +
          esc(icerik.goruntulenme != null ? icerik.goruntulenme : 0) + ' görüntülenme' +
          '</span>' +
          '</div>' +
          '<h1 class="mb-3 text-2xl font-bold text-[#022842] sm:text-3xl leading-snug">' + esc(icerik.baslik) + '</h1>' +
          '<p class="text-base leading-7 text-[#536575]">' + esc(icerik.ozet) + '</p>' +
          '</div>' +
          '</div>' +
          '<div class="flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-[#022842]/10 bg-white shadow-sm">' +
          '<div class="border-b border-[#022842]/10 px-5 py-4">' +
          '<p class="text-base font-bold text-[#022842]">Diğer İçerikler</p>' +
          '</div>' +
          '<div class="flex-1 overflow-y-auto p-3">' + panelHtml + '</div>' +
          panelAltHtml +
          '</div>' +
          '</div>'
      );

      wrap
        .querySelector('button[aria-label="Görseli büyüt"]')
        .addEventListener('click', function () {
          resimBuyuk = true;
          renderModal();
        });

      var oncekiBtn = wrap.querySelector('button[aria-label="Önceki"]');
      var sonrakiBtn = wrap.querySelector('button[aria-label="Sonraki"]');
      if (oncekiBtn) {
        oncekiBtn.addEventListener('click', function () {
          panelSayfa = Math.max(0, panelSayfa - 1);
          renderIcerik();
        });
      }
      if (sonrakiBtn) {
        sonrakiBtn.addEventListener('click', function () {
          panelSayfa = Math.min(panelToplamSayfa - 1, panelSayfa + 1);
          renderIcerik();
        });
      }
    }

    /* useEffect(goruntulenmeArttir, [id]) */
    Api.goruntulenmeArttir(id).catch(function () {});

    Api.fetchSizdenGelenler()
      .then(function (data) {
        var liste = data.icerikler || [];
        tumIcerikler = liste;
        icerik =
          liste.filter(function (i) {
            return String(i.id) === id;
          })[0] || null;

        if (!icerik) {
          setStateHtml(
            '<div class="rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">' +
              '<span class="material-symbols-outlined mb-3 text-5xl text-[#c7cdd2]">search_off</span>' +
              '<p class="text-base font-semibold text-[#022842]">İçerik bulunamadı</p>' +
              '</div>'
          );
          return;
        }
        renderIcerik();
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
