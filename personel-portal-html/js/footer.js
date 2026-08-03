/*
 * Site footer — React frontend/src/components/Footer.jsx birebir karşılığı.
 * Sayfada <div id="site-footer"></div> yer tutucusunu <footer class="site-footer"> ile değiştirir.
 */
(function () {
  'use strict';

  var esc = Portal.escapeHtml;

  var CONTACT = {
    address: 'Gebze Belediyesi, Hacı Halil Mah. İbni Sina Cad. No:2, 41400 Gebze/Kocaeli',
    phone: '0262 642 04 30',
    email: 'gebze@gebze.bel.tr',
  };

  var CONTACT_ITEMS = [
    { key: 'address', iconKey: 'adres', value: CONTACT.address, label: 'Adres' },
    { key: 'phone', iconKey: 'telefon', value: CONTACT.phone, label: 'Telefon' },
    { key: 'email', iconKey: 'eposta', value: CONTACT.email, label: 'E-posta' },
  ];

  var SOCIAL_LINKS = [
    { label: 'Facebook', iconKey: 'facebook', href: 'https://www.facebook.com/gebzebelediye' },
    { label: 'X (Twitter)', iconKey: 'twitter', href: 'https://x.com/gebze_belediye' },
    { label: 'Instagram', iconKey: 'instagram', href: 'https://www.instagram.com/gebze_belediyesi' },
    { label: 'YouTube', iconKey: 'youtube', href: 'https://www.youtube.com/channel/UCj2OaUgzp76dOS2jTlz2frg' },
  ];

  var QUICK_LINKS = [
    { to: '/', label: 'Anasayfa' },
    { to: '/duyurular', label: 'Duyurular' },
    { to: '/etkinlikler', label: 'Etkinlikler' },
    { to: '/videolar', label: 'Videolar' },
  ];

  var RESOURCE_LINKS = [
    { to: '/dokumanlar', label: 'Dokümanlar' },
    { to: '/mevzuatlar', label: 'Mevzuatlar' },
    { to: '/protokoller', label: 'Protokoller' },
    { to: '/egitimler', label: 'Eğitimler' },
  ];

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    var input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return Promise.resolve();
  }

  var copiedTimer = null;

  function render(footer) {
    var year = new Date().getFullYear();
    var icon = SiteIcons.icon;

    var socialHtml = SOCIAL_LINKS.map(function (s) {
      return (
        '<a href="' + esc(s.href) + '" target="_blank" rel="noreferrer" class="site-footer-social-link" aria-label="' + esc(s.label) + '">' +
        '<i class="' + icon(s.iconKey) + '" aria-hidden="true"></i>' +
        '</a>'
      );
    }).join('');

    var quickHtml = QUICK_LINKS.map(function (item) {
      return '<a href="' + Portal.href(item.to) + '" class="site-footer-link">' + esc(item.label) + '</a>';
    }).join('');

    var resourceHtml = RESOURCE_LINKS.map(function (item) {
      return '<a href="' + Portal.href(item.to) + '" class="site-footer-link">' + esc(item.label) + '</a>';
    }).join('');

    var contactHtml = CONTACT_ITEMS.map(function (item) {
      var iconCls = icon(item.iconKey, item.key === 'address' ? 'fas fa-location-dot' : undefined);
      return (
        '<button type="button" class="site-footer-contact-item" data-copy-key="' + esc(item.key) + '" data-copy-value="' + esc(item.value) + '"' +
        ' title="' + esc(item.label) + ' kopyala" aria-label="' + esc(item.label) + ': ' + esc(item.value) + '. Kopyalamak için tıklayın.">' +
        '<i class="' + iconCls + ' site-footer-contact-icon" aria-hidden="true"></i>' +
        '<span>' + esc(item.value) + '</span>' +
        '</button>'
      );
    }).join('');

    footer.innerHTML =
      '<div class="site-footer-inner">' +
      '<div class="site-footer-grid">' +
      '<div class="site-footer-brand-col">' +
      '<img src="' + esc(Portal.SITE_LOGO_WHITE) + '" alt="Gebze Belediyesi" class="site-footer-logo">' +
      '<p class="site-footer-tagline">Gebze Belediyesi Personel Portalı; duyurular, etkinlikler ve kurum içi kaynaklara tek noktadan erişim sağlar.</p>' +
      '<div class="site-footer-social">' + socialHtml + '</div>' +
      '</div>' +
      '<div class="site-footer-links-row">' +
      '<div>' +
      '<h3 class="site-footer-col-title">Hızlı Erişim</h3>' +
      '<nav class="site-footer-list">' + quickHtml + '</nav>' +
      '</div>' +
      '<div>' +
      '<h3 class="site-footer-col-title">Kaynaklar</h3>' +
      '<nav class="site-footer-list">' + resourceHtml + '</nav>' +
      '</div>' +
      '</div>' +
      '<div>' +
      '<h3 class="site-footer-col-title">İletişim</h3>' +
      '<div>' + contactHtml + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="site-footer-bottom">' +
      '<span>© ' + year + ' Gebze Belediyesi Personel Portalı — Tüm hakları saklıdır.</span>' +
      '<div class="site-footer-bottom-links">' +
      '<a href="' + Portal.href('/gizlilik-politikasi') + '" class="site-footer-bottom-link">Gizlilik Politikası</a>' +
      '<a href="' + Portal.href('/kullanim-kosullari') + '" class="site-footer-bottom-link">Kullanım Koşulları</a>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function init() {
    var placeholder = document.getElementById('site-footer');
    if (!placeholder) return;

    var footer = document.createElement('footer');
    footer.className = 'site-footer';
    placeholder.replaceWith(footer);

    render(footer);

    footer.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-copy-key]');
      if (!btn || !footer.contains(btn)) return;

      var value = btn.getAttribute('data-copy-value');
      Promise.resolve(copyText(value))
        .then(function () {
          footer.querySelectorAll('.site-footer-contact-item.is-copied').forEach(function (el) {
            el.classList.remove('is-copied');
          });
          btn.classList.add('is-copied');
          if (copiedTimer) clearTimeout(copiedTimer);
          copiedTimer = setTimeout(function () {
            btn.classList.remove('is-copied');
          }, 1500);
        })
        .catch(function () {
          btn.classList.remove('is-copied');
        });
    });

    /* İkonlar DB'den gelince yeniden boya */
    SiteIcons.load().then(function () {
      render(footer);
    });
  }

  window.SiteFooter = { init: init };

  Portal.onReady(init);
})();
