/*
 * Yeni vefat kaydı — React admin/src/pages/vefat/VefatPages.jsx
 * (VefatEkle + VefatForm mode="create") birebir karşılığı.
 * Form iskeleti HTML'de statiktir; bu dosya davranışı bağlar.
 */
(function () {
  'use strict';

  var TR_MONTHS = [
    '',
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];

  function buildTarihMetin(isoDate) {
    if (!isoDate) return '';
    var m = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    var y = Number(m[1]);
    var mo = Number(m[2]);
    var d = Number(m[3]);
    if (!mo || mo > 12) return '';
    return d + ' ' + TR_MONTHS[mo] + ' ' + y;
  }

  function init() {
    var content = AdminLayout.content;
    var cardBody = content.querySelector('.admin-card-body');
    var form = content.querySelector('form.admin-form--vefat');
    var fields = form.querySelectorAll('input, textarea');
    var adiInput = fields[0];
    var iliskiInput = fields[1];
    var tarihInput = fields[2];
    var tarihMetinInput = fields[3];
    var mesajInput = fields[4];
    var submitBtn = form.querySelector('button[type="submit"]');

    var tarihMetinTouched = false;

    tarihInput.addEventListener('input', function () {
      if (!tarihMetinTouched) tarihMetinInput.value = buildTarihMetin(tarihInput.value);
    });
    tarihMetinInput.addEventListener('input', function () {
      tarihMetinTouched = true;
    });

    var alerts = { success: null, danger: null };

    function clearAlert(kind) {
      if (alerts[kind]) alerts[kind].dismiss();
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
      cardBody.insertBefore(el, form);
    }

    function setBusy(busy) {
      submitBtn.disabled = busy;
      submitBtn.textContent = busy ? 'Kaydediliyor…' : 'Kaydet';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAlert('danger');
      if (!adiInput.value.trim() || !tarihInput.value || !mesajInput.value.trim()) {
        showAlert('danger', 'Vefat eden adı, tarih ve cenaze mesajı zorunludur.');
        return;
      }
      var payload = {
        vefat_eden_adi: adiInput.value.trim(),
        iliski_pozisyon: iliskiInput.value.trim(),
        vefat_tarihi: tarihInput.value,
        vefat_tarihi_metin: (tarihMetinInput.value || buildTarihMetin(tarihInput.value)).trim(),
        cenaze_mesaji: mesajInput.value.trim(),
      };
      setBusy(true);
      AdminApi.createVefat(payload)
        .then(function () {
          AdminConfig.goto('/admin/vefat');
        })
        .catch(function (ex) {
          showAlert('danger', ex.message);
        })
        .finally(function () {
          setBusy(false);
        });
    });
  }

  Portal.onReady(init);
})();
