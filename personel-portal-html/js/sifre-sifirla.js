/*
 * Şifremi unuttum — React frontend/src/pages/auth/ForgotPassword.jsx portu.
 * Orijinal sifre_unuttum.php.
 */
(function () {
  'use strict';

  function init() {
    var form = document.getElementById('reset-form');
    var alertBox = document.getElementById('reset-alert');
    var successBox = document.getElementById('reset-success');
    var tcInput = document.getElementById('tc_no');
    var tcError = document.getElementById('tc-no-error');
    var telInput = document.getElementById('telefon');
    var telError = document.getElementById('telefon-error');
    var submitBtn = document.getElementById('reset-submit');

    var loading = false;

    function digitsOnly(value) {
      return String(value).replace(/\D/g, '');
    }

    /* React onChange: digitsOnly(value).slice(0, 11) */
    function bindDigitFilter(input) {
      input.addEventListener('input', function () {
        var next = digitsOnly(input.value).slice(0, 11);
        if (input.value !== next) input.value = next;
      });
    }

    bindDigitFilter(tcInput);
    bindDigitFilter(telInput);

    function setError(message) {
      alertBox.textContent = message || '';
      alertBox.classList.toggle('is-visible', Boolean(message));
    }

    function setSuccess(message) {
      successBox.textContent = message || '';
      successBox.classList.toggle('is-visible', Boolean(message));
    }

    function renderLoading() {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? 'GÖNDERİLİYOR...' : 'Şifre Sıfırla';
    }

    function validate() {
      var tc = digitsOnly(tcInput.value);
      var tel = digitsOnly(telInput.value);
      var tcInvalid = tc.length !== 11;
      var telInvalid = tel.length !== 11 || tel.indexOf('05') !== 0;
      tcInput.classList.toggle('is-invalid', tcInvalid);
      tcError.classList.toggle('is-visible', tcInvalid);
      telInput.classList.toggle('is-invalid', telInvalid);
      telError.classList.toggle('is-visible', telInvalid);
      return !tcInvalid && !telInvalid;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      setError('');
      setSuccess('');
      if (!validate()) return;

      loading = true;
      renderLoading();
      try {
        var data = await Api.forgotPassword({
          tc_no: digitsOnly(tcInput.value),
          telefon: digitsOnly(telInput.value),
        });
        setSuccess(
          data.message ||
            'Şifreniz sıfırlandı. Yeni şifreniz kayıtlı iletişim bilgilerinize gönderildi.'
        );
      } catch (err) {
        setError((err && err.message) || 'İşlem başarısız.');
      } finally {
        loading = false;
        renderLoading();
      }
    });
  }

  Portal.onReady(init);
})();
