/*
 * Etkinlikler sayfası — frontend/src/pages/Etkinlikler.jsx portu.
 */
(function () {
  'use strict';

  var PAGE_SIZE = 8;
  var BUGUN = new Date();

  function formatTarih(iso) {
    var d = new Date(iso);
    return {
      gun: d.toLocaleDateString('tr-TR', { day: '2-digit' }),
      ay: d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', ''),
      ayYil: d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      yil: d.getFullYear(),
      gunAdi: d.toLocaleDateString('tr-TR', { weekday: 'long' }),
      tam: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
    };
  }

  /* useState karşılıkları */
  var durumlar = [];
  var etkinlikler = [];
  var activeDurum = null; /* null = Tümü */
  var loading = true;
  var error = null;
  var selectedYear = 'all';
  var page = 1;
  var searchTerm = '';

  var pageEl = null;
  var requestId = 0;

  function esc(value) {
    return Portal.escapeHtml(value);
  }

  var HEADER_HTML =
    '<header class="etkinlikler-head">' +
      '<div class="etkinlikler-head-left">' +
        '<span class="etkinlikler-head-icon"><i class="fas fa-calendar-days" aria-hidden="true"></i></span>' +
        '<div>' +
          '<h1>Etkinlikler</h1>' +
          '<p>Gebze Belediyesi tarafından düzenlenen güncel ve yaklaşan etkinlikler.</p>' +
        '</div>' +
      '</div>' +
    '</header>';

  function render() {
    /* innerHTML yeniden kurulacağı için arama kutusundaki odağı koru */
    var activeEl = document.activeElement;
    var searchWasFocused =
      activeEl && pageEl.contains(activeEl) && activeEl.matches('.etkinlikler-searchbar input');
    var selStart = null;
    var selEnd = null;
    if (searchWasFocused) {
      selStart = activeEl.selectionStart;
      selEnd = activeEl.selectionEnd;
    }

    var siraliEtkinlikler = etkinlikler.slice().sort(function (a, b) {
      return new Date(a.tarih) - new Date(b.tarih);
    });

    var normalizedSearch = searchTerm.trim().toLocaleLowerCase('tr-TR');
    var isSearching = normalizedSearch.length > 0;

    var searchSonuclari = !isSearching
      ? siraliEtkinlikler
      : siraliEtkinlikler.filter(function (e) {
          var hedef = (
            (e.baslik == null ? '' : e.baslik) + ' ' + (e.aciklama == null ? '' : e.aciklama)
          ).toLocaleLowerCase('tr-TR');
          return hedef.indexOf(normalizedSearch) !== -1;
        });

    var rest = isSearching ? searchSonuclari : siraliEtkinlikler;

    var yearsSeen = {};
    var years = [];
    rest.forEach(function (e) {
      var y = formatTarih(e.tarih).yil;
      if (!yearsSeen[y]) {
        yearsSeen[y] = true;
        years.push(y);
      }
    });
    years.sort(function (a, b) {
      return a - b;
    });

    var filteredRest =
      selectedYear === 'all'
        ? rest
        : rest.filter(function (e) {
            return formatTarih(e.tarih).yil === Number(selectedYear);
          });

    var totalPages = Math.max(1, Math.ceil(filteredRest.length / PAGE_SIZE));
    var safePage = Math.min(page, totalPages);
    var pagedRest = filteredRest.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    var bugunEtiket = BUGUN.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });

    var html = HEADER_HTML;
    var mediaItems = [];

    if (loading) {
      html +=
        '<div class="etkinlikler-skeleton">' +
          '<div class="etkinlikler-skeleton-hero"></div>' +
          '<div class="etkinlikler-skeleton-row"></div>' +
          '<div class="etkinlikler-skeleton-row"></div>' +
        '</div>';
    }

    if (!loading && error) {
      html += '<p class="etkinlikler-state etkinlikler-state--error">' + esc(error) + '</p>';
    }

    if (!loading && !error && siraliEtkinlikler.length === 0) {
      html +=
        '<div class="etkinlikler-empty">' +
          '<i class="fas fa-calendar-xmark" aria-hidden="true"></i>' +
          '<p>Şu anda gösterilecek bir etkinlik yok.</p>' +
        '</div>';
    }

    if (!loading && !error && siraliEtkinlikler.length > 0) {
      /* Arama ve Filtre Toolbar'ı */
      html += '<div class="etkinlikler-toolbar">';
      html += '<div class="etkinlikler-searchbar">';
      html += '<i class="fas fa-magnifying-glass" aria-hidden="true"></i>';
      html += '<input type="text" placeholder="Etkinlik ara…" aria-label="Etkinlik ara" />';
      if (searchTerm) {
        html +=
          '<button type="button" class="etkinlikler-searchbar-clear" aria-label="Aramayı temizle">' +
            '<i class="fas fa-xmark" aria-hidden="true"></i>' +
          '</button>';
      }
      html += '</div>';

      if (durumlar.length > 0) {
        html += '<div class="etkinlikler-tabs" role="tablist" aria-label="Etkinlik durumu filtrele">';
        html +=
          '<button type="button" role="tab" aria-selected="' + (activeDurum === null) + '"' +
          ' class="etkinlikler-tab' + (activeDurum === null ? ' is-active' : '') + '">Tümü</button>';
        durumlar.forEach(function (d) {
          html +=
            '<button type="button" role="tab" aria-selected="' + (activeDurum === d.slug) + '"' +
            ' class="etkinlikler-tab' + (activeDurum === d.slug ? ' is-active' : '') + '">' +
            esc(d.ad) +
            '</button>';
        });
        html += '</div>';
      }
      html += '</div>';

      /* 3. Liste / Kart Alanı */
      if (rest.length > 0 || isSearching) {
        html += '<div class="etkinlik-timeline">';
        html += '<div class="etkinlik-timeline-toolbar">';
        if (isSearching) {
          html +=
            '<span class="etkinlik-timeline-today-label">' +
            '\u201C' + esc(searchTerm.trim()) + '\u201D için ' + filteredRest.length + ' sonuç bulundu' +
            '</span>';
        } else {
          html +=
            '<div class="etkinlik-timeline-today">' +
              '<span class="etkinlik-timeline-today-dot"></span>' +
              '<span class="etkinlik-timeline-today-label">Bugün · ' + esc(bugunEtiket) + '</span>' +
            '</div>';
        }

        if (years.length > 1) {
          html += '<label class="etkinlik-year-select">';
          html += '<i class="fas fa-filter" aria-hidden="true"></i>';
          html += '<select><option value="all">Tüm Yıllar</option>';
          years.forEach(function (y) {
            html += '<option value="' + y + '">' + y + '</option>';
          });
          html += '</select></label>';
        }
        html += '</div>';

        if (pagedRest.length === 0) {
          html +=
            '<p class="etkinlikler-state">' +
            (isSearching
              ? 'Aramanızla eşleşen bir etkinlik bulunamadı.'
              : 'Bu seçime uygun etkinlik bulunmuyor.') +
            '</p>';
        } else {
          html += '<div class="etkinlik-timeline-items">';
          pagedRest.forEach(function (e) {
            var tarih = formatTarih(e.tarih);
            html += '<a href="' + Portal.href('/etkinlikler/' + e.id) + '" class="etkinlik-timeline-card">';
            if (e.resim) {
              mediaItems.push(e);
              html += '<div class="etkinlik-timeline-card-media"></div>';
            }
            html += '<div class="etkinlik-timeline-card-body">';
            html += '<div class="etkinlik-timeline-card-badges">';
            html += '<span class="etkinlik-timeline-card-month">' + esc(tarih.ayYil) + '</span>';
            if (e.durum_ref) {
              html += '<span class="etkinlik-timeline-card-badge">' + esc(e.durum_ref) + '</span>';
            }
            html += '</div>';
            html += '<h3>' + esc(e.baslik) + '</h3>';
            html +=
              '<p class="etkinlik-timeline-card-meta">' +
              '<i class="fas fa-calendar-day" aria-hidden="true"></i>' +
              esc(tarih.tam) +
              (e.bitis_tarihi ? esc(' – ' + formatTarih(e.bitis_tarihi).tam) : '') +
              '</p>';
            if (e.aciklama) {
              html += '<p class="etkinlik-timeline-card-desc">' + esc(e.aciklama) + '</p>';
            }
            html += '</div></a>';
          });
          html += '</div>';
        }

        if (totalPages > 1) {
          html += '<div class="etkinlik-pagination">';
          html +=
            '<button type="button" class="etkinlik-pagination-btn"' +
            (safePage === 1 ? ' disabled' : '') +
            ' aria-label="Önceki sayfa"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>';
          html +=
            '<span class="etkinlik-pagination-label">Sayfa ' + safePage + ' / ' + totalPages + '</span>';
          html +=
            '<button type="button" class="etkinlik-pagination-btn"' +
            (safePage === totalPages ? ' disabled' : '') +
            ' aria-label="Sonraki sayfa"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>';
          html += '</div>';
        }

        html += '</div>';
      }
    }

    pageEl.innerHTML = html;

    /* MediaFrame'leri (DOM öğesi) kart medya kutularına yerleştir */
    var mediaEls = pageEl.querySelectorAll('.etkinlik-timeline-card-media');
    for (var i = 0; i < mediaEls.length; i++) {
      var item = mediaItems[i];
      var frame = Media.frame({
        src: Portal.asset(item.resim),
        alt: item.baslik,
        className: 'absolute inset-0',
      });
      if (frame) mediaEls[i].appendChild(frame);
    }

    /* Olay bağlama */
    var searchInput = pageEl.querySelector('.etkinlikler-searchbar input');
    if (searchInput) {
      searchInput.value = searchTerm;
      searchInput.addEventListener('input', function () {
        searchTerm = searchInput.value;
        page = 1;
        render();
      });
      if (searchWasFocused) {
        searchInput.focus();
        try {
          searchInput.setSelectionRange(selStart, selEnd);
        } catch (err) {
          /* type=text için desteklenir; güvenlik amaçlı */
        }
      }
    }

    var clearBtn = pageEl.querySelector('.etkinlikler-searchbar-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchTerm = '';
        page = 1;
        render();
      });
    }

    var tabs = pageEl.querySelectorAll('.etkinlikler-tab');
    for (var t = 0; t < tabs.length; t++) {
      (function (index) {
        tabs[index].addEventListener('click', function () {
          var slug = index === 0 ? null : durumlar[index - 1].slug;
          if (slug === activeDurum) return;
          activeDurum = slug;
          load();
        });
      })(t);
    }

    var yearSelect = pageEl.querySelector('.etkinlik-year-select select');
    if (yearSelect) {
      yearSelect.value = selectedYear;
      yearSelect.addEventListener('change', function () {
        selectedYear = yearSelect.value;
        page = 1;
        render();
      });
    }

    var pagBtns = pageEl.querySelectorAll('.etkinlik-pagination-btn');
    if (pagBtns.length === 2) {
      pagBtns[0].addEventListener('click', function () {
        page = Math.max(1, page - 1);
        render();
      });
      pagBtns[1].addEventListener('click', function () {
        page = Math.min(totalPages, page + 1);
        render();
      });
    }
  }

  /* useEffect([activeDurum]) karşılığı */
  function load() {
    var rid = ++requestId;
    loading = true;
    render();
    Api.fetchEtkinlikler(activeDurum)
      .then(function (data) {
        if (rid !== requestId) return;
        durumlar = data.durumlar == null ? [] : data.durumlar;
        etkinlikler = data.etkinlikler == null ? [] : data.etkinlikler;
        error = null;
        selectedYear = 'all';
        page = 1;
      })
      .catch(function () {
        if (rid === requestId) error = 'Etkinlikler yüklenirken bir sorun oluştu.';
      })
      .finally(function () {
        if (rid !== requestId) return;
        loading = false;
        render();
      });
  }

  function init() {
    pageEl = document.querySelector('.etkinlikler-page');
    if (!pageEl) return;
    load();
  }

  Portal.onReady(init);
})();
