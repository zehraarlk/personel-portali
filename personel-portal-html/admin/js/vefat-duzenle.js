/*
 * Vefat kaydı düzenle — React admin/src/pages/vefat/VefatPages.jsx
 * (VefatDuzenle + VefatForm mode="edit") birebir karşılığı.
 * Kayıt id'si: Portal.param('id') (React useParams().id).
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

  var FORM_HTML =
    '<div class="admin-module">' +
    '<header class="admin-page-head">' +
    '<div class="admin-page-head__text">' +
    '<h2><i class="fas fa-ribbon" aria-hidden="true"></i>Vefat kaydı düzenle</h2>' +
    '</div>' +
    '<div class="admin-page-head__actions">' +
    '<a href="vefat.html" class="admin-btn admin-btn-secondary">' +
    '<i class="fas fa-arrow-left" aria-hidden="true"></i> Listeye dön' +
    '</a>' +
    '</div>' +
    '</header>' +
    '<div class="admin-crud-form-shell">' +
    '<div class="admin-card">' +
    '<div class="admin-card-body">' +
    '<form class="admin-form admin-form--vefat">' +
    '<label>Vefat eden adı *<input required /></label>' +
    '<label>İlişki / pozisyon<input /></label>' +
    '<div class="admin-form__row-2">' +
    '<label>Vefat tarihi *<input type="date" required /></label>' +
    '<label>Tarih metni<input placeholder="örn: 21 Aralık 2024" maxlength="50" /></label>' +
    '</div>' +
    '<label>Cenaze mesajı *<textarea rows="5" required></textarea></label>' +
    '<div class="admin-form__actions">' +
    '<button type="submit" class="admin-btn admin-btn-primary">Güncelle</button>' +
    '<a href="vefat.html" class="admin-btn admin-btn-secondary">İptal</a>' +
    '</div>' +
    '</form>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  function init() {
    var content = AdminLayout.content;
    var id = Portal.param('id');
    var initialData = null;

    function buildForm(initial, loadErr) {
      content.innerHTML = FORM_HTML;

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

      function applyInitial(data) {
        adiInput.value = (data && data.vefat_eden_adi) || '';
        iliskiInput.value = (data && data.iliski_pozisyon) || '';
        tarihInput.value = (data && data.vefat_tarihi) || '';
        tarihMetinInput.value = (data && data.vefat_tarihi_metin) || '';
        tarihMetinTouched = Boolean(data && data.vefat_tarihi_metin);
        mesajInput.value = (data && data.cenaze_mesaji) || '';
      }

      applyInitial(initial);

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
            /* React: err '' olur; initial hâlâ null ise "Yükleniyor…" görünür */
            if (kind === 'danger' && !initialData) {
              content.innerHTML = '<p class="admin-muted">Yükleniyor…</p>';
            }
          },
        });
        alerts[kind] = el;
        cardBody.insertBefore(el, form);
      }

      function setBusy(busy) {
        submitBtn.disabled = busy;
        submitBtn.textContent = busy ? 'Kaydediliyor…' : 'Güncelle';
      }

      if (loadErr) showAlert('danger', loadErr);

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
        clearAlert('success');
        AdminApi.updateVefat(id, payload)
          .then(function (updated) {
            initialData = updated;
            applyInitial(updated);
            showAlert('success', 'Kayıt başarıyla güncellendi.');
          })
          .catch(function (ex) {
            showAlert('danger', ex.message);
          })
          .finally(function () {
            setBusy(false);
          });
      });
    }

    AdminApi.getVefat(id)
      .then(function (data) {
        initialData = data;
        buildForm(data, '');
      })
      .catch(function (ex) {
        /* React: !initial && err → form yine render edilir (boş) + danger alert */
        buildForm(null, ex.message);
      });
  }

  Portal.onReady(init);
})();
