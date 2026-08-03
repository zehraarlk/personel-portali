/*
 * Personel giriş — React frontend/src/pages/auth/Login.jsx portu.
 * Orijinal login.php mantığı (yalnızca personel).
 */
(function () {
  'use strict';

  function init() {
    /* React: useEffect — zaten girişli kullanıcıyı ana sayfaya yönlendir */
    if (Session.getPersonelId() || Session.getYoneticiId()) {
      Portal.replace('/');
      return;
    }

    var form = document.getElementById('login-form');
    var alertBox = document.getElementById('login-alert');
    var sicilInput = document.getElementById('sicil_no');
    var sicilError = document.getElementById('sicil-no-error');
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
      submitBtn.textContent = loading ? 'GİRİŞ YAPILIYOR...' : 'Giriş Yap';
    }

    function validate() {
      var sicilInvalid = !sicilInput.value.trim();
      var sifreInvalid = !sifreInput.value.trim();
      sicilInput.classList.toggle('is-invalid', sicilInvalid);
      sicilError.classList.toggle('is-visible', sicilInvalid);
      sifreInput.classList.toggle('is-invalid', sifreInvalid);
      sifreError.classList.toggle('is-visible', sifreInvalid);
      return !sicilInvalid && !sifreInvalid;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      setError('');
      if (!validate()) return;

      loading = true;
      renderLoading();
      try {
        var data = await Api.loginPersonel({
          sicil_no: sicilInput.value.trim(),
          sifre: sifreInput.value.trim(),
        });
        if (data && data.personel && data.personel.id) {
          Session.clearPendingSessionClose();
          Session.setYoneticiId('');
          Session.setPersonelId(data.personel.id);
          Session.setOturumId(data.oturum_id || '');
          Session.setProfileCache(data.personel);
        }
        /* React: navigate('/', { replace: true }) — statikte ?from= desteğiyle */
        var from = Portal.param('from');
        if (from) {
          Portal.replace(from);
        } else {
          Portal.replace('/');
        }
      } catch (err) {
        setError((err && err.message) || 'Sicil numarası veya şifre hatalı!');
      } finally {
        loading = false;
        renderLoading();
      }
    });
  }

  Portal.onReady(init);
})();
