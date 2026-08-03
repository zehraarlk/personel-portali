/*
 * Duyuru Detay — React frontend/src/pages/DuyuruDetay.jsx birebir karşılığı.
 * id: Portal.param('id')  |  geri: Portal.back (navigate(-1))
 */
(function () {
  'use strict';

  var OTHER_ANNOUNCEMENTS_PAGE_SIZE = 6;

  var DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  function esc(value) {
    return Portal.escapeHtml(value);
  }

  function formatDate(value) {
    if (!value) return '';

    var normalizedValue = String(value);
    var isoDateMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoDateMatch) {
      var localDate = new Date(
        Number(isoDateMatch[1]),
        Number(isoDateMatch[2]) - 1,
        Number(isoDateMatch[3])
      );
      return Number.isNaN(localDate.getTime())
        ? normalizedValue
        : DATE_FORMATTER.format(localDate);
    }

    var date = new Date(normalizedValue);
    return Number.isNaN(date.getTime())
      ? normalizedValue
      : DATE_FORMATTER.format(date);
  }

  function getDuyuruMetni(duyuru) {
    return (duyuru && (duyuru.icerik || duyuru.detay || duyuru.aciklama)) || '';
  }

  function announcementMediaHtml(announcement, contain) {
    if (announcement && announcement.resim) {
      if (contain) {
        var src = Portal.asset(announcement.resim);
        return (
          '<div class="duyuru-detay-hero-picture" role="img" aria-label="' +
          esc(announcement.baslik || 'Duyuru görseli') +
          '" style=\'background-image:url(' +
          JSON.stringify(String(src)) +
          ');background-position:center;background-repeat:no-repeat;background-size:contain\'></div>'
        );
      }
      return '<div class="duyuru-detay-media-slot" data-media-src="' + esc(Portal.asset(announcement.resim)) + '" data-media-alt="' + esc(announcement.baslik || 'Duyuru görseli') + '"></div>';
    }

    return (
      '<div class="duyuru-detay-media-placeholder" aria-hidden="true">' +
      '<i class="fas fa-bullhorn"></i>' +
      '</div>'
    );
  }

  var id = '';
  var duyuru = null;
  var duyurular = [];
  var loading = true;
  var error = '';
  var otherPage = 0;
  var pageEl = null;
  var loadToken = 0;

  function render() {
    if (!pageEl) return;

    var html =
      '<button type="button" class="duyuru-detay-back">' +
      '<i class="fas fa-arrow-left" aria-hidden="true"></i>' +
      'Geri Dön</button>';

    if (loading) {
      html +=
        '<div class="duyuru-detay-skeleton" aria-label="Duyuru yükleniyor">' +
        '<div class="duyuru-detay-skeleton-hero"></div>' +
        '<div class="duyuru-detay-skeleton-row"></div>' +
        '</div>';
    }

    if (!loading && error) {
      html +=
        '<section class="duyuru-detay-error" role="alert">' +
        '<i class="fas fa-circle-exclamation" aria-hidden="true"></i>' +
        '<div>' +
        '<h1>Duyuru görüntülenemedi</h1>' +
        '<p>' + esc(error) + '</p>' +
        '<button type="button" data-retry>' +
        '<i class="fas fa-rotate-right" aria-hidden="true"></i>' +
        'Yeniden dene</button>' +
        '</div>' +
        '</section>';
    }

    if (!loading && !error && duyuru) {
      var digerDuyurular = duyurular
        .filter(function (item) {
          return String(item.id) !== String(id);
        })
        .sort(function (a, b) {
          return new Date(a.tarih || 0) - new Date(b.tarih || 0);
        });

      var otherPageCount = Math.max(
        1,
        Math.ceil(digerDuyurular.length / OTHER_ANNOUNCEMENTS_PAGE_SIZE)
      );
      var start = otherPage * OTHER_ANNOUNCEMENTS_PAGE_SIZE;
      var gorunen = digerDuyurular.slice(
        start,
        start + OTHER_ANNOUNCEMENTS_PAGE_SIZE
      );
      var duyuruMetni = getDuyuruMetni(duyuru);

      html += '<div class="duyuru-detay-top-grid">';
      html += '<article class="duyuru-detay-hero">';
      html += '<div class="duyuru-detay-media">';
      html += announcementMediaHtml(duyuru, true);
      html += '<div class="duyuru-detay-shade"></div>';
      html += '</div>';
      html += '<div class="duyuru-detay-hero-overlay">';
      html += '<div class="duyuru-detay-meta">';
      if (duyuru.kategori) {
        html += '<span class="duyuru-detay-badge">' + esc(duyuru.kategori) + '</span>';
      }
      if (duyuru.tarih) {
        html +=
          '<time datetime="' + esc(duyuru.tarih) + '">' +
          '<i class="far fa-calendar-alt" aria-hidden="true"></i>' +
          esc(formatDate(duyuru.tarih)) +
          '</time>';
      }
      html += '</div>';
      html += '<h1 class="duyuru-detay-title">' + esc(duyuru.baslik) + '</h1>';
      html += '</div></article>';

      html += '<aside class="duyuru-detay-side-panel">';
      html += '<div class="duyuru-detay-side-head">';
      html +=
        '<h2><i class="fas fa-bullhorn" aria-hidden="true"></i>Diğer Duyurular</h2>';

      if (digerDuyurular.length > OTHER_ANNOUNCEMENTS_PAGE_SIZE) {
        html += '<div class="duyuru-detay-controls">';
        html +=
          '<button type="button" class="duyuru-detay-slider-btn" data-other-prev' +
          (otherPage === 0 ? ' disabled' : '') +
          ' aria-label="Önceki duyurular">' +
          '<i class="fas fa-chevron-up" aria-hidden="true"></i></button>';
        html +=
          '<button type="button" class="duyuru-detay-slider-btn" data-other-next' +
          (otherPage >= otherPageCount - 1 ? ' disabled' : '') +
          ' aria-label="Sonraki duyurular">' +
          '<i class="fas fa-chevron-down" aria-hidden="true"></i></button>';
        html += '</div>';
      }
      html += '</div>';

      if (gorunen.length > 0) {
        html += '<div class="duyuru-detay-side-list">';
        gorunen.forEach(function (item) {
          html +=
            '<a href="' +
            Portal.href('/duyurular/' + item.id) +
            '" class="duyuru-detay-side-card">';
          html += '<div class="duyuru-detay-side-media">';
          html += announcementMediaHtml(item, false);
          html += '</div>';
          html += '<div class="duyuru-detay-side-body">';
          if (item.tarih) {
            html +=
              '<time datetime="' +
              esc(item.tarih) +
              '">' +
              esc(formatDate(item.tarih)) +
              '</time>';
          }
          html += '<h3>' + esc(item.baslik) + '</h3>';
          html += '</div></a>';
        });
        html += '</div>';
      } else {
        html +=
          '<div class="duyuru-detay-empty">' +
          '<i class="far fa-bell-slash" aria-hidden="true"></i>' +
          '<p>Gösterilecek başka duyuru bulunmuyor.</p>' +
          '</div>';
      }
      html += '</aside></div>';

      html += '<section class="duyuru-detay-full-section">';
      html +=
        '<h2><i class="fas fa-align-left" aria-hidden="true"></i>Duyuru Hakkında</h2>';
      if (duyuruMetni) {
        html += '<p class="duyuru-detay-description">' + esc(duyuruMetni) + '</p>';
      } else {
        html +=
          '<p class="duyuru-detay-description duyuru-detay-description--empty">' +
          'Bu duyuru için ayrıntılı açıklama bulunmuyor.</p>';
      }
      html += '</section>';
    }

    pageEl.innerHTML = html;

    /* Yan kart MediaFrame slotları */
    pageEl.querySelectorAll('.duyuru-detay-media-slot').forEach(function (slot) {
      var frame = Media.frame({
        src: slot.getAttribute('data-media-src'),
        alt: slot.getAttribute('data-media-alt') || '',
        className: 'absolute inset-0',
      });
      if (frame) {
        slot.replaceWith(frame);
      }
    });

    var backBtn = pageEl.querySelector('.duyuru-detay-back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        Portal.back('/duyurular');
      });
    }

    var retry = pageEl.querySelector('[data-retry]');
    if (retry) {
      retry.addEventListener('click', function () {
        load();
      });
    }

    var prevBtn = pageEl.querySelector('[data-other-prev]');
    var nextBtn = pageEl.querySelector('[data-other-next]');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        otherPage = Math.max(0, otherPage - 1);
        render();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var count = Math.max(
          1,
          Math.ceil(
            duyurular.filter(function (item) {
              return String(item.id) !== String(id);
            }).length / OTHER_ANNOUNCEMENTS_PAGE_SIZE
          )
        );
        otherPage = Math.min(count - 1, otherPage + 1);
        render();
      });
    }
  }

  function load() {
    loading = true;
    error = '';
    render();

    var current = ++loadToken;

    Api.fetchDuyurular()
      .then(function (result) {
        if (current !== loadToken) return;

        var gelen = Array.isArray(result.duyurular) ? result.duyurular : [];
        duyurular = gelen;

        var bulunan = null;
        for (var i = 0; i < gelen.length; i += 1) {
          if (String(gelen[i].id) === String(id)) {
            bulunan = gelen[i];
            break;
          }
        }

        if (bulunan) {
          duyuru = bulunan;
        } else {
          duyuru = null;
          error = 'Aradığınız duyuru bulunamadı.';
        }

        loading = false;
        otherPage = 0;
        render();
      })
      .catch(function (requestError) {
        if (current !== loadToken) return;
        duyuru = null;
        error = (requestError && requestError.message) || 'Duyuru bilgileri yüklenemedi.';
        loading = false;
        render();
      });
  }

  function init() {
    pageEl = document.querySelector('.duyuru-detay-page');
    if (!pageEl) return;

    id = Portal.param('id');
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (!id) {
      loading = false;
      error = 'Duyuru kimliği bulunamadı.';
      render();
      return;
    }

    load();
  }

  Portal.onReady(init);
})();
