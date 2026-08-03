/*
 * E-posta değiştir — React frontend/src/pages/ChangeEmail.jsx portu.
 */
(function () {
  'use strict';

  function init() {
    var form = document.getElementById('email-form');
    var currentEl = document.getElementById('mevcut-email');
    var yeniInput = document.getElementById('yeni-email');
    var sifreInput = document.getElementById('email-sifre');
    var errBox = document.getElementById('form-err');
    var msgBox = document.getElementById('form-msg');
    var submitBtn = document.getElementById('email-submit');

    var busy = false;

    function setCurrent(value) {
      currentEl.textContent = value || '—';
    }

    function setErr(message) {
      errBox.textContent = message || '';
      errBox.hidden = !message;
    }

    function setMsg(message) {
      msgBox.textContent = message || '';
      msgBox.hidden = !message;
    }

    function renderBusy() {
      submitBtn.disabled = busy;
      submitBtn.innerHTML =
        '<i class="fas fa-save" aria-hidden="true"></i>' +
        (busy ? 'Kaydediliyor…' : 'E-postayı Güncelle');
    }

    /* React: useEffect — mevcut e-postayı getir */
    Api.fetchProfile()
      .then(function (p) {
        setCurrent(p.email || '');
        yeniInput.value = p.email || '';
      })
      .catch(function () {});

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      setMsg('');
      setErr('');
      busy = true;
      renderBusy();
      try {
        var res = await Api.changeEmail({
          yeni_email: yeniInput.value,
          sifre: sifreInput.value,
        });
        setCurrent((res.personel && res.personel.email) || yeniInput.value);
        setMsg('E-posta güncellendi.');
        sifreInput.value = '';
      } catch (ex) {
        setErr(ex && ex.message);
      } finally {
        busy = false;
        renderBusy();
      }
    });
  }

  Portal.onReady(init);
})();
