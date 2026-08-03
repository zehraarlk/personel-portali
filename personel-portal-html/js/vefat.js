/*
 * Vefat Edenler — frontend/src/pages/VefatEdenler.jsx birebir portu.
 */
(function () {
  'use strict';

  var SAYFA_BASI = 6;

  /* useState karşılıkları */
  var vefatlar = [];
  var query = '';
  var seciliYil = 'tumu';
  var sayfa = 0;
  var loading = true;
  var error = null;

  var fetchSayac = 0;
  var gecikme = null;

  /* DOM referansları */
  var sarmal = null;
  var arac = null;
  var aramaInput = null;
  var yilSelect = null;

  function mesajiAyikla(mesaj) {
    if (!mesaj) return { giris: null, cenaze: null, irtibat: null };

    var irtibatMatch = mesaj.match(/İrtibat\s*:?/i);
    var govde = mesaj;
    var irtibat = null;

    if (irtibatMatch) {
      govde = mesaj.slice(0, irtibatMatch.index).trim();
      irtibat = mesaj.slice(irtibatMatch.index + irtibatMatch[0].length).trim() || null;
    }

    var cenazeMatch = govde.match(/\bCenaze(si)?\b[\s\S]*/i);
    var giris = null;
    var cenaze = null;

    if (cenazeMatch && cenazeMatch.index > 0) {
      giris = govde.slice(0, cenazeMatch.index).trim() || null;
      cenaze = govde.slice(cenazeMatch.index).trim() || null;
    } else if (cenazeMatch) {
      cenaze = govde.trim() || null;
    } else {
      giris = govde.trim() || null;
    }

    return { giris: giris, cenaze: cenaze, irtibat: irtibat };
  }

  /* yillar (useMemo karşılığı) */
  function yillariHesapla() {
    var set = new Set(
      vefatlar.map(function (v) {
        return new Date(v.vefat_tarihi).getFullYear();
      })
    );
    return Array.from(set).sort(function (a, b) {
      return b - a;
    });
  }

  /* siraliVefatlar (useMemo karşılığı) */
  function siraliVefatlar() {
    var liste = vefatlar.slice();
    if (seciliYil !== 'tumu') {
      liste = liste.filter(function (v) {
        return new Date(v.vefat_tarihi).getFullYear() === Number(seciliYil);
      });
    }
    liste.sort(function (a, b) {
      return new Date(b.vefat_tarihi) - new Date(a.vefat_tarihi);
    });
    return liste;
  }

  function sayfaAyarla(n) {
    sayfa = n;
    window.scrollTo({ top: 0, behavior: 'auto' });
    renderIcerik();
  }

  function renderYillar() {
    var html = '<option value="tumu">Tüm Yıllar</option>';
    yillariHesapla().forEach(function (yil) {
      html += '<option value="' + yil + '">' + yil + '</option>';
    });
    yilSelect.innerHTML = html;
    yilSelect.value = seciliYil;
  }

  function vefatKarti(v) {
    var parcalar = mesajiAyikla(v.cenaze_mesaji);
    return (
      '<div class="flex overflow-hidden rounded-xl border border-[#022842]/10 bg-white shadow-sm">' +
        '<div class="flex w-24 shrink-0 flex-col items-center justify-center gap-2 px-3 py-4 text-center" style="background: linear-gradient(to bottom, #022842 0%, #134a6e 50%, #022842 100%);">' +
          '<i class="fas fa-ribbon text-[22px] text-white" aria-hidden="true"></i>' +
          '<span class="text-[10px] font-semibold leading-tight text-white/90">' +
            Portal.escapeHtml(v.vefat_tarihi_metin) +
          '</span>' +
        '</div>' +
        '<div class="flex flex-1 flex-col p-4">' +
          '<p class="text-sm font-bold text-[#022842]">' + Portal.escapeHtml(v.vefat_eden_adi) + '</p>' +
          (v.iliski_pozisyon
            ? '<span class="mt-1 inline-block w-fit rounded-full bg-[#f4f7fa] px-2.5 py-0.5 text-[11px] font-medium text-[#5b6b78]">' +
                Portal.escapeHtml(v.iliski_pozisyon) +
              '</span>'
            : '') +
          (parcalar.giris
            ? '<p class="mt-2.5 text-xs leading-6 text-[#536575]">' + Portal.escapeHtml(parcalar.giris) + '</p>'
            : '') +
          (parcalar.cenaze
            ? '<div class="mt-2.5 flex items-start gap-2">' +
                '<span class="material-symbols-outlined mt-0.5 text-[16px] text-[#a16207]">location_on</span>' +
                '<div>' +
                  '<p class="text-[11px] font-bold text-[#022842]">Cenaze</p>' +
                  '<p class="mt-0.5 text-xs leading-6 text-[#536575]">' + Portal.escapeHtml(parcalar.cenaze) + '</p>' +
                '</div>' +
              '</div>'
            : '') +
          (parcalar.irtibat
            ? '<div class="mt-2.5 flex items-start gap-2 border-t border-[#022842]/8 pt-2.5">' +
                '<span class="material-symbols-outlined mt-0.5 text-[16px] text-[#a16207]">call</span>' +
                '<div>' +
                  '<p class="text-[11px] font-bold text-[#022842]">İletişim</p>' +
                  '<p class="mt-0.5 text-xs leading-6 text-[#536575]">' + Portal.escapeHtml(parcalar.irtibat) + '</p>' +
                '</div>' +
              '</div>'
            : '') +
        '</div>' +
      '</div>'
    );
  }

  function renderSayfalama(toplamSayfa) {
    var sayfalama = document.createElement('div');
    sayfalama.className = 'mt-8 flex items-center justify-center gap-2';

    var prev = document.createElement('button');
    prev.className =
      'flex h-9 w-9 items-center justify-center rounded-xl border border-[#022842]/10 bg-white shadow-sm disabled:opacity-30';
    prev.disabled = sayfa === 0;
    prev.innerHTML =
      '<span class="material-symbols-outlined text-[16px] text-[#5b6b78]">chevron_left</span>';
    prev.addEventListener('click', function () {
      sayfaAyarla(Math.max(0, sayfa - 1));
    });
    sayfalama.appendChild(prev);

    for (var n = 0; n < toplamSayfa; n++) {
      (function (n) {
        var btn = document.createElement('button');
        btn.className =
          'flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shadow-sm ' +
          (sayfa === n
            ? 'bg-[#022842] text-white'
            : 'border border-[#022842]/10 bg-white text-[#022842]');
        btn.textContent = String(n + 1);
        btn.addEventListener('click', function () {
          sayfaAyarla(n);
        });
        sayfalama.appendChild(btn);
      })(n);
    }

    var next = document.createElement('button');
    next.className =
      'flex h-9 w-9 items-center justify-center rounded-xl border border-[#022842]/10 bg-white shadow-sm disabled:opacity-30';
    next.disabled = sayfa >= toplamSayfa - 1;
    next.innerHTML =
      '<span class="material-symbols-outlined text-[16px] text-[#5b6b78]">chevron_right</span>';
    next.addEventListener('click', function () {
      sayfaAyarla(Math.min(toplamSayfa - 1, sayfa + 1));
    });
    sayfalama.appendChild(next);

    return sayfalama;
  }

  function renderIcerik() {
    while (arac.nextSibling) arac.nextSibling.remove();

    if (loading) {
      sarmal.insertAdjacentHTML(
        'beforeend',
        '<div class="rounded-2xl border border-[#022842]/10 bg-white p-8 text-[#536575] shadow-sm">' +
          '<div class="flex items-center gap-3">' +
            '<span class="material-symbols-outlined animate-spin text-[#022842]">progress_activity</span>' +
            'Yükleniyor…' +
          '</div>' +
        '</div>'
      );
      return;
    }

    if (error) {
      sarmal.insertAdjacentHTML(
        'beforeend',
        '<div class="rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">' +
          Portal.escapeHtml(error) +
        '</div>'
      );
      return;
    }

    var sirali = siraliVefatlar();
    var toplamSayfa = Math.max(1, Math.ceil(sirali.length / SAYFA_BASI));
    var gosterilenler = sirali.slice(sayfa * SAYFA_BASI, sayfa * SAYFA_BASI + SAYFA_BASI);

    if (gosterilenler.length === 0) {
      sarmal.insertAdjacentHTML(
        'beforeend',
        '<div class="rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">' +
          '<i class="fas fa-ribbon mb-3 block text-3xl text-[#c7cdd2]" aria-hidden="true"></i>' +
          '<p class="text-sm text-[#5b6b78]">Kayıt bulunamadı.</p>' +
        '</div>'
      );
      return;
    }

    var html = '<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">';
    gosterilenler.forEach(function (v) {
      html += vefatKarti(v);
    });
    html += '</div>';
    sarmal.insertAdjacentHTML('beforeend', html);

    if (toplamSayfa > 1) {
      sarmal.appendChild(renderSayfalama(toplamSayfa));
    }
  }

  /* useEffect([query]) karşılığı — 300ms gecikmeli fetch */
  function etki() {
    fetchSayac += 1;
    var sayac = fetchSayac;
    loading = true;
    renderIcerik();

    if (gecikme) clearTimeout(gecikme);
    gecikme = setTimeout(function () {
      Api.fetchVefat(query.trim())
        .then(function (data) {
          if (sayac !== fetchSayac) return;
          vefatlar = (data && data.vefatlar != null) ? data.vefatlar : [];
          error = null;
        })
        .catch(function () {
          if (sayac !== fetchSayac) return;
          error = 'Vefat bilgileri yüklenirken bir sorun oluştu.';
        })
        .finally(function () {
          if (sayac !== fetchSayac) return;
          loading = false;
          renderYillar();
          renderIcerik();
        });
    }, 300);
  }

  function init() {
    sarmal = document.querySelector('main.app-main > .w-full');
    arac = sarmal.children[1];
    aramaInput = arac.querySelector('input[type="text"]');
    yilSelect = arac.querySelector('select');

    arac.querySelector('button[aria-label="Arama kutusuna odaklan"]').addEventListener('click', function () {
      aramaInput.focus();
    });

    arac.querySelector('button[aria-label="Yıl menüsünü aç"]').addEventListener('click', function () {
      yilSelect.focus();
      yilSelect.click();
    });

    aramaInput.addEventListener('input', function (e) {
      query = e.target.value;
      sayfa = 0;
      etki();
    });

    yilSelect.addEventListener('change', function (e) {
      seciliYil = e.target.value;
      sayfa = 0;
      renderIcerik();
    });

    etki();
  }

  Portal.onReady(init);
})();
