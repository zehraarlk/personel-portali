/*
 * Şifre değiştir — React frontend/src/pages/ChangePassword.jsx portu.
 */
(function () {
  'use strict';

  function init() {
    var form = document.getElementById('sifre-form');
    var mevcutInput = document.getElementById('mevcut-sifre');
    var yeniInput = document.getElementById('yeni-sifre');
    var tekrarInput = document.getElementById('yeni-sifre-tekrar');
    var errBox = document.getElementById('form-err');
    var msgBox = document.getElementById('form-msg');
    var submitBtn = document.getElementById('sifre-submit');

    var busy = false;

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
        (busy ? 'Kaydediliyor…' : 'Şifreyi Güncelle');
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      setMsg('');
      setErr('');
      busy = true;
      renderBusy();
      try {
        var res = await Api.changePassword({
          mevcut_sifre: mevcutInput.value,
          yeni_sifre: yeniInput.value,
          yeni_sifre_tekrar: tekrarInput.value,
        });
        setMsg(res.message || 'Şifre güncellendi.');
        mevcutInput.value = '';
        yeniInput.value = '';
        tekrarInput.value = '';
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
