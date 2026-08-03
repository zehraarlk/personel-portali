/*
 * Duyuru formu — React admin/src/pages/duyurular/DuyurularPages.jsx
 * (DuyuruForm + DuyurularEkle + DuyurularDuzenle) birebir karşılığı.
 * duyurular-ekle.html ve duyurular-duzenle.html tarafından paylaşılır.
 */
(function () {
  'use strict';

  var mode = Portal.route() === '/admin/duyurular/duzenle' ? 'edit' : 'create';
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
      aciklama: fields.aciklama.value,
      resim_url: picker.getValue() || null,
      tarih: fields.tarih.value || null,
      sayfa_tipi: 'duyuru',
    };
    setBusy(true);
    clearAlert('danger');
    clearAlert('success');
    try {
      if (mode === 'edit') {
        await AdminApi.updateDuyuru(recordId, payload);
        showAlert('success', 'Kayıt başarıyla güncellendi.');
      } else {
        await AdminApi.createDuyuru(payload);
        AdminConfig.goto('/admin/duyurular');
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
      '<h2><i class="fas fa-bullhorn" aria-hidden="true"></i>' +
      (mode === 'edit' ? 'Duyuru düzenle' : 'Yeni duyuru') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/duyurular') + '" class="admin-btn admin-btn-secondary">' +
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
      '<label>Açıklama<textarea rows="7"></textarea></label>' +
      '<label>Tarih<input type="date" /></label>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/duyurular') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    cardBody = content.querySelector('.admin-card-body');
    formEl = content.querySelector('form');
    submitBtn = formEl.querySelector('button[type="submit"]');

    var labels = formEl.querySelectorAll('.admin-form__main label');
    fields.baslik = labels[0].querySelector('input');
    fields.aciklama = labels[1].querySelector('textarea');
    fields.tarih = labels[2].querySelector('input');

    fields.baslik.value = (initial && initial.baslik) || '';
    fields.aciklama.value = (initial && initial.aciklama) || '';
    fields.tarih.value = (initial && initial.tarih) || '';

    picker = AdminWidgets.imagePickerField({
      value: (initial && initial.resim_url) || '',
      label: 'Resim',
    });
    formEl.querySelector('.admin-form__side').appendChild(picker.el);

    if (err) {
      showAlert('danger', err);
      err = '';
    }

    formEl.addEventListener('submit', onSubmit);
  }

  function init() {
    if (mode === 'edit') {
      AdminApi.getDuyuru(recordId)
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
