/*
 * Şifre değiştir — React admin/src/pages/ChangePassword.jsx birebir karşılığı.
 */
(function () {
  'use strict';

  function init() {
    var content = AdminLayout.content;
    var card = content.querySelector('.admin-card');
    var form = document.getElementById('change-password-form');
    var mevcut = form.elements.mevcut;
    var yeni = form.elements.yeni;
    var tekrar = form.elements.tekrar;
    var submitBtn = form.querySelector('button[type="submit"]');

    var alerts = { success: null, danger: null };

    function clearAlert(kind) {
      if (alerts[kind]) {
        alerts[kind].dismiss();
        alerts[kind] = null;
      }
    }

    function showAlert(kind, text) {
      clearAlert(kind);
      var el = AdminWidgets.alert({
        type: kind,
        text: text,
        onClose: function () {
          alerts[kind] = null;
        },
      });
      alerts[kind] = el;
      content.insertBefore(el, card);
    }

    var busy = false;

    function setBusy(next) {
      busy = next;
      submitBtn.disabled = busy;
      submitBtn.textContent = busy ? 'Kaydediliyor…' : 'Güncelle';
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearAlert('success');
      clearAlert('danger');
      setBusy(true);
      try {
        var res = await AdminApi.changePassword({
          mevcut_sifre: mevcut.value,
          yeni_sifre: yeni.value,
          yeni_sifre_tekrar: tekrar.value,
        });
        showAlert('success', res.message || 'Şifre başarıyla güncellendi.');
        mevcut.value = '';
        yeni.value = '';
        tekrar.value = '';
      } catch (ex) {
        showAlert('danger', ex.message);
      } finally {
        setBusy(false);
      }
    });
  }

  Portal.onReady(init);
})();
