/*
 * Video formu — React admin/src/pages/videolar/VideolarPages.jsx
 * (VideoForm + VideolarEkle + VideolarDuzenle) birebir karşılığı.
 * videolar-ekle.html ve videolar-duzenle.html tarafından paylaşılır.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var MODE = Portal.route() === '/admin/videolar/duzenle' ? 'edit' : 'create';

  var initial = null;
  var err = '';
  var msg = '';
  var kategoriler = [];
  var kategoriValue = '';

  var alerts = { success: null, danger: null };
  var refs = null;

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
    err = '';
    /* VideolarDuzenle: initial yokken err kapatılınca tekrar yükleme durumu */
    if (MODE === 'edit' && !initial) {
      alerts = { success: null, danger: null };
      content().innerHTML = '<p class="admin-muted">Yükleniyor…</p>';
    }
  }

  /* ─── Form render ─── */

  function previewHtml(youtubeId) {
    var preview = youtubeId
      ? 'https://img.youtube.com/vi/' + youtubeId + '/hqdefault.jpg'
      : '';
    if (preview) {
      return '<img src="' + esc(preview) + '" alt="" />';
    }
    return (
      '<div class="admin-form-preview__empty">' +
      '<i class="fas fa-video" aria-hidden="true"></i>' +
      'YouTube önizleme' +
      '</div>'
    );
  }

  function kategoriOptionsHtml() {
    var html = '<option value="">Seçiniz</option>';
    kategoriler.forEach(function (k) {
      html += '<option value="' + esc(k.id) + '">' + esc(k.ad) + '</option>';
    });
    return html;
  }

  function updatePreview() {
    var box = refs.previewBox;
    box.innerHTML = previewHtml(refs.youtubeId.value);
    var img = box.querySelector('img');
    if (img) {
      img.addEventListener('error', function () {
        img.src = Portal.BRAND_IMG;
      });
    }
  }

  function renderForm() {
    var v = {
      youtube_id: (initial && initial.youtube_id) || '',
      baslik: (initial && initial.baslik) || '',
      aciklama: (initial && initial.aciklama) || '',
      sure: (initial && initial.sure) || '',
      kategori: initial && initial.kategori ? String(initial.kategori) : '',
      vitrin: String(initial && initial.vitrin != null ? initial.vitrin : 0),
      vitrin_baslik: (initial && initial.vitrin_baslik) || '',
      vitrin_aciklama: (initial && initial.vitrin_aciklama) || '',
    };
    kategoriValue = v.kategori;

    content().innerHTML =
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-video" aria-hidden="true"></i>' +
      (MODE === 'edit' ? 'Video düzenle' : 'Yeni video') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/videolar') + '" class="admin-btn admin-btn-secondary">' +
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
      '<label>YouTube ID<input value="' + esc(v.youtube_id) + '" required placeholder="örn. qLqYPQgUPEc" /></label>' +
      '<label>Açıklama<textarea rows="5">' + esc(v.aciklama) + '</textarea></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Süre<input value="' + esc(v.sure) + '" placeholder="00:30" /></label>' +
      '<label>Kategori<select>' + kategoriOptionsHtml() + '</select></label>' +
      '</div>' +
      '<div class="admin-form__row-2">' +
      '<label>Vitrin<select><option value="0">Hayır</option><option value="1">Evet</option></select></label>' +
      '<label>Vitrin başlık<input value="' + esc(v.vitrin_baslik) + '" /></label>' +
      '</div>' +
      '<label>Vitrin açıklama<textarea rows="3">' + esc(v.vitrin_aciklama) + '</textarea></label>' +
      '</div>' +
      '<div class="admin-form__side">' +
      '<div class="admin-form-preview">' + previewHtml(v.youtube_id) + '</div>' +
      '</div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/videolar') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    alerts = { success: null, danger: null };

    var form = content().querySelector('form');
    var main = form.querySelector('.admin-form__main');
    var fields = main.querySelectorAll('input, textarea, select');
    refs = {
      form: form,
      baslik: fields[0],
      youtubeId: fields[1],
      aciklama: fields[2],
      sure: fields[3],
      kategori: fields[4],
      vitrin: fields[5],
      vitrinBaslik: fields[6],
      vitrinAciklama: fields[7],
      submitBtn: form.querySelector('button[type="submit"]'),
      previewBox: form.querySelector('.admin-form-preview'),
    };

    refs.kategori.value = kategoriValue;
    refs.vitrin.value = v.vitrin;

    var previewImg = refs.previewBox.querySelector('img');
    if (previewImg) {
      previewImg.addEventListener('error', function () {
        previewImg.src = Portal.BRAND_IMG;
      });
    }

    /* React: onChange={(e) => setYoutubeId(e.target.value.trim())} */
    refs.youtubeId.addEventListener('input', function () {
      var trimmed = refs.youtubeId.value.trim();
      if (refs.youtubeId.value !== trimmed) refs.youtubeId.value = trimmed;
      updatePreview();
    });

    refs.kategori.addEventListener('change', function () {
      kategoriValue = refs.kategori.value;
    });

    form.addEventListener('submit', onSubmit);

    /* VideoForm mount effect'i: kategoriler */
    AdminApi.listVideoKategoriler()
      .then(function (data) {
        kategoriler = Array.isArray(data) ? data : [];
      })
      .catch(function () {
        kategoriler = [];
      })
      .finally(function () {
        refs.kategori.innerHTML = kategoriOptionsHtml();
        refs.kategori.value = kategoriValue;
      });
  }

  function setBusy(next) {
    refs.submitBtn.disabled = next;
    refs.submitBtn.textContent = next ? 'Kaydediliyor…' : 'Kaydet';
  }

  function onSubmit(e) {
    e.preventDefault();

    var payload = {
      youtube_id: refs.youtubeId.value,
      baslik: refs.baslik.value,
      aciklama: refs.aciklama.value || '',
      sure: refs.sure.value || '00:00',
      kategori: refs.kategori.value ? Number(refs.kategori.value) : null,
      vitrin: Number(refs.vitrin.value),
      vitrin_baslik: refs.vitrinBaslik.value || null,
      vitrin_aciklama: refs.vitrinAciklama.value || null,
    };

    setBusy(true);
    err = '';
    hideAlert('danger');

    if (MODE === 'create') {
      AdminApi.createVideo(payload)
        .then(function () {
          AdminConfig.goto('/admin/videolar');
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
      AdminApi.updateVideo(Portal.param('id'), payload)
        .then(function () {
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
      AdminApi.getVideo(Portal.param('id'))
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
