/*
 * Admin form alan kuralları — React admin/src/utils/formRules.js birebir karşılığı.
 */
(function () {
  'use strict';

  var NAME_RE = /^[A-Za-zÀ-ÿĞğÜüŞşİıÖöÇç\s'\-]+$/;
  var SICIL_RE = /^[A-Za-z0-9._/\-]+$/;
  var USERNAME_RE = /^[A-Za-z0-9._\-]{3,50}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function digitsOnly(value) {
    return String(value == null ? '' : value).replace(/\D/g, '');
  }

  function isValidTc(tc) {
    if (!/^\d{11}$/.test(tc) || tc[0] === '0') return false;
    var d = tc.split('').map(Number);
    var odd = d[0] + d[2] + d[4] + d[6] + d[8];
    var even = d[1] + d[3] + d[5] + d[7];
    if ((odd * 7 - even) % 10 !== d[9]) return false;
    var sum = 0;
    for (var i = 0; i < 10; i += 1) sum += d[i];
    if (sum % 10 !== d[10]) return false;
    return true;
  }

  function normalizePhone(value) {
    var raw = String(value == null ? '' : value).trim();
    if (!raw) return '';
    var phone = digitsOnly(raw);
    if (phone.length === 10 && phone.indexOf('5') === 0) phone = '0' + phone;
    return phone;
  }

  function isValidTrMobile(phone) {
    return /^05\d{9}$/.test(phone);
  }

  function validatePersonName(value, label) {
    label = label === undefined ? 'Ad' : label;
    var name = String(value || '')
      .trim()
      .replace(/\s+/g, ' ');
    if (!name) return label + ' zorunludur.';
    if (name.length < 2) return label + ' en az 2 karakter olmalıdır.';
    if (name.length > 50) return label + ' en fazla 50 karakter olabilir.';
    if (/\d/.test(name)) return label + ' rakam içeremez.';
    if (!NAME_RE.test(name)) return label + ' yalnızca harf içermelidir.';
    return '';
  }

  function validateEmail(value) {
    var email = String(value || '').trim().toLowerCase();
    if (!email) return 'E-posta zorunludur.';
    var digits = digitsOnly(email);
    if (digits && digits === email.replace(/\s/g, '') && email.indexOf('@') === -1) {
      return 'E-posta alanına telefon numarası girilemez.';
    }
    if (!EMAIL_RE.test(email)) return 'Geçerli bir e-posta adresi giriniz.';
    if (email.length > 100) return 'E-posta en fazla 100 karakter olabilir.';
    return '';
  }

  function validateTcOptional(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    var tc = digitsOnly(raw);
    if (!isValidTc(tc)) return 'Geçerli bir T.C. kimlik numarası giriniz.';
    return '';
  }

  function validatePhoneOptional(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    if (raw.indexOf('@') !== -1 || EMAIL_RE.test(raw)) {
      return 'Telefon alanına e-posta girilemez.';
    }
    var phone = normalizePhone(raw);
    if (!isValidTrMobile(phone)) {
      return 'Geçerli bir cep telefonu giriniz. Örn: 05XX XXX XX XX';
    }
    return '';
  }

  function validateSicil(value) {
    var sicil = String(value || '').trim();
    if (!sicil) return 'Sicil no zorunludur.';
    if (sicil.indexOf('@') !== -1 || EMAIL_RE.test(sicil)) {
      return 'Sicil alanına e-posta girilemez.';
    }
    if (!SICIL_RE.test(sicil)) {
      return 'Sicil no yalnızca harf, rakam ve . _ / - içerebilir.';
    }
    if (sicil.length > 50) return 'Sicil no en fazla 50 karakter olabilir.';
    return '';
  }

  function validateUsername(value) {
    var username = String(value || '').trim();
    if (!username) return 'Kullanıcı adı zorunludur.';
    if (username.indexOf('@') !== -1) return 'Kullanıcı adına e-posta girilemez.';
    if (/\s/.test(username)) return 'Kullanıcı adı boşluk içeremez.';
    if (!USERNAME_RE.test(username)) {
      return 'Kullanıcı adı 3–50 karakter olmalı; yalnızca harf, rakam, . _ - kullanın.';
    }
    return '';
  }

  function validatePassword(value, options) {
    var required = Boolean(options && options.required);
    var raw = String(value || '');
    if (!raw) return required ? 'Şifre zorunludur.' : '';
    if (raw.length < 6) return 'Şifre en az 6 karakter olmalıdır.';
    if (raw.length > 128) return 'Şifre en fazla 128 karakter olabilir.';
    return '';
  }

  function validateBirthDate(value) {
    if (!value) return 'Doğum tarihi zorunludur.';
    var d = new Date(value + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return 'Geçerli bir doğum tarihi giriniz.';
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d > today) return 'Doğum tarihi gelecekte olamaz.';
    if (d.getFullYear() < 1920) return 'Doğum tarihi 1920’den önce olamaz.';
    var age = today.getFullYear() - d.getFullYear();
    var m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
    if (age < 15) return 'Personel en az 15 yaşında olmalıdır.';
    if (age > 90) return 'Doğum tarihi geçersiz görünüyor.';
    return '';
  }

  function validatePersonelForm(values, options) {
    var mode = options && options.mode;
    var errors = {};
    var ad = validatePersonName(values.ad, 'Ad');
    if (ad) errors.ad = ad;
    var soyad = validatePersonName(values.soyad, 'Soyad');
    if (soyad) errors.soyad = soyad;
    var sicil = validateSicil(values.sicil_no);
    if (sicil) errors.sicil_no = sicil;
    var email = validateEmail(values.email);
    if (email) errors.email = email;
    var telefon = validatePhoneOptional(values.telefon);
    if (telefon) errors.telefon = telefon;
    var tc = validateTcOptional(values.tc_no);
    if (tc) errors.tc_no = tc;
    var dogum = validateBirthDate(values.dogum_tarihi);
    if (dogum) errors.dogum_tarihi = dogum;
    var sifre = validatePassword(values.sifre, { required: mode === 'create' });
    if (sifre) errors.sifre = sifre;
    return errors;
  }

  function validateYoneticiForm(values, options) {
    var mode = options && options.mode;
    var errors = {};
    var ad = validatePersonName(values.ad, 'Ad');
    if (ad) errors.ad = ad;
    var soyad = validatePersonName(values.soyad, 'Soyad');
    if (soyad) errors.soyad = soyad;
    var kullanici = validateUsername(values.kullanici_adi);
    if (kullanici) errors.kullanici_adi = kullanici;
    var sifre = validatePassword(values.sifre, { required: mode === 'create' });
    if (sifre) errors.sifre = sifre;
    return errors;
  }

  function firstError(errors) {
    var key = Object.keys(errors)[0];
    return key ? errors[key] : '';
  }

  window.FormRules = {
    digitsOnly: digitsOnly,
    isValidTc: isValidTc,
    normalizePhone: normalizePhone,
    isValidTrMobile: isValidTrMobile,
    validatePersonName: validatePersonName,
    validateEmail: validateEmail,
    validateTcOptional: validateTcOptional,
    validatePhoneOptional: validatePhoneOptional,
    validateSicil: validateSicil,
    validateUsername: validateUsername,
    validatePassword: validatePassword,
    validateBirthDate: validateBirthDate,
    validatePersonelForm: validatePersonelForm,
    validateYoneticiForm: validateYoneticiForm,
    firstError: firstError,
  };
})();
