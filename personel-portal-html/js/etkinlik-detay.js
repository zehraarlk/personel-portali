/*
 * Etkinlik detay sayfası — frontend/src/pages/EtkinlikDetay.jsx portu.
 * Detay id'si query parametresinden gelir: etkinlik-detay.html?id=5
 */
(function () {
  'use strict';

  /* Yan paneldeki "Diğer Etkinlikler" listesi için sayfalama (scroll yerine ok tuşları) */
  var DIGER_VISIBLE_COUNT = 6;

  function formatTarih(iso) {
    var d = new Date(iso);
    return {
      gun: d.toLocaleDateString('tr-TR', { day: '2-digit' }),
      ay: d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', ''),
      gunAdi: d.toLocaleDateString('tr-TR', { weekday: 'long' }),
      tam: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
    };
  }

  /* useState karşılıkları */
  var etkinlik = null;
  var diger = [];
  var loading = true;
  var error = null;
  var digerIndex = 0;

  var pageEl = null;
  var id = '';

  function esc(value) {
    return Portal.escapeHtml(value);
  }

  function render() {
    var digerPageCount = Math.max(1, Math.ceil(diger.length / DIGER_VISIBLE_COUNT));
    var digerPage = Math.floor(digerIndex / DIGER_VISIBLE_COUNT);
    var visibleDiger = diger.slice(digerIndex, digerIndex + DIGER_VISIBLE_COUNT);

    var html =
      '<button type="button" class="etkinlik-detay-back">' +
      '<i class="fas fa-arrow-left" aria-hidden="true"></i>Geri Dön</button>';

    if (loading) {
      html +=
        '<div class="etkinlik-detay-skeleton">' +
          '<div class="etkinlik-detay-skeleton-hero"></div>' +
          '<div class="etkinlik-detay-skeleton-row"></div>' +
        '</div>';
    }

    if (!loading && !error && etkinlik) {
      html += '<div class="etkinlik-detay-top-grid">';

      html += '<article class="etkinlik-detay-hero">';
      html += '<div class="etkinlik-detay-media">';
      if (!etkinlik.resim) {
        html += '<div class="etkinlik-detay-media--placeholder"></div>';
      }
      html += '<div class="etkinlik-detay-shade"></div>';
      html += '</div>';
      html += '<div class="etkinlik-detay-hero-overlay">';
      if (etkinlik.durum_ref) {
        html += '<span class="etkinlik-detay-badge">' + esc(etkinlik.durum_ref) + '</span>';
      }
      html += '<h1 class="etkinlik-detay-title">' + esc(etkinlik.baslik) + '</h1>';
      html += '</div>';
      html += '</article>';

      html += '<aside class="etkinlik-detay-side-panel">';
      if (etkinlik.konum || etkinlik.adres) {
        var konum = etkinlik.konum == null ? etkinlik.adres : etkinlik.konum;
        html +=
          '<div class="etkinlik-detay-konum-box">' +
          '<i class="fas fa-location-dot" aria-hidden="true"></i>' +
          '<span>' + esc(konum) + '</span>' +
          '</div>';
      }

      if (diger.length > 0) {
        html += '<div class="etkinlik-detay-side-diger">';
        html += '<div class="etkinlik-detay-side-diger-head">';
        html += '<h2><i class="fas fa-calendar-week" aria-hidden="true"></i>Diğer Etkinlikler</h2>';
        if (diger.length > DIGER_VISIBLE_COUNT) {
          html += '<div class="etkinlik-detay-side-diger-controls">';
          html +=
            '<button type="button" class="etkinlik-slider-btn"' +
            (digerPage === 0 ? ' disabled' : '') +
            ' aria-label="Önceki Etkinlikler"><i class="fas fa-chevron-up"></i></button>';
          html +=
            '<button type="button" class="etkinlik-slider-btn"' +
            (digerPage >= digerPageCount - 1 ? ' disabled' : '') +
            ' aria-label="Sonraki Etkinlikler"><i class="fas fa-chevron-down"></i></button>';
          html += '</div>';
        }
        html += '</div>';

        html += '<div class="etkinlik-detay-side-diger-list">';
        visibleDiger.forEach(function (e) {
          var t = formatTarih(e.tarih);
          html += '<a href="' + Portal.href('/etkinlikler/' + e.id) + '" class="etkinlik-detay-side-diger-card">';
          if (e.resim) {
            html += '<div class="etkinlik-detay-side-diger-media"></div>';
          }
          html += '<div class="etkinlik-detay-side-diger-body">';
          html += '<span class="etkinlik-detay-side-diger-tarih">' + esc(t.tam) + '</span>';
          html += '<h3>' + esc(e.baslik) + '</h3>';
          html += '</div></a>';
        });
        html += '</div>';
        html += '</div>';
      }
      html += '</aside>';

      html += '</div>';

      /* Alt Kısım: Ana Etkinliğin Tüm Genişlikte Açıklaması */
      if (etkinlik.aciklama) {
        html +=
          '<section class="etkinlik-detay-full-section">' +
          '<h2><i class="fas fa-align-left" aria-hidden="true"></i>Etkinlik Hakkında</h2>' +
          '<p class="etkinlik-detay-aciklama">' + esc(etkinlik.aciklama) + '</p>' +
          '</section>';
      }
    }

    pageEl.innerHTML = html;

    /* MediaFrame'ler (DOM öğesi döndürdükleri için innerHTML sonrası eklenir) */
    if (!loading && !error && etkinlik && etkinlik.resim) {
      var mediaBox = pageEl.querySelector('.etkinlik-detay-media');
      var heroFrame = Media.frame({
        src: Portal.asset(etkinlik.resim),
        alt: etkinlik.baslik,
        dark: true,
        className: 'absolute inset-0',
        eager: true,
      });
      if (heroFrame) mediaBox.insertBefore(heroFrame, mediaBox.firstChild);
    }

    var digerMediaEls = pageEl.querySelectorAll('.etkinlik-detay-side-diger-media');
    var digerWithResim = visibleDiger.filter(function (e) {
      return e.resim;
    });
    for (var i = 0; i < digerMediaEls.length; i++) {
      var frame = Media.frame({
        src: Portal.asset(digerWithResim[i].resim),
        alt: digerWithResim[i].baslik,
        className: 'absolute inset-0',
      });
      if (frame) digerMediaEls[i].appendChild(frame);
    }

    /* Olay bağlama */
    var backBtn = pageEl.querySelector('.etkinlik-detay-back');
    backBtn.addEventListener('click', function () {
      Portal.back('/etkinlikler');
    });

    var sliderBtns = pageEl.querySelectorAll('.etkinlik-detay-side-diger-controls .etkinlik-slider-btn');
    if (sliderBtns.length === 2) {
      sliderBtns[0].addEventListener('click', function () {
        digerIndex = Math.max(0, digerIndex - DIGER_VISIBLE_COUNT);
        render();
      });
      sliderBtns[1].addEventListener('click', function () {
        digerIndex = Math.min((digerPageCount - 1) * DIGER_VISIBLE_COUNT, digerIndex + DIGER_VISIBLE_COUNT);
        render();
      });
    }
  }

  /* useEffect([id]) karşılığı */
  function init() {
    pageEl = document.querySelector('.etkinlik-detay-page');
    if (!pageEl) return;

    id = Portal.param('id');
    loading = true;
    error = null;
    digerIndex = 0;
    render();

    Api.fetchEtkinlikler(null)
      .then(function (data) {
        var liste = data.etkinlikler == null ? [] : data.etkinlikler;
        var bulunan = null;
        for (var i = 0; i < liste.length; i++) {
          if (String(liste[i].id) === String(id)) {
            bulunan = liste[i];
            break;
          }
        }

        if (!bulunan) {
          error = 'Bu etkinlik bulunamadı ya da kaldırılmış olabilir.';
          etkinlik = null;
        } else {
          etkinlik = bulunan;
          diger = liste
            .filter(function (e) {
              return String(e.id) !== String(id);
            })
            .sort(function (a, b) {
              return new Date(a.tarih) - new Date(b.tarih);
            });
        }
      })
      .catch(function () {
        error = 'Etkinlik yüklenirken bir sorun oluştu.';
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  Portal.onReady(init);
})();
