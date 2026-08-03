/*
 * Sizden Gelen formu — React admin/src/pages/sizden-gelenler/
 * SizdenGelenlerPages.jsx (SizdenGelenForm + SizdenGelenlerEkle +
 * SizdenGelenlerDuzenle) birebir karşılığı.
 * sizden-gelenler-ekle.html ve sizden-gelenler-duzenle.html tarafından paylaşılır.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var mode = Portal.route() === '/admin/sizden-gelenler/duzenle' ? 'edit' : 'create';
  var recordId = Portal.param('id');

  var initial = null;
  var err = '';

  var kategoriler = [];
  /* React kategori state'i: seçenekler yüklenmemiş olsa da değer korunur */
  var kategoriValue = '';

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

  function renderKategoriler() {
    var html = '<option value="">Seçiniz</option>';
    kategoriler.forEach(function (k) {
      html += '<option value="' + esc(k.id) + '">' + esc(k.ad) + '</option>';
    });
    fields.kategori.innerHTML = html;
    fields.kategori.value = kategoriValue;
  }

  async function onSubmit(e) {
    e.preventDefault();
    var payload = {
      baslik: fields.baslik.value,
      ozet: fields.ozet.value || '',
      tarih: fields.tarih.value,
      goruntulenme: Number(fields.goruntulenme.value) || 0,
      gorsel_yolu: picker.getValue() || null,
      kategori: kategoriValue ? Number(kategoriValue) : null,
    };
    setBusy(true);
    clearAlert('danger');
    clearAlert('success');
    try {
      if (mode === 'edit') {
        await AdminApi.updateSizdenGelen(recordId, payload);
        showAlert('success', 'Kayıt başarıyla güncellendi.');
      } else {
        await AdminApi.createSizdenGelen(payload);
        AdminConfig.goto('/admin/sizden-gelenler');
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
      '<h2><i class="fas fa-comments" aria-hidden="true"></i>' +
      (mode === 'edit' ? 'Kayıt düzenle' : 'Yeni kayıt') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/sizden-gelenler') + '" class="admin-btn admin-btn-secondary">' +
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
      '<label>Özet<textarea rows="6" required></textarea></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Tarih<input type="date" required /></label>' +
      '<label>Kategori' +
      '<select>' +
      '<option value="">Seçiniz</option>' +
      '</select>' +
      '</label>' +
      '</div>' +
      '<label>Görüntülenme<input type="number" min="0" /></label>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/sizden-gelenler') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
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
    fields.ozet = mainLabels[1].querySelector('textarea');
    fields.tarih = mainLabels[2].querySelector('input');
    fields.kategori = mainLabels[3].querySelector('select');
    fields.goruntulenme = mainLabels[4].querySelector('input');

    fields.baslik.value = (initial && initial.baslik) || '';
    fields.ozet.value = (initial && initial.ozet) || '';
    fields.tarih.value = (initial && initial.tarih) || '';
    fields.goruntulenme.value =
      initial && initial.goruntulenme != null ? initial.goruntulenme : 0;

    kategoriValue = initial && initial.kategori ? String(initial.kategori) : '';
    renderKategoriler();
    fields.kategori.addEventListener('change', function () {
      kategoriValue = fields.kategori.value;
    });

    picker = AdminWidgets.imagePickerField({
      value: (initial && initial.gorsel_yolu) || '',
      label: 'Görsel',
    });
    formEl.querySelector('.admin-form__side').appendChild(picker.el);

    if (err) {
      showAlert('danger', err);
      err = '';
    }

    formEl.addEventListener('submit', onSubmit);

    /* React: kategoriler form mount edilince yüklenir */
    AdminApi.listSizdenGelenKategoriler()
      .then(function (data) {
        kategoriler = Array.isArray(data) ? data : [];
      })
      .catch(function () {
        kategoriler = [];
      })
      .finally(renderKategoriler);
  }

  function init() {
    if (mode === 'edit') {
      AdminApi.getSizdenGelen(recordId)
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
