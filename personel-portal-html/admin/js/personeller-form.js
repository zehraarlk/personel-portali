/*
 * Personel formu — React admin/src/pages/yonetim/YonetimPages.jsx
 * (PersonelForm + PersonellerEkle + PersonellerDuzenle) birebir karşılığı.
 * personeller-ekle.html ve personeller-duzenle.html paylaşır.
 */
(function () {
  'use strict';

  var mode = Portal.route() === '/admin/personeller/ekle' ? 'create' : 'edit';
  var recordId = Portal.param('id');

  var initial = null;
  var busy = false;
  var fieldErrors = {};

  var cardBody = null;
  var form = null;
  var fields = {};
  var picker = null;
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
    cardBody.insertBefore(el, form);
  }

  function setBusy(next) {
    busy = next;
    var btn = form.querySelector('.admin-form__actions button[type="submit"]');
    btn.disabled = busy;
    btn.textContent = busy ? 'Kaydediliyor…' : 'Kaydet';
  }

  /* FieldError bileşeni karşılığı: label class + admin-field-error span */
  function applyFieldError(key) {
    var f = fields[key];
    if (!f) return;
    var msg = fieldErrors[key] || '';
    f.label.className = msg ? 'is-invalid' : '';
    var span = f.label.querySelector('.admin-field-error');
    if (msg) {
      if (!span) {
        span = document.createElement('span');
        span.className = 'admin-field-error';
        f.label.appendChild(span);
      }
      span.textContent = msg;
    } else if (span) {
      span.parentNode.removeChild(span);
    }
  }

  function setFieldErrors(errors) {
    fieldErrors = errors;
    Object.keys(fields).forEach(applyFieldError);
  }

  function clearField(key) {
    if (!fieldErrors[key]) return;
    delete fieldErrors[key];
    applyFieldError(key);
  }

  function onSubmit(payload) {
    setBusy(true);
    clearAlert('danger');
    if (mode === 'create') {
      AdminApi.createPersonel(payload)
        .then(function () {
          AdminConfig.goto('/admin/personeller');
        })
        .catch(function (ex) {
          showAlert('danger', ex.message);
        })
        .finally(function () {
          setBusy(false);
        });
    } else {
      clearAlert('success');
      AdminApi.updatePersonel(recordId, payload)
        .then(function () {
          showAlert('success', 'Kayıt başarıyla güncellendi.');
        })
        .catch(function (ex) {
          showAlert('danger', ex.message);
        })
        .finally(function () {
          setBusy(false);
        });
    }
  }

  function renderForm() {
    var content = AdminLayout.content;
    content.innerHTML = '';
    alerts = { success: null, danger: null };
    fieldErrors = {};

    var module = document.createElement('div');
    module.className = 'admin-module';
    module.innerHTML =
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-users" aria-hidden="true"></i>' +
      (mode === 'edit' ? 'Personel düzenle' : 'Yeni personel') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/personeller') + '" class="admin-btn admin-btn-secondary">' +
      '<i class="fas fa-arrow-left" aria-hidden="true"></i> Listeye dön' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-crud-form-shell">' +
      '<div class="admin-card">' +
      '<div class="admin-card-body"></div>' +
      '</div>' +
      '</div>';

    cardBody = module.querySelector('.admin-card-body');

    form = document.createElement('form');
    form.className = 'admin-form admin-form--grid';
    form.noValidate = true;
    form.innerHTML =
      '<div class="admin-form__main">' +
      '<div class="admin-form__row-2">' +
      '<label>Ad<input autocomplete="given-name" required /></label>' +
      '<label>Soyad<input autocomplete="family-name" required /></label>' +
      '</div>' +
      '<div class="admin-form__row-2">' +
      '<label>Sicil no<input required /></label>' +
      '<label>Doğum tarihi<input type="date" required /></label>' +
      '</div>' +
      '<label>E-posta<input type="email" inputmode="email" autocomplete="email" required /></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Şifre' + (mode === 'edit' ? ' (opsiyonel)' : '') +
      '<input type="password"' + (mode === 'create' ? ' required' : '') +
      ' minlength="6" placeholder="' +
      (mode === 'edit' ? 'Değiştirmek için doldurun' : 'En az 6 karakter') +
      '" autocomplete="new-password" /></label>' +
      '<label>Telefon<input type="tel" inputmode="numeric" autocomplete="tel"' +
      ' placeholder="05XXXXXXXXX" maxlength="11" /></label>' +
      '</div>' +
      '<label>T.C. kimlik no<input inputmode="numeric" maxlength="11"' +
      ' placeholder="11 haneli T.C. kimlik no" /></label>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/personeller') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>';

    var mainLabels = form.querySelectorAll('.admin-form__main label');
    var keys = ['ad', 'soyad', 'sicil_no', 'dogum_tarihi', 'email', 'sifre', 'telefon', 'tc_no'];
    fields = {};
    keys.forEach(function (key, i) {
      fields[key] = {
        label: mainLabels[i],
        input: mainLabels[i].querySelector('input'),
      };
    });

    fields.sicil_no.input.value = (initial && initial.sicil_no) || '';
    fields.ad.input.value = (initial && initial.ad) || '';
    fields.soyad.input.value = (initial && initial.soyad) || '';
    fields.email.input.value = (initial && initial.email) || '';
    fields.sifre.input.value = '';
    fields.telefon.input.value = (initial && initial.telefon) || '';
    fields.tc_no.input.value = (initial && initial.tc_no) || '';
    fields.dogum_tarihi.input.value = (initial && initial.dogum_tarihi) || '';

    keys.forEach(function (key) {
      fields[key].input.addEventListener('input', function () {
        clearField(key);
      });
    });
    fields.telefon.input.addEventListener('input', function () {
      var next = FormRules.digitsOnly(fields.telefon.input.value).slice(0, 11);
      fields.telefon.input.value = next;
    });
    fields.tc_no.input.addEventListener('input', function () {
      fields.tc_no.input.value = FormRules.digitsOnly(fields.tc_no.input.value).slice(0, 11);
    });

    picker = AdminWidgets.imagePickerField({
      value: (initial && initial.foto_url) || '',
      label: 'Fotoğraf',
    });
    form.querySelector('.admin-form__side').appendChild(picker.el);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var values = {
        sicil_no: fields.sicil_no.input.value.trim(),
        ad: fields.ad.input.value.trim(),
        soyad: fields.soyad.input.value.trim(),
        email: fields.email.input.value.trim(),
        telefon: fields.telefon.input.value,
        tc_no: fields.tc_no.input.value,
        dogum_tarihi: fields.dogum_tarihi.input.value,
        sifre: fields.sifre.input.value,
      };
      var errors = FormRules.validatePersonelForm(values, { mode: mode });
      setFieldErrors(errors);
      if (Object.keys(errors).length) return;
      var payload = {
        sicil_no: values.sicil_no,
        ad: values.ad,
        soyad: values.soyad,
        email: values.email.toLowerCase(),
        telefon: FormRules.normalizePhone(values.telefon) || null,
        tc_no: FormRules.digitsOnly(values.tc_no) || null,
        dogum_tarihi: values.dogum_tarihi,
        foto_url: picker.getValue() || '../images/gebze-logo.webp',
      };
      if (values.sifre) payload.sifre = values.sifre;
      else if (mode === 'create') payload.sifre = values.sifre;
      onSubmit(payload);
    });

    cardBody.appendChild(form);
    content.appendChild(module);
  }

  function init() {
    if (mode === 'edit') {
      AdminApi.getPersonel(recordId)
        .then(function (data) {
          initial = data;
          renderForm();
        })
        .catch(function (ex) {
          /* React: err set → form yine de render edilir (initial null) + hata alert'i */
          renderForm();
          showAlert('danger', ex.message);
        });
    } else {
      renderForm();
    }
  }

  Portal.onReady(init);
})();
