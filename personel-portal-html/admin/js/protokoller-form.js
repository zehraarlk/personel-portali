/*
 * Protokol formu — React admin/src/pages/protokoller/ProtokollerPages.jsx
 * (ProtokolForm + ProtokollerEkle + ProtokollerDuzenle) birebir karşılığı.
 * protokoller-ekle.html ve protokoller-duzenle.html tarafından paylaşılır.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var MODE = Portal.route() === '/admin/protokoller/duzenle' ? 'edit' : 'create';

  /** DB tarih alanı: "04.10.2023" ↔ date input "2023-10-04" */
  function toDateInput(value) {
    if (!value) return '';
    var raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    var m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return '';
    var d = m[1];
    var mo = m[2];
    var y = m[3];
    while (mo.length < 2) mo = '0' + mo;
    while (d.length < 2) d = '0' + d;
    return y + '-' + mo + '-' + d;
  }

  function fromDateInput(value) {
    if (!value) return '';
    var m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return value;
    return m[3] + '.' + m[2] + '.' + m[1];
  }

  var initial = null;
  var err = '';
  var localErr = '';
  var msg = '';

  var alerts = { success: null, danger: null };
  var refs = null;
  var iconField = null;
  var pdfField = null;

  function content() {
    return AdminLayout.content;
  }

  /* ─── Alert yönetimi (React key değişiminde remount davranışı) ─── */

  function hideAlert(kind) {
    var old = alerts[kind];
    alerts[kind] = null;
    if (old) old.dismiss();
  }

  function showAlert(kind, text, onClose) {
    var old = alerts[kind];
    alerts[kind] = null;
    if (old) old.dismiss();

    var el = AdminWidgets.alert({
      type: kind,
      text: text,
      onClose: function () {
        if (alerts[kind] !== el) return;
        alerts[kind] = null;
        if (typeof onClose === 'function') onClose();
      },
    });
    alerts[kind] = el;

    var cardBody = content().querySelector('.admin-card-body');
    var form = cardBody.querySelector('form');
    /* React sırası: success alert, sonra danger alert, sonra form */
    if (kind === 'success') {
      cardBody.insertBefore(el, alerts.danger || form);
    } else {
      cardBody.insertBefore(el, form);
    }
  }

  function onDangerClose() {
    localErr = '';
    err = '';
  }

  /* ─── Form render ─── */

  function renderForm() {
    var v = {
      baslik: (initial && initial.baslik) || '',
      aciklama: (initial && initial.aciklama) || '',
      ikon: (initial && initial.ikon) || 'fas fa-file-signature',
      dosya_yolu: (initial && initial.dosya_yolu) || '',
      resmi_sayfa: (initial && initial.resmi_sayfa) || '',
      boyut: (initial && initial.boyut) || '',
      tarih: toDateInput(initial && initial.tarih),
    };
    localErr = '';

    content().innerHTML =
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-file-signature" aria-hidden="true"></i>' +
      (MODE === 'edit' ? 'Protokol düzenle' : 'Yeni protokol') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/protokoller') + '" class="admin-btn admin-btn-secondary">' +
      '<i class="fas fa-arrow-left" aria-hidden="true"></i> Listeye dön' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-crud-form-shell">' +
      '<div class="admin-card">' +
      '<div class="admin-card-body">' +
      '<form class="admin-form admin-form--grid">' +
      '<div class="admin-form__main">' +
      '<label>Başlık<input value="' + esc(v.baslik) + '" required maxlength="255" placeholder="Örn: Gebze MedicalPark Hastanesi" /></label>' +
      '<label>Açıklama<textarea rows="6" required placeholder="Protokol / anlaşma özeti">' + esc(v.aciklama) + '</textarea></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Boyut<input value="' + esc(v.boyut) + '" required placeholder="Örn: 1.7 MB" /></label>' +
      '<label>Tarih<input type="date" value="' + esc(v.tarih) + '" required /></label>' +
      '</div>' +
      '<label>Resmi sayfa (opsiyonel)<input value="' + esc(v.resmi_sayfa) + '" placeholder="https://www.mevzuat.gov.tr/…" /></label>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/protokoller') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    alerts = { success: null, danger: null };

    var form = content().querySelector('form');
    var main = form.querySelector('.admin-form__main');
    var fields = main.querySelectorAll('input, textarea');
    refs = {
      form: form,
      baslik: fields[0],
      aciklama: fields[1],
      boyut: fields[2],
      tarih: fields[3],
      resmiSayfa: fields[4],
      submitBtn: form.querySelector('button[type="submit"]'),
    };

    var side = form.querySelector('.admin-form__side');

    iconField = AdminWidgets.iconSelectField({
      value: v.ikon,
      onChange: function () {},
      defaultIcon: 'fas fa-file-signature',
      label: 'İkon değiştir',
    });
    side.appendChild(iconField.el);

    pdfField = AdminWidgets.pdfPickerField({
      value: v.dosya_yolu,
      onChange: function () {},
      onUploaded: function (info) {
        /* React: if (sizeLabel) setBoyut(sizeLabel) */
        if (info && info.size_label) refs.boyut.value = info.size_label;
      },
      mode: 'pdf',
      label: 'PDF değiştir',
    });
    side.appendChild(pdfField.el);

    form.addEventListener('submit', onSubmit);
  }

  /* React'taki useEffect([initial]) — alan değerlerini kayda göre sıfırlar */
  function applyInitial() {
    refs.baslik.value = (initial && initial.baslik) || '';
    refs.aciklama.value = (initial && initial.aciklama) || '';
    iconField.setValue((initial && initial.ikon) || 'fas fa-file-signature');
    pdfField.setValue((initial && initial.dosya_yolu) || '');
    refs.resmiSayfa.value = (initial && initial.resmi_sayfa) || '';
    refs.boyut.value = (initial && initial.boyut) || '';
    refs.tarih.value = toDateInput(initial && initial.tarih);
    localErr = '';
  }

  function setBusy(next) {
    refs.submitBtn.disabled = next;
    refs.submitBtn.textContent = next ? 'Kaydediliyor…' : 'Kaydet';
  }

  function onSubmit(e) {
    e.preventDefault();
    var dosyaYolu = pdfField.getValue();
    if (!dosyaYolu.trim()) {
      localErr = 'PDF dosyası zorunludur. Sağdaki alandan seçin veya URL yapıştırın.';
      showAlert('danger', err || localErr, onDangerClose);
      return;
    }
    localErr = '';

    var tarih = refs.tarih.value;
    var payload = {
      baslik: refs.baslik.value.trim(),
      aciklama: refs.aciklama.value.trim(),
      ikon: iconField.getValue() || 'fas fa-file-signature',
      dosya_yolu: dosyaYolu.trim(),
      resmi_sayfa: refs.resmiSayfa.value.trim() || null,
      boyut: refs.boyut.value.trim(),
      tarih: fromDateInput(tarih) || tarih.trim(),
    };

    setBusy(true);
    err = '';
    hideAlert('danger');

    if (MODE === 'create') {
      AdminApi.createProtokol(payload)
        .then(function () {
          AdminConfig.goto('/admin/protokoller');
        })
        .catch(function (ex) {
          err = ex.message;
          showAlert('danger', err, onDangerClose);
        })
        .finally(function () {
          setBusy(false);
        });
    } else {
      msg = '';
      hideAlert('success');
      AdminApi.updateProtokol(Portal.param('id'), payload)
        .then(function (updated) {
          initial = updated;
          applyInitial();
          msg = 'Kayıt başarıyla güncellendi.';
          showAlert('success', msg, function () {
            msg = '';
          });
        })
        .catch(function (ex) {
          err = ex.message;
          showAlert('danger', err, onDangerClose);
        })
        .finally(function () {
          setBusy(false);
        });
    }
  }

  /* ProtokollerDuzenle: initial yok + err varken YALNIZCA alert render edilir */
  function renderErrorOnly() {
    alerts = { success: null, danger: null };
    content().innerHTML = '';
    var el = AdminWidgets.alert({
      type: 'danger',
      text: err,
      onClose: function () {
        err = '';
        content().innerHTML = '<p class="admin-muted">Yükleniyor…</p>';
      },
    });
    content().appendChild(el);
  }

  function init() {
    if (MODE === 'edit') {
      AdminApi.getProtokol(Portal.param('id'))
        .then(function (data) {
          initial = data;
          renderForm();
        })
        .catch(function (ex) {
          err = ex.message;
          renderErrorOnly();
        });
    } else {
      renderForm();
    }
  }

  Portal.onReady(init);
})();
