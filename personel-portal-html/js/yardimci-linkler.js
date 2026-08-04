/*
 * Yardımcı Linkler — frontend/src/pages/YardimciLinkler.jsx birebir portu.
 */
(function () {
  'use strict';

  var BLUE = '#1c3a5e';

  /* useState karşılıkları */
  var items = [];
  var query = '';
  var seciliKategori = null;
  var kategorilerPaneliAcik = false;
  var loading = true;
  var error = null;

  /* DOM referansları */
  var page = null;
  var toolbar = null;
  var searchInput = null;
  var kategorilerWrap = null;
  var kategorilerBtn = null;
  var kategorilerIcon = null;
  var temizleBtn = null;
  var panelEl = null;

  /* filtered (useMemo karşılığı) */
  function filtrele() {
    var q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return items;
    return items.filter(function (item) {
      return (item.baslik || '').toLocaleLowerCase('tr-TR').indexOf(q) !== -1;
    });
  }

  /* gruplanmis (useMemo karşılığı) */
  function grupla(filtered) {
    var map = new Map();
    filtered.forEach(function (item) {
      var anahtar = item.kategori || 'Diğer';
      if (!map.has(anahtar)) map.set(anahtar, []);
      map.get(anahtar).push(item);
    });
    return Array.from(map.entries());
  }

  function kategoriSec(kategoriAdi) {
    seciliKategori = seciliKategori === kategoriAdi ? null : kategoriAdi;
    renderPanel();
    renderContent();
  }

  function clearSearch() {
    query = '';
    searchInput.value = '';
    renderTemizle();
    renderPanel();
    renderContent();
  }

  function renderTemizle() {
    if (query && !temizleBtn) {
      temizleBtn = document.createElement('button');
      temizleBtn.type = 'button';
      temizleBtn.style.cssText =
        'padding: 0 18px; height: 40px; border-radius: 10px; border: 0.5px solid rgba(0,0,0,0.18); background: transparent; color: #333; font-size: 14px;';
      temizleBtn.textContent = 'Temizle';
      temizleBtn.addEventListener('click', clearSearch);
      toolbar.insertBefore(temizleBtn, kategorilerWrap);
    } else if (!query && temizleBtn) {
      temizleBtn.remove();
      temizleBtn = null;
    }
  }

  function kategoriSatir(label, count, secili, borderTopNone, onClick) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'yl-kategori-satir' + (secili ? ' acik' : '');
    btn.setAttribute('aria-pressed', String(secili));
    if (borderTopNone) btn.style.borderTop = 'none';
    btn.innerHTML =
      '<span>' + Portal.escapeHtml(label) + '</span>' +
      '<span class="yl-kategori-sag">' +
        '<span class="yl-kategori-badge">' + count + '</span>' +
        '<i class="fas fa-chevron-right yl-kategori-chevron" aria-hidden="true"></i>' +
      '</span>';
    btn.addEventListener('click', onClick);
    return btn;
  }

  function renderPanel() {
    kategorilerBtn.setAttribute('aria-expanded', String(kategorilerPaneliAcik));
    kategorilerIcon.className = kategorilerPaneliAcik ? 'fas fa-xmark' : 'fas fa-bars';
    if (panelEl) {
      panelEl.remove();
      panelEl = null;
    }
    if (!kategorilerPaneliAcik) return;

    var filtered = filtrele();
    var gruplanmis = grupla(filtered);

    panelEl = document.createElement('div');
    panelEl.className = 'yl-kategoriler-panel';
    panelEl.style.cssText =
      'position: absolute; top: 46px; right: 0px; width: 260px; z-index: 20; box-shadow: 0 10px 24px rgba(0,0,0,0.12);';

    panelEl.appendChild(
      kategoriSatir('Tümü', filtered.length, !seciliKategori, true, function () {
        seciliKategori = null;
        renderPanel();
        renderContent();
      })
    );
    gruplanmis.forEach(function (grup) {
      var kategoriAdi = grup[0];
      var kategoriLinkleri = grup[1];
      var secili = seciliKategori === kategoriAdi;
      panelEl.appendChild(
        kategoriSatir(kategoriAdi, kategoriLinkleri.length, secili, false, function () {
          kategoriSec(kategoriAdi);
        })
      );
    });

    kategorilerWrap.appendChild(panelEl);
  }

  function renderContent() {
    while (toolbar.nextSibling) toolbar.nextSibling.remove();

    if (loading) {
      page.insertAdjacentHTML(
        'beforeend',
        '<div class="protokoller-state" role="status">' +
          '<span class="protokoller-state__pulse" aria-hidden="true"></span>' +
          'Yardımcı linkler yükleniyor…' +
        '</div>'
      );
      return;
    }
    if (error) {
      page.insertAdjacentHTML(
        'beforeend',
        '<p class="protokoller-state protokoller-state--error">' + Portal.escapeHtml(error) + '</p>'
      );
      return;
    }

    var filtered = filtrele();
    var gruplanmis = grupla(filtered);

    if (filtered.length === 0) {
      page.insertAdjacentHTML(
        'beforeend',
        '<div class="protokoller-empty">' +
          '<i class="fas fa-link" aria-hidden="true"></i>' +
          '<h2>Sonuç bulunamadı</h2>' +
          '<p>Aramanızı değiştirerek tekrar deneyebilirsiniz.</p>' +
        '</div>'
      );
      return;
    }

    var html = '<div style="display: flex; flex-direction: column; gap: 20px;">';
    gruplanmis
      .filter(function (grup) {
        return !seciliKategori || seciliKategori === grup[0];
      })
      .forEach(function (grup) {
        var kategoriAdi = grup[0];
        var kategoriLinkleri = grup[1];
        html +=
          '<div class="yl-section">' +
            '<div class="yl-section-head">' +
              '<span class="yl-section-icon">' +
                '<i class="fas fa-link" aria-hidden="true"></i>' +
              '</span>' +
              '<div>' +
                '<p class="yl-section-title">' + Portal.escapeHtml(kategoriAdi) + '</p>' +
                '<p class="yl-section-sub">Sık kullanılan bağlantılar</p>' +
              '</div>' +
              '<span class="yl-section-badge">' + kategoriLinkleri.length + ' Bağlantı</span>' +
            '</div>' +
            '<div class="yl-section-body">' +
              '<div style="display: grid; grid-template-columns: repeat(8, minmax(0, 210px)); gap: 16px; padding-top: 18px;">';
        kategoriLinkleri.forEach(function (item) {
          html +=
            '<a href="' + Portal.escapeHtml(item.hedef_url) + '" target="_blank" rel="noopener noreferrer" class="yl-card">' +
              '<span class="yl-card-ext">' +
                '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>' +
              '</span>' +
              '<div class="yl-card-logo">' +
                (item.logo_url
                  ? '<img src="' + Portal.escapeHtml(Portal.asset(item.logo_url)) + '" alt="" />'
                  : '<i class="fas fa-link" style="font-size: 22px; color: ' + BLUE + ';" aria-hidden="true"></i>') +
              '</div>' +
              '<p class="yl-card-title">' + Portal.escapeHtml(item.baslik) + '</p>' +
            '</a>';
        });
        html += '</div></div></div>';
      });
    html += '</div>';
    page.insertAdjacentHTML('beforeend', html);

    /* img onError -> gizle */
    page.querySelectorAll('.yl-card-logo img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
      });
    });
  }

  function init() {
    page = document.querySelector('.etkinlikler-page');
    toolbar = page.children[1];
    searchInput = toolbar.querySelector('input[type="search"]');
    kategorilerWrap = toolbar.children[toolbar.children.length - 1];
    kategorilerBtn = kategorilerWrap.querySelector('button');
    kategorilerIcon = kategorilerBtn.querySelector('i');

    searchInput.addEventListener('input', function (e) {
      query = e.target.value;
      renderTemizle();
      renderPanel();
      renderContent();
    });

    kategorilerBtn.addEventListener('click', function () {
      kategorilerPaneliAcik = !kategorilerPaneliAcik;
      renderPanel();
    });

    renderContent();

    Api.fetchYardimciLinkler()
      .then(function (data) {
        items = (data && data.linkler != null) ? data.linkler : [];
        error = null;
      })
      .catch(function () {
        error = 'Yardımcı linkler yüklenirken bir sorun oluştu.';
      })
      .finally(function () {
        loading = false;
        renderPanel();
        renderContent();
      });
  }

  Portal.onReady(init);
})();