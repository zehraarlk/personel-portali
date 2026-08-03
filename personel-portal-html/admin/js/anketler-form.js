/*
 * Anket formu — React admin/src/pages/anketler/AnketlerPages.jsx
 * (AnketForm + AnketlerEkle + AnketlerDuzenle) birebir karşılığı.
 * anketler-ekle.html ve anketler-duzenle.html paylaşır.
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var mode = Portal.route() === '/admin/anketler/ekle' ? 'create' : 'edit';
  var recordId = Portal.param('id');

  var SORU_TIPLERI = [
    { value: 'coktan_secmeli', label: 'Çoktan seçmeli' },
    { value: 'acik_uclu', label: 'Açık uçlu' },
  ];

  var initial = null;
  var busy = false;
  var kategoriler = [];
  var kategorilerLoaded = false;
  var kategoriValue = '';
  var sorular = [];

  var cardBody = null;
  var form = null;
  var refs = {};
  var picker = null;
  var alerts = { success: null, danger: null };

  function emptySoru(sira) {
    sira = sira === undefined ? 1 : sira;
    return {
      key: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      id: null,
      soru_metni: '',
      soru_tipi: 'coktan_secmeli',
      sira: sira,
      secenekler: [
        { key: 's-' + Date.now() + '-a', id: null, secenek_metni: '' },
        { key: 's-' + Date.now() + '-b', id: null, secenek_metni: '' },
      ],
    };
  }

  function mapSorularFromApi(list) {
    if (!Array.isArray(list) || list.length === 0) return [emptySoru(1)];
    return list.map(function (s, i) {
      return {
        key: 'q-' + (s.id || i),
        id: s.id || null,
        soru_metni: s.soru_metni || '',
        soru_tipi: s.soru_tipi || 'coktan_secmeli',
        sira: s.sira || i + 1,
        secenekler:
          s.soru_tipi === 'acik_uclu'
            ? []
            : (s.secenekler || []).map(function (c, j) {
                return {
                  key: 'c-' + (c.id || i + '-' + j),
                  id: c.id || null,
                  secenek_metni: c.secenek_metni || '',
                };
              }),
      };
    });
  }

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

  function populateKategoriler() {
    var select = refs.kategori;
    if (!select) return;
    var html = '<option value="">Seçiniz</option>';
    kategoriler.forEach(function (k) {
      html += '<option value="' + esc(String(k.id)) + '">' + esc(k.ad) + '</option>';
    });
    select.innerHTML = html;
    select.value = kategoriValue;
  }

  function loadKategoriler() {
    if (kategorilerLoaded) return;
    kategorilerLoaded = true;
    AdminApi.listAnketKategoriler()
      .then(function (data) {
        kategoriler = Array.isArray(data) ? data : data.results || [];
      })
      .catch(function () {
        kategoriler = [];
      })
      .finally(function () {
        populateKategoriler();
      });
  }

  /* ── Soru / seçenek dinamik editörü ─────────────────────────────────── */

  function addSoru() {
    sorular.push(emptySoru(sorular.length + 1));
    renderSorular();
  }

  function removeSoru(soru) {
    if (sorular.length <= 1) return;
    sorular = sorular
      .filter(function (s) { return s.key !== soru.key; })
      .map(function (s, i) {
        s.sira = i + 1;
        return s;
      });
    renderSorular();
  }

  function addSecenek(soru) {
    soru.secenekler.push({
      key: 's-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      id: null,
      secenek_metni: '',
    });
    renderSorular();
  }

  function removeSecenek(soru, secenek) {
    soru.secenekler = soru.secenekler.filter(function (c) {
      return c.key !== secenek.key;
    });
    renderSorular();
  }

  function renderSorular() {
    var list = form.querySelector('.admin-anket-sorular__list');
    list.innerHTML = '';

    sorular.forEach(function (soru, index) {
      var el = document.createElement('div');
      el.className = 'admin-anket-soru';

      var tipOptions = '';
      SORU_TIPLERI.forEach(function (t) {
        tipOptions += '<option value="' + t.value + '">' + t.label + '</option>';
      });

      el.innerHTML =
        '<div class="admin-anket-soru__top">' +
        '<strong>Soru ' + (index + 1) + '</strong>' +
        '<button type="button" class="admin-btn admin-btn-danger admin-btn-sm"' +
        (sorular.length <= 1 ? ' disabled' : '') + '>Sil</button>' +
        '</div>' +
        '<div class="admin-anket-soru__fields">' +
        '<label class="admin-anket-soru__metin">Soru metni' +
        '<textarea rows="3" required></textarea>' +
        '</label>' +
        '<label class="admin-anket-soru__tip">Tip' +
        '<select>' + tipOptions + '</select>' +
        '</label>' +
        '</div>';

      var metin = el.querySelector('.admin-anket-soru__metin textarea');
      metin.value = soru.soru_metni;
      metin.addEventListener('input', function () {
        soru.soru_metni = metin.value;
      });

      var tipSelect = el.querySelector('.admin-anket-soru__tip select');
      tipSelect.value = soru.soru_tipi;
      tipSelect.addEventListener('change', function () {
        var tip = tipSelect.value;
        soru.soru_tipi = tip;
        if (tip === 'acik_uclu') {
          soru.secenekler = [];
        } else if (!soru.secenekler || !soru.secenekler.length) {
          soru.secenekler = [
            { key: 's-' + Date.now() + '-a', id: null, secenek_metni: '' },
            { key: 's-' + Date.now() + '-b', id: null, secenek_metni: '' },
          ];
        }
        renderSorular();
      });

      el.querySelector('.admin-anket-soru__top button').addEventListener('click', function () {
        removeSoru(soru);
      });

      if (soru.soru_tipi === 'coktan_secmeli') {
        var secenekler = document.createElement('div');
        secenekler.className = 'admin-anket-secenekler';
        secenekler.innerHTML =
          '<div class="admin-anket-secenekler__head">' +
          '<span>Seçenekler</span>' +
          '<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm">Seçenek ekle</button>' +
          '</div>' +
          '<div class="admin-anket-secenekler__grid"></div>';

        secenekler
          .querySelector('.admin-anket-secenekler__head button')
          .addEventListener('click', function () {
            addSecenek(soru);
          });

        var grid = secenekler.querySelector('.admin-anket-secenekler__grid');
        soru.secenekler.forEach(function (c, ci) {
          var row = document.createElement('div');
          row.className = 'admin-anket-secenek';
          row.innerHTML =
            '<span class="admin-anket-secenek__idx">' + (ci + 1) + '</span>' +
            '<input placeholder="Seçenek ' + (ci + 1) + '" required />' +
            '<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm"' +
            (soru.secenekler.length <= 2 ? ' disabled' : '') +
            ' aria-label="Seçeneği sil">' +
            '<i class="fas fa-times" aria-hidden="true"></i>' +
            '</button>';

          var input = row.querySelector('input');
          input.value = c.secenek_metni;
          input.addEventListener('input', function () {
            c.secenek_metni = input.value;
          });
          row.querySelector('button').addEventListener('click', function () {
            removeSecenek(soru, c);
          });
          grid.appendChild(row);
        });

        el.appendChild(secenekler);
      }

      list.appendChild(el);
    });
  }

  /* ── Payload (React buildPayload birebir) ───────────────────────────── */

  function buildPayload() {
    var cleaned = sorular.map(function (s, i) {
      var tip = s.soru_tipi;
      var row = {
        soru_metni: s.soru_metni.trim(),
        soru_tipi: tip,
        sira: i + 1,
        secenekler:
          tip === 'acik_uclu'
            ? []
            : s.secenekler
                .map(function (c) {
                  var out = c.id ? { id: c.id } : {};
                  out.secenek_metni = c.secenek_metni.trim();
                  return out;
                })
                .filter(function (c) {
                  return c.secenek_metni;
                }),
      };
      if (s.id) row.id = s.id;
      return row;
    });

    for (var i = 0; i < cleaned.length; i += 1) {
      var s = cleaned[i];
      if (!s.soru_metni) {
        throw new Error('Tüm soru metinleri doldurulmalıdır.');
      }
      if (s.soru_tipi === 'coktan_secmeli' && s.secenekler.length < 2) {
        throw new Error('Çoktan seçmeli sorularda en az 2 seçenek olmalıdır.');
      }
    }

    var hedef = refs.hedef.value;
    return {
      baslik: refs.baslik.value.trim(),
      aciklama: refs.aciklama.value.trim() || null,
      resim_url: picker.getValue().trim() || null,
      baslangic_tarihi: refs.baslangic.value || null,
      bitis_tarihi: refs.bitis.value || null,
      hedef_katilim: hedef === '' ? null : Number(hedef),
      favori: Number(refs.favori.value),
      kategori: kategoriValue ? Number(kategoriValue) : null,
      sorular: cleaned,
    };
  }

  function onSubmit(payload) {
    setBusy(true);
    clearAlert('danger');
    if (mode === 'create') {
      AdminApi.createAnket(payload)
        .then(function () {
          AdminConfig.goto('/admin/anketler');
        })
        .catch(function (ex) {
          showAlert('danger', ex.message);
        })
        .finally(function () {
          setBusy(false);
        });
    } else {
      clearAlert('success');
      AdminApi.updateAnket(recordId, payload)
        .then(function (updated) {
          /* React: setInitial(updated) → useEffect [initial] tüm alanları sıfırlar */
          initial = updated;
          renderForm();
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

  /* ── Form render (AnketForm JSX birebir) ────────────────────────────── */

  function renderForm() {
    var content = AdminLayout.content;
    content.innerHTML = '';
    alerts = { success: null, danger: null };

    var module = document.createElement('div');
    module.className = 'admin-module';
    module.innerHTML =
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="fas fa-poll" aria-hidden="true"></i>' +
      (mode === 'edit' ? 'Anket düzenle' : 'Yeni anket') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href('/admin/anketler') + '" class="admin-btn admin-btn-secondary">' +
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
    form.innerHTML =
      '<div class="admin-form__main">' +
      '<label>Başlık<input required /></label>' +
      '<label>Açıklama<textarea rows="4"></textarea></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Başlangıç<input type="date" /></label>' +
      '<label>Bitiş<input type="date" /></label>' +
      '</div>' +
      '<div class="admin-form__row-2">' +
      '<label>Durum<select><option value="">Seçiniz</option></select></label>' +
      '<label>Hedef katılım<input type="number" min="0" placeholder="örn. 200" /></label>' +
      '</div>' +
      '<div class="admin-form__row-2">' +
      '<label>Favori<select><option value="0">Hayır</option><option value="1">Evet</option></select></label>' +
      (mode === 'edit'
        ? '<label>Katılım sayısı<input disabled readonly /></label>'
        : '<div></div>') +
      '</div>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-anket-sorular admin-form__span-2">' +
      '<div class="admin-anket-sorular__head">' +
      '<div>' +
      '<h3>Sorular</h3>' +
      '<p class="admin-anket-sorular__hint">' +
      'Anket sorularını sırayla ekleyin; çoktan seçmeli için en az iki seçenek gerekir.' +
      '</p>' +
      '</div>' +
      '<button type="button" class="admin-btn admin-btn-secondary">' +
      '<i class="fas fa-plus" aria-hidden="true"></i> Soru ekle' +
      '</button>' +
      '</div>' +
      '<div class="admin-anket-sorular__list"></div>' +
      '</div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href('/admin/anketler') + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>';

    var mainLabels = form.querySelectorAll('.admin-form__main label');
    refs = {
      baslik: mainLabels[0].querySelector('input'),
      aciklama: mainLabels[1].querySelector('textarea'),
      baslangic: mainLabels[2].querySelector('input'),
      bitis: mainLabels[3].querySelector('input'),
      kategori: mainLabels[4].querySelector('select'),
      hedef: mainLabels[5].querySelector('input'),
      favori: mainLabels[6].querySelector('select'),
    };
    if (mode === 'edit') refs.katilim = mainLabels[7].querySelector('input');

    refs.baslik.value = (initial && initial.baslik) || '';
    refs.aciklama.value = (initial && initial.aciklama) || '';
    refs.baslangic.value = (initial && initial.baslangic_tarihi) || '';
    refs.bitis.value = (initial && initial.bitis_tarihi) || '';
    refs.hedef.value =
      initial && initial.hedef_katilim != null ? String(initial.hedef_katilim) : '';
    refs.favori.value = String(initial && initial.favori != null ? initial.favori : 0);
    kategoriValue = initial && initial.kategori != null ? String(initial.kategori) : '';
    populateKategoriler();
    refs.kategori.addEventListener('change', function () {
      kategoriValue = refs.kategori.value;
    });
    if (refs.katilim) {
      refs.katilim.value = String(
        initial && initial.katilim_sayisi != null ? initial.katilim_sayisi : 0
      );
    }

    picker = AdminWidgets.imagePickerField({
      value: (initial && initial.resim_url) || '',
      label: 'Kapak görseli',
    });
    form.querySelector('.admin-form__side').appendChild(picker.el);

    sorular = mapSorularFromApi(initial && initial.sorular);
    renderSorular();

    form
      .querySelector('.admin-anket-sorular__head > button')
      .addEventListener('click', addSoru);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAlert('danger');
      var payload;
      try {
        payload = buildPayload();
      } catch (ex) {
        showAlert('danger', ex.message);
        return;
      }
      onSubmit(payload);
    });

    cardBody.appendChild(form);
    content.appendChild(module);
  }

  function init() {
    if (mode === 'edit') {
      AdminApi.getAnket(recordId)
        .then(function (data) {
          initial = data;
          renderForm();
          loadKategoriler();
        })
        .catch(function (ex) {
          /* React: err set → form yine de render edilir (initial null) + hata alert'i */
          renderForm();
          loadKategoriler();
          showAlert('danger', ex.message);
        });
    } else {
      renderForm();
      loadKategoriler();
    }
  }

  Portal.onReady(init);
})();
