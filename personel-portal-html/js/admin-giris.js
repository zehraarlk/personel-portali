/*
 * Yönetici giriş — React frontend/src/pages/auth/AdminLogin.jsx portu.
 * Orijinal yonetim_giris.php.
 */
(function () {
  'use strict';

  function init() {
    /* React: useEffect — zaten girişli yöneticiyi panele yönlendir */
    if (Session.getYoneticiId()) {
      Portal.replace('/admin');
      return;
    }

    var form = document.getElementById('login-form');
    var alertBox = document.getElementById('login-alert');
    var kullaniciInput = document.getElementById('kullanici_adi');
    var kullaniciError = document.getElementById('kullanici-adi-error');
    var sifreInput = document.getElementById('password');
    var sifreError = document.getElementById('sifre-error');
    var toggleBtn = document.getElementById('password-toggle');
    var toggleIcon = document.getElementById('password-toggle-icon');
    var submitBtn = document.getElementById('login-submit');

    var show = false;
    var loading = false;

    /* PasswordField.jsx — şifre göster/gizle */
    function renderToggle() {
      sifreInput.type = show ? 'text' : 'password';
      toggleBtn.setAttribute('aria-label', show ? 'Şifreyi gizle' : 'Şifreyi göster');
      toggleIcon.className = SiteIcons.icon(show ? 'sifre_gizle_bi' : 'sifre_goster_bi');
    }

    toggleBtn.addEventListener('click', function () {
      show = !show;
      renderToggle();
    });

    /* useSiteIcons — ikon haritası gelince yeniden boya */
    SiteIcons.load().then(renderToggle);

    function setError(message) {
      alertBox.textContent = message || '';
      alertBox.classList.toggle('is-visible', Boolean(message));
    }

    function renderLoading() {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP';
    }

    function validate() {
      var kullaniciInvalid = !kullaniciInput.value.trim();
      var sifreInvalid = !sifreInput.value.trim();
      kullaniciInput.classList.toggle('is-invalid', kullaniciInvalid);
      kullaniciError.classList.toggle('is-visible', kullaniciInvalid);
      sifreInput.classList.toggle('is-invalid', sifreInvalid);
      sifreError.classList.toggle('is-visible', sifreInvalid);
      return !kullaniciInvalid && !sifreInvalid;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      setError('');
      if (!validate()) return;

      loading = true;
      renderLoading();
      try {
        var data = await Api.loginAdmin({
          kullanici_adi: kullaniciInput.value.trim(),
          sifre: sifreInput.value,
        });
        if (data && data.yonetici && data.yonetici.id) {
          Session.clearPendingSessionClose();
          Session.setPersonelId('');
          Session.setOturumId('');
          Session.setYoneticiId(data.yonetici.id);
          Session.setYoneticiOturumId(data.oturum_id || '');
          Session.setProfileCache(data.yonetici);
        }
        /* React: navigate('/admin', { replace: true }) */
        Portal.replace('/admin');
      } catch (err) {
        setError((err && err.message) || 'Kullanıcı adı veya şifre hatalı!');
      } finally {
        loading = false;
        renderLoading();
      }
    });
  }

  Portal.onReady(init);
})();
