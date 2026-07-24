/** Admin form alan kuralları (personel / yönetici). */

const NAME_RE = /^[A-Za-zÀ-ÿĞğÜüŞşİıÖöÇç\s'\-]+$/;
const SICIL_RE = /^[A-Za-z0-9._/\-]+$/;
const USERNAME_RE = /^[A-Za-z0-9._\-]{3,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function digitsOnly(value = '') {
  return String(value).replace(/\D/g, '');
}

export function isValidTc(tc) {
  if (!/^\d{11}$/.test(tc) || tc[0] === '0') return false;
  const d = tc.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  if ((odd * 7 - even) % 10 !== d[9]) return false;
  if (d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 !== d[10]) return false;
  return true;
}

export function normalizePhone(value = '') {
  const raw = String(value).trim();
  if (!raw) return '';
  let phone = digitsOnly(raw);
  if (phone.length === 10 && phone.startsWith('5')) phone = `0${phone}`;
  return phone;
}

export function isValidTrMobile(phone) {
  return /^05\d{9}$/.test(phone);
}

export function validatePersonName(value, label = 'Ad') {
  const name = String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!name) return `${label} zorunludur.`;
  if (name.length < 2) return `${label} en az 2 karakter olmalıdır.`;
  if (name.length > 50) return `${label} en fazla 50 karakter olabilir.`;
  if (/\d/.test(name)) return `${label} rakam içeremez.`;
  if (!NAME_RE.test(name)) return `${label} yalnızca harf içermelidir.`;
  return '';
}

export function validateEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email) return 'E-posta zorunludur.';
  const digits = digitsOnly(email);
  if (digits && digits === email.replace(/\s/g, '') && !email.includes('@')) {
    return 'E-posta alanına telefon numarası girilemez.';
  }
  if (!EMAIL_RE.test(email)) return 'Geçerli bir e-posta adresi giriniz.';
  if (email.length > 100) return 'E-posta en fazla 100 karakter olabilir.';
  return '';
}

export function validateTcOptional(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const tc = digitsOnly(raw);
  if (!isValidTc(tc)) return 'Geçerli bir T.C. kimlik numarası giriniz.';
  return '';
}

export function validatePhoneOptional(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes('@') || EMAIL_RE.test(raw)) {
    return 'Telefon alanına e-posta girilemez.';
  }
  const phone = normalizePhone(raw);
  if (!isValidTrMobile(phone)) {
    return 'Geçerli bir cep telefonu giriniz. Örn: 05XX XXX XX XX';
  }
  return '';
}

export function validateSicil(value) {
  const sicil = String(value || '').trim();
  if (!sicil) return 'Sicil no zorunludur.';
  if (sicil.includes('@') || EMAIL_RE.test(sicil)) {
    return 'Sicil alanına e-posta girilemez.';
  }
  if (!SICIL_RE.test(sicil)) {
    return 'Sicil no yalnızca harf, rakam ve . _ / - içerebilir.';
  }
  if (sicil.length > 50) return 'Sicil no en fazla 50 karakter olabilir.';
  return '';
}

export function validateUsername(value) {
  const username = String(value || '').trim();
  if (!username) return 'Kullanıcı adı zorunludur.';
  if (username.includes('@')) return 'Kullanıcı adına e-posta girilemez.';
  if (/\s/.test(username)) return 'Kullanıcı adı boşluk içeremez.';
  if (!USERNAME_RE.test(username)) {
    return 'Kullanıcı adı 3–50 karakter olmalı; yalnızca harf, rakam, . _ - kullanın.';
  }
  return '';
}

export function validatePassword(value, { required } = {}) {
  const raw = String(value || '');
  if (!raw) return required ? 'Şifre zorunludur.' : '';
  if (raw.length < 6) return 'Şifre en az 6 karakter olmalıdır.';
  if (raw.length > 128) return 'Şifre en fazla 128 karakter olabilir.';
  return '';
}

export function validateBirthDate(value) {
  if (!value) return 'Doğum tarihi zorunludur.';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'Geçerli bir doğum tarihi giriniz.';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d > today) return 'Doğum tarihi gelecekte olamaz.';
  if (d.getFullYear() < 1920) return 'Doğum tarihi 1920’den önce olamaz.';
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  if (age < 15) return 'Personel en az 15 yaşında olmalıdır.';
  if (age > 90) return 'Doğum tarihi geçersiz görünüyor.';
  return '';
}

export function validatePersonelForm(values, { mode }) {
  const errors = {};
  const ad = validatePersonName(values.ad, 'Ad');
  if (ad) errors.ad = ad;
  const soyad = validatePersonName(values.soyad, 'Soyad');
  if (soyad) errors.soyad = soyad;
  const sicil = validateSicil(values.sicil_no);
  if (sicil) errors.sicil_no = sicil;
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  const telefon = validatePhoneOptional(values.telefon);
  if (telefon) errors.telefon = telefon;
  const tc = validateTcOptional(values.tc_no);
  if (tc) errors.tc_no = tc;
  const dogum = validateBirthDate(values.dogum_tarihi);
  if (dogum) errors.dogum_tarihi = dogum;
  const sifre = validatePassword(values.sifre, { required: mode === 'create' });
  if (sifre) errors.sifre = sifre;
  return errors;
}

export function validateYoneticiForm(values, { mode }) {
  const errors = {};
  const ad = validatePersonName(values.ad, 'Ad');
  if (ad) errors.ad = ad;
  const soyad = validatePersonName(values.soyad, 'Soyad');
  if (soyad) errors.soyad = soyad;
  const kullanici = validateUsername(values.kullanici_adi);
  if (kullanici) errors.kullanici_adi = kullanici;
  const sifre = validatePassword(values.sifre, { required: mode === 'create' });
  if (sifre) errors.sifre = sifre;
  return errors;
}

export function firstError(errors) {
  const key = Object.keys(errors)[0];
  return key ? errors[key] : '';
}
