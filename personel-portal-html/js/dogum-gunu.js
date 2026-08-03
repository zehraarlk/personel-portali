/*
 * Doğum Günü Bilgisi — frontend/src/pages/DogumGunu.jsx birebir portu.
 */
(function () {
  'use strict';

  var KAPSAMLAR = [
    { value: 'today', label: 'Bugün' },
    { value: 'month', label: 'Bu Ay' },
  ];

  var AKTIF_TAB_CLS =
    'inline-flex h-8 min-w-[78px] items-center justify-center gap-1.5 rounded-[10px] px-3 text-[12px] font-bold transition duration-200 bg-gradient-to-r from-[#174a64] to-[#022842] text-white shadow-[0_5px_12px_rgba(2,40,66,0.2)]';
  var PASIF_TAB_CLS =
    'inline-flex h-8 min-w-[78px] items-center justify-center gap-1.5 rounded-[10px] px-3 text-[12px] font-bold transition duration-200 border border-[#d2dfe5] bg-white/95 text-[#022842] shadow-none hover:border-[#aebfc8] hover:bg-white';

  /* useState karşılıkları */
  var scope = 'month';
  var query = '';
  var veri = { kayitlar: [], toplam: 0, tarih: '' };
  var loading = true;
  var error = null;

  var fetchSayac = 0;
  var gecikme = null;

  /* DOM referansları */
  var tabButonlari = [];
  var aramaKutusu = null;
  var aramaInput = null;
  var temizleBtn = null;
  var icerik = null;

  function tarihParcala(isoTarih) {
    var parcalar = String(isoTarih || '').split('-').map(Number);
    return { yil: parcalar[0], ay: parcalar[1], gun: parcalar[2] };
  }

  function basHarfler(adSoyad) {
    return String(adSoyad || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (parca) {
        return parca[0] ? parca[0].toLocaleUpperCase('tr-TR') : '';
      })
      .join('');
  }

  function adSoyadDuzenle(adSoyad) {
    return String(adSoyad || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(function (parca) {
        var kucuk = parca.toLocaleLowerCase('tr-TR');
        return kucuk.charAt(0).toLocaleUpperCase('tr-TR') + kucuk.slice(1);
      })
      .join(' ');
  }

  function kalanGunHesapla(personel, bugun) {
    if (!bugun.yil || !bugun.ay || !bugun.gun || !personel || !personel.ay || !personel.gun) {
      return null;
    }

    var bugunUtc = Date.UTC(bugun.yil, bugun.ay - 1, bugun.gun);
    var dogumGunuUtc = Date.UTC(bugun.yil, personel.ay - 1, personel.gun);

    if (dogumGunuUtc < bugunUtc) {
      dogumGunuUtc = Date.UTC(bugun.yil + 1, personel.ay - 1, personel.gun);
    }

    return Math.round((dogumGunuUtc - bugunUtc) / 86400000);
  }

  function renderTablar() {
    KAPSAMLAR.forEach(function (item, i) {
      var btn = tabButonlari[i];
      var aktif = scope === item.value;
      btn.className = aktif ? AKTIF_TAB_CLS : PASIF_TAB_CLS;
      btn.setAttribute('aria-selected', String(aktif));
      btn.querySelector('span').className =
        'material-symbols-outlined text-[15px] ' + (aktif ? 'text-white' : 'text-[#022842]');
    });
  }

  function renderTemizle() {
    if (query && !temizleBtn) {
      temizleBtn = document.createElement('button');
      temizleBtn.type = 'button';
      temizleBtn.className =
        'ml-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf3f5] text-[#657984] hover:bg-[#e3ecef] hover:text-[#022842]';
      temizleBtn.setAttribute('aria-label', 'Aramayı temizle');
      temizleBtn.innerHTML =
        '<span class="material-symbols-outlined text-[14px]" aria-hidden="true">close</span>';
      temizleBtn.addEventListener('click', function () {
        query = '';
        aramaInput.value = '';
        aramaInput.focus();
        renderTemizle();
        etki();
      });
      aramaKutusu.appendChild(temizleBtn);
    } else if (!query && temizleBtn) {
      temizleBtn.remove();
      temizleBtn = null;
    }
  }

  function personelKartlari(bugun) {
    var html =
      '<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">';
    veri.kayitlar.forEach(function (personel) {
      var kalanGun = kalanGunHesapla(personel, bugun);
      var bugunMu = kalanGun === 0;
      var yakinda = kalanGun !== null && kalanGun > 0 && kalanGun <= 7;
      var kalanGunMetni = bugunMu
        ? 'Bugün'
        : kalanGun === 1
          ? 'Yarın'
          : kalanGun !== null
            ? kalanGun + ' gün kaldı'
            : null;

      var avatar =
        '<div class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(2,40,66,0.10)] ring-1 ring-[#cfdee5]">' +
          '<div class="absolute inset-[4px] rounded-full bg-gradient-to-br from-[#f8fbfc] to-[#edf4f6]"></div>' +
          (personel.foto
            ? '<img src="' + Portal.escapeHtml(Portal.asset(personel.foto)) + '" alt="' + Portal.escapeHtml(personel.ad_soyad) + '" class="relative z-10 h-[44px] w-[44px] rounded-full object-cover" />'
            : '<span class="relative z-10 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-gradient-to-br from-[#174a64] to-[#022842] text-[13px] font-black tracking-wide text-white">' +
                Portal.escapeHtml(basHarfler(personel.ad_soyad)) +
              '</span>') +
        '</div>';

      html +=
        '<article class="group relative min-h-[108px] overflow-hidden rounded-[16px] border border-[#cfdee5] bg-white/95 px-3.5 py-3.5 shadow-[0_4px_14px_rgba(2,40,66,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-[#9fb6c1] hover:shadow-[0_7px_18px_rgba(2,40,66,0.10)]">' +
          '<div class="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(111,147,165,0.08),rgba(255,255,255,0)_72%)]"></div>' +
          '<div class="relative z-10 flex min-h-[76px] items-center gap-3">' +
            avatar +
            '<div class="min-w-0 flex-1">' +
              '<h2 class="m-0 truncate text-[15px] font-black tracking-[-0.02em] text-[#022842] sm:text-[16px]">' +
                Portal.escapeHtml(adSoyadDuzenle(personel.ad_soyad)) +
              '</h2>' +
              '<div class="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] font-semibold text-[#60747f]">' +
                '<span class="inline-flex items-center gap-1">' +
                  '<span class="material-symbols-outlined text-[16px] text-[#315e75]" aria-hidden="true">cake</span>' +
                  Portal.escapeHtml(personel.tarih_metni) +
                '</span>' +
                (kalanGunMetni
                  ? '<span class="text-[#aebdc4]" aria-hidden="true">·</span>' +
                    '<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold ' +
                      (bugunMu || yakinda
                        ? 'border-[#efd38d] bg-[#fff7dc] text-[#8a6505]'
                        : 'border-[#bfd3dc] bg-[#edf5f8] text-[#315e75]') +
                    '">' +
                      Portal.escapeHtml(kalanGunMetni) +
                    '</span>'
                  : '') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>';
    });
    html += '</div>';
    return html;
  }

  function renderIcerik() {
    var bugun = tarihParcala(veri.tarih);
    var html = '';

    if (!loading && !error) {
      html +=
        '<div class="mb-4 flex items-center">' +
          '<span class="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-[#d2dfe5] bg-white/80 px-3.5 text-[13px] font-bold text-[#526b78]">' +
            '<span class="material-symbols-outlined text-[18px] text-[#6f93a5]" aria-hidden="true">group</span>' +
            veri.toplam + ' kişi' +
          '</span>' +
        '</div>';
    }

    if (loading) {
      html +=
        '<div class="rounded-2xl border border-white bg-white/90 p-7 text-center text-[#60747f] shadow-sm">' +
          '<span class="material-symbols-outlined mb-1.5 animate-spin text-[28px] text-[#022842]" aria-hidden="true">progress_activity</span>' +
          '<p class="m-0 text-[13px] font-semibold">Doğum günü bilgileri yükleniyor…</p>' +
        '</div>';
    }

    if (!loading && error) {
      html +=
        '<div class="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-[13px] font-medium text-red-700">' +
          '<span class="material-symbols-outlined text-[20px]" aria-hidden="true">error</span>' +
          '<span>' + Portal.escapeHtml(error) + '</span>' +
        '</div>';
    }

    if (!loading && !error && veri.kayitlar.length === 0) {
      html +=
        '<div class="rounded-2xl border border-white bg-white/90 p-7 text-center shadow-sm">' +
          '<span class="material-symbols-outlined mb-1.5 text-[32px] text-[#8a9aa2]" aria-hidden="true">event_busy</span>' +
          '<p class="m-0 text-[13px] font-bold text-[#334f5d]">Seçilen kapsamda doğum günü kaydı bulunamadı.</p>' +
        '</div>';
    }

    if (!loading && !error && veri.kayitlar.length > 0) {
      html += personelKartlari(bugun);
    }

    icerik.innerHTML = html;

    /* PersonAvatar foto hata durumu: img yerine baş harfler */
    var fotolular = veri.kayitlar.filter(function (p) {
      return Boolean(p.foto);
    });
    icerik.querySelectorAll('article img').forEach(function (img, i) {
      var personel = fotolular[i];
      img.addEventListener('error', function () {
        var span = document.createElement('span');
        span.className =
          'relative z-10 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-gradient-to-br from-[#174a64] to-[#022842] text-[13px] font-black tracking-wide text-white';
        span.textContent = basHarfler(personel && personel.ad_soyad);
        img.replaceWith(span);
      });
    });
  }

  /* useEffect([scope, query]) karşılığı — 250ms gecikmeli fetch */
  function etki() {
    fetchSayac += 1;
    var sayac = fetchSayac;
    loading = true;
    renderIcerik();

    if (gecikme) clearTimeout(gecikme);
    gecikme = setTimeout(function () {
      Api.fetchDogumGunleri(scope, query)
        .then(function (data) {
          if (sayac !== fetchSayac) return;
          veri = {
            kayitlar: (data && data.kayitlar != null) ? data.kayitlar : [],
            toplam: (data && data.toplam != null) ? data.toplam : 0,
            tarih: (data && data.tarih != null) ? data.tarih : '',
          };
          error = null;
        })
        .catch(function (err) {
          if (sayac !== fetchSayac) return;
          error = (err && err.message) || 'Doğum günü bilgileri yüklenemedi.';
        })
        .finally(function () {
          if (sayac !== fetchSayac) return;
          loading = false;
          renderIcerik();
        });
    }, 250);
  }

  function init() {
    var tablist = document.querySelector('[role="tablist"]');
    tabButonlari = Array.prototype.slice.call(tablist.querySelectorAll('button'));
    aramaInput = document.querySelector('section input[type="search"]');
    aramaKutusu = aramaInput.parentElement;
    icerik = document.querySelector('section > main');

    KAPSAMLAR.forEach(function (item, i) {
      tabButonlari[i].addEventListener('click', function () {
        if (scope === item.value) return;
        scope = item.value;
        renderTablar();
        etki();
      });
    });

    aramaKutusu.querySelector('button').addEventListener('click', function () {
      aramaInput.focus();
    });

    aramaInput.addEventListener('input', function (e) {
      query = e.target.value;
      renderTemizle();
      etki();
    });

    etki();
  }

  Portal.onReady(init);
})();
