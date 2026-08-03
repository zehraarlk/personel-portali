/*
 * Yardımcı link formu — React
 * admin/src/pages/yardimci-linkler/YardimciLinklerPages.jsx
 * (YardimciLinkForm + YardimciLinklerEkle + YardimciLinklerDuzenle) birebir karşılığı.
 * yardimci-linkler-ekle.html ve yardimci-linkler-duzenle.html tarafından paylaşılır.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var MODE = Portal.route() === '/admin/yardimci-linkler/duzenle' ? 'edit' : 'create';

  var initial = null;
  var err = '';
  var localErr = '';
  var msg = '';
  var kategoriler = [];
  var kategoriValue = '';

  var alerts = { success: null, danger: null };
  var refs = null;
  var logoPicker = null;

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
    /* YardimciLinklerDuzenle: initial yokken err kapatılınca tekrar yükleme durumu */
    if (MODE === 'edit' && !initial) {
      alerts = { success: null, danger: null };
      content().innerHTML = '<p class="admin-muted">Yükleniyor…</p>';
    }
  }

  /* ─── Form render ─── */

  function kategoriOptionsHtml() {
    var html = '<option value="">Kategori seçin</option>';
    kategoriler.forEach(function (k) {
      html += '<option value="' + esc(String(k.id)) + '">' + esc(k.ad) + '</option>';
    });
    return html;
  }

  function renderForm() {
    var v = {
      baslik: (initial && initial.baslik) || '',
      hedef_url: (initial && initial.hedef_url) || '',
      logo_url: (initial && initial.logo_url) || '',
      kategori: initial && initial.kategori != null ? String(initial.kategori) : '',
    };
    kategoriValue = v.kategori;
    localErr = '';

    content().innerHTML =
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-link" aria-hidden="true"></i>' +
      (MODE === 'edit' ? 'Link düzenle' : 'Yeni link') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/yardimci-linkler') + '" class="admin-btn admin-btn-secondary">' +
      '<i class="fas fa-arrow-left" aria-hidden="true"></i> Listeye dön' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-crud-form-shell">' +
      '<div class="admin-card">' +
      '<div class="admin-card-body">' +
      '<form class="admin-form admin-form--grid">' +
      '<div class="admin-form__main">' +
      '<label>Başlık<input value="' + esc(v.baslik) + '" required /></label>' +
      '<label>Hedef URL<input type="url" value="' + esc(v.hedef_url) + '" placeholder="https://..." required /></label>' +
      '<label>Kategori *<select required aria-label="Kategori">' + kategoriOptionsHtml() + '</select></label>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/yardimci-linkler') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    alerts = { success: null, danger: null };

    var form = content().querySelector('form');
    var main = form.querySelector('.admin-form__main');
    var fields = main.querySelectorAll('input, select');
    refs = {
      form: form,
      baslik: fields[0],
      hedefUrl: fields[1],
      kategori: fields[2],
      submitBtn: form.querySelector('button[type="submit"]'),
    };

    refs.kategori.value = kategoriValue;
    refs.kategori.addEventListener('change', function () {
      kategoriValue = refs.kategori.value;
    });

    logoPicker = AdminWidgets.imagePickerField({
      value: v.logo_url,
      onChange: function () {},
      label: 'Logo',
      fit: 'logo',
    });
    form.querySelector('.admin-form__side').appendChild(logoPicker.el);

    form.addEventListener('submit', onSubmit);

    /* YardimciLinkForm mount effect'i: kategoriler */
    AdminApi.listYardimciLinkKategoriler()
      .then(function (data) {
        kategoriler = Array.isArray(data) ? data : data.results || [];
      })
      .catch(function () {
        kategoriler = [];
      })
      .finally(function () {
        refs.kategori.innerHTML = kategoriOptionsHtml();
        refs.kategori.value = kategoriValue;
      });
  }

  /* React'taki useEffect([initial]) — alan değerlerini kayda göre sıfırlar */
  function applyInitial() {
    refs.baslik.value = (initial && initial.baslik) || '';
    refs.hedefUrl.value = (initial && initial.hedef_url) || '';
    logoPicker.setValue((initial && initial.logo_url) || '');
    kategoriValue = initial && initial.kategori != null ? String(initial.kategori) : '';
    refs.kategori.value = kategoriValue;
    localErr = '';
  }

  function setBusy(next) {
    refs.submitBtn.disabled = next;
    refs.submitBtn.textContent = next ? 'Kaydediliyor…' : 'Kaydet';
  }

  function onSubmit(e) {
    e.preventDefault();
    localErr = '';
    if (!refs.hedefUrl.value.trim()) {
      localErr = 'Hedef URL zorunludur.';
      showAlert('danger', err || localErr, onDangerClose);
      return;
    }
    if (!refs.kategori.value) {
      localErr = 'Kategori seçiniz.';
      showAlert('danger', err || localErr, onDangerClose);
      return;
    }

    var payload = {
      baslik: refs.baslik.value.trim(),
      hedef_url: refs.hedefUrl.value.trim(),
      logo_url: logoPicker.getValue().trim() || null,
      kategori: Number(refs.kategori.value),
    };

    setBusy(true);
    err = '';
    hideAlert('danger');

    if (MODE === 'create') {
      AdminApi.createYardimciLink(payload)
        .then(function () {
          AdminConfig.goto('/admin/yardimci-linkler');
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
      AdminApi.updateYardimciLink(Portal.param('id'), payload)
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

  function init() {
    if (MODE === 'edit') {
      AdminApi.getYardimciLink(Portal.param('id'))
        .then(function (data) {
          initial = data;
          renderForm();
        })
        .catch(function (ex) {
          /* React: err doluyken form boş initial ile render edilir */
          err = ex.message;
          renderForm();
          showAlert('danger', err, onDangerClose);
        });
    } else {
      renderForm();
    }
  }

  Portal.onReady(init);
})();
