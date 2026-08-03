/*
 * Yönetici formu — React admin/src/pages/yonetim/YonetimPages.jsx
 * (YoneticiForm + YoneticilerEkle + YoneticilerDuzenle) birebir karşılığı.
 * yoneticiler-ekle.html ve yoneticiler-duzenle.html paylaşır.
 */
(function () {
  'use strict';

  var mode = Portal.route() === '/admin/yoneticiler/ekle' ? 'create' : 'edit';
  var recordId = Portal.param('id');

  var initial = null;
  var busy = false;
  var fieldErrors = {};

  var cardBody = null;
  var form = null;
  var fields = {};
  var refs = {};
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
      AdminApi.createYonetici(payload)
        .then(function () {
          AdminConfig.goto('/admin/yoneticiler');
        })
        .catch(function (ex) {
          showAlert('danger', ex.message);
        })
        .finally(function () {
          setBusy(false);
        });
    } else {
      clearAlert('success');
      AdminApi.updateYonetici(recordId, payload)
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
      '<h2><i class="fas fa-user-shield" aria-hidden="true"></i>' +
      (mode === 'edit' ? 'Yönetici düzenle' : 'Yeni yönetici') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/yoneticiler') + '" class="admin-btn admin-btn-secondary">' +
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
      '<label>Ad<input required /></label>' +
      '<label>Soyad<input required /></label>' +
      '</div>' +
      '<label>Kullanıcı adı<input required autocomplete="username"' +
      ' placeholder="ornek.kullanici" /></label>' +
      '<label>Şifre' + (mode === 'edit' ? ' (opsiyonel)' : '') +
      '<input type="password"' + (mode === 'create' ? ' required' : '') +
      ' minlength="6" placeholder="' +
      (mode === 'edit' ? 'Değiştirmek için doldurun' : 'En az 6 karakter') +
      '" autocomplete="new-password" /></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Yetki<select>' +
      '<option value="yonetici">Yönetici</option>' +
      '<option value="admin">Admin</option>' +
      '<option value="editor">Editör</option>' +
      '</select></label>' +
      '<label>Durum<select>' +
      '<option value="1">Aktif</option>' +
      '<option value="0">Pasif</option>' +
      '</select></label>' +
      '</div>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/yoneticiler') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>';

    var mainLabels = form.querySelectorAll('.admin-form__main label');
    var keys = ['ad', 'soyad', 'kullanici_adi', 'sifre'];
    fields = {};
    keys.forEach(function (key, i) {
      fields[key] = {
        label: mainLabels[i],
        input: mainLabels[i].querySelector('input'),
      };
    });
    refs = {
      yetki: mainLabels[4].querySelector('select'),
      aktif: mainLabels[5].querySelector('select'),
    };

    fields.kullanici_adi.input.value = (initial && initial.kullanici_adi) || '';
    fields.ad.input.value = (initial && initial.ad) || '';
    fields.soyad.input.value = (initial && initial.soyad) || '';
    fields.sifre.input.value = '';
    refs.yetki.value = (initial && initial.yetki) || 'yonetici';
    refs.aktif.value = String(initial && initial.aktif != null ? initial.aktif : 1);

    keys.forEach(function (key) {
      fields[key].input.addEventListener('input', function () {
        clearField(key);
      });
    });
    fields.kullanici_adi.input.addEventListener('input', function () {
      fields.kullanici_adi.input.value = fields.kullanici_adi.input.value.replace(/\s/g, '');
    });

    picker = AdminWidgets.imagePickerField({
      value: (initial && initial.foto_url) || '',
      label: 'Fotoğraf',
    });
    form.querySelector('.admin-form__side').appendChild(picker.el);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var values = {
        kullanici_adi: fields.kullanici_adi.input.value.trim(),
        ad: fields.ad.input.value.trim(),
        soyad: fields.soyad.input.value.trim(),
        sifre: fields.sifre.input.value,
      };
      var errors = FormRules.validateYoneticiForm(values, { mode: mode });
      setFieldErrors(errors);
      if (Object.keys(errors).length) return;
      var payload = {
        kullanici_adi: values.kullanici_adi,
        ad: values.ad,
        soyad: values.soyad,
        yetki: refs.yetki.value,
        aktif: Number(refs.aktif.value),
        foto_url: picker.getValue() || null,
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
      AdminApi.getYonetici(recordId)
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
