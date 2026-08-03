/*
 * Etkinlik formu — React admin/src/pages/etkinlikler/EtkinliklerPages.jsx
 * (EtkinlikForm + EtkinliklerEkle + EtkinliklerDuzenle) birebir karşılığı.
 * etkinlikler-ekle.html ve etkinlikler-duzenle.html tarafından paylaşılır.
 */
(function () {
  'use strict';

  var mode = Portal.route() === '/admin/etkinlikler/duzenle' ? 'edit' : 'create';
  var recordId = Portal.param('id');

  var initial = null;
  var err = '';

  var cardBody = null;
  var formEl = null;
  var submitBtn = null;
  var picker = null;
  var fields = {};

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
    /* React sırası: success alert, danger alert, form */
    if (kind === 'success') cardBody.insertBefore(el, alerts.danger || formEl);
    else cardBody.insertBefore(el, formEl);
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? 'Kaydediliyor…' : 'Kaydet';
  }

  async function onSubmit(e) {
    e.preventDefault();
    var payload = {
      baslik: fields.baslik.value,
      aciklama: fields.aciklama.value || null,
      tarih: fields.tarih.value,
      bitis_tarihi: fields.bitis.value || null,
      resim: picker.getValue() || null,
      durum: fields.durum.value,
      view: Number(fields.view.value) || 0,
    };
    setBusy(true);
    clearAlert('danger');
    clearAlert('success');
    try {
      if (mode === 'edit') {
        await AdminApi.updateEtkinlik(recordId, payload);
        showAlert('success', 'Kayıt başarıyla güncellendi.');
      } else {
        await AdminApi.createEtkinlik(payload);
        AdminConfig.goto('/admin/etkinlikler');
      }
    } catch (ex) {
      showAlert('danger', ex.message);
    } finally {
      setBusy(false);
    }
  }

  function renderForm() {
    var content = AdminLayout.content;
    content.innerHTML =
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-calendar-check" aria-hidden="true"></i>' +
      (mode === 'edit' ? 'Etkinlik düzenle' : 'Yeni etkinlik') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/etkinlikler') + '" class="admin-btn admin-btn-secondary">' +
      '<i class="fas fa-arrow-left" aria-hidden="true"></i> Listeye dön' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-crud-form-shell">' +
      '<div class="admin-card">' +
      '<div class="admin-card-body">' +
      '<form class="admin-form admin-form--grid">' +
      '<div class="admin-form__main">' +
      '<label>Başlık<input required /></label>' +
      '<label>Açıklama<textarea rows="6"></textarea></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Başlangıç tarihi<input type="date" required /></label>' +
      '<label>Bitiş tarihi<input type="date" /></label>' +
      '</div>' +
      '</div>' +
      '<div class="admin-form__side">' +
      '<div class="admin-form__row-2">' +
      '<label>Durum' +
      '<select>' +
      '<option value="aktif">Aktif</option>' +
      '<option value="pasif">Pasif</option>' +
      '</select>' +
      '</label>' +
      '<label>Görüntülenme<input type="number" min="0" /></label>' +
      '</div>' +
      '</div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/etkinlikler') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    cardBody = content.querySelector('.admin-card-body');
    formEl = content.querySelector('form');
    submitBtn = formEl.querySelector('button[type="submit"]');

    var mainLabels = formEl.querySelectorAll('.admin-form__main label');
    fields.baslik = mainLabels[0].querySelector('input');
    fields.aciklama = mainLabels[1].querySelector('textarea');
    fields.tarih = mainLabels[2].querySelector('input');
    fields.bitis = mainLabels[3].querySelector('input');

    var side = formEl.querySelector('.admin-form__side');
    fields.durum = side.querySelector('select');
    fields.view = side.querySelector('input[type="number"]');

    fields.baslik.value = (initial && initial.baslik) || '';
    fields.aciklama.value = (initial && initial.aciklama) || '';
    fields.tarih.value = (initial && initial.tarih) || '';
    fields.bitis.value = (initial && initial.bitis_tarihi) || '';
    fields.durum.value = (initial && initial.durum) || 'aktif';
    fields.view.value = initial && initial.view != null ? initial.view : 0;

    picker = AdminWidgets.imagePickerField({
      value: (initial && initial.resim) || '',
      label: 'Resim',
    });
    /* React'ta ImagePickerField, side içindeki row-2'nin ÜSTÜNDE render edilir */
    side.insertBefore(picker.el, side.firstChild);

    if (err) {
      showAlert('danger', err);
      err = '';
    }

    formEl.addEventListener('submit', onSubmit);
  }

  function init() {
    if (mode === 'edit') {
      AdminApi.getEtkinlik(recordId)
        .then(function (data) {
          initial = data;
        })
        .catch(function (ex) {
          err = ex.message;
        })
        .finally(renderForm);
    } else {
      renderForm();
    }
  }

  Portal.onReady(init);
})();
