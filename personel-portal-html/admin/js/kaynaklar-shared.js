/*
 * Genel Kaynaklar CRUD (Dokümanlar / Mevzuatlar / Eğitimler) —
 * React admin/src/pages/kaynaklar/KaynaklarPages.jsx birebir karşılığı.
 * Üç modül aynı parametrik bileşen ailesini paylaşır; slug + mod
 * body[data-route] üzerinden belirlenir:
 *   /admin/dokumanlar          → liste
 *   /admin/dokumanlar/ekle     → ekle
 *   /admin/dokumanlar/duzenle  → düzenle (?id=N)
 * (mevzuatlar / egitimler aynı şekilde).
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };

  var META = {
    dokumanlar: {
      title: 'Dokümanlar',
      icon: 'fas fa-file-alt',
      base: '/admin/dokumanlar',
      defaultIcon: 'fas fa-file-alt',
    },
    mevzuatlar: {
      title: 'Mevzuatlar',
      icon: 'fas fa-balance-scale',
      base: '/admin/mevzuatlar',
      defaultIcon: 'fas fa-folder-open',
    },
    egitimler: {
      title: 'Eğitimler',
      icon: 'fas fa-graduation-cap',
      base: '/admin/egitimler',
      defaultIcon: 'fas fa-graduation-cap',
    },
  };

  function apiFor(slug) {
    if (slug === 'dokumanlar') return AdminApi.dokumanlarApi;
    if (slug === 'mevzuatlar') return AdminApi.mevzuatlarApi;
    return AdminApi.egitimlerApi;
  }

  function toDateInput(value) {
    if (!value) return '';
    var raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    var m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return '';
    return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  }

  function fromDateInput(value) {
    if (!value) return '';
    var m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return value;
    return m[3] + '.' + m[2] + '.' + m[1];
  }

  function displayDate(value) {
    if (!value) return '—';
    var iso = toDateInput(value);
    if (!iso) return value;
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR');
    } catch (e) {
      return value;
    }
  }

  function shortLink(url) {
    if (!url) return '—';
    try {
      var u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch (e) {
      var clean = String(url).replace(/^\.\.\//, '');
      return clean.length > 36 ? clean.slice(0, 34) + '…' : clean;
    }
  }

  /**
   * React'ta '../images/...' → '/images/...' (dev sunucusu kökünden açılsın).
   * Statik sürümde aynı amaç için Portal.asset kök önekini ekler
   * (admin-widgets içindeki toHref ile aynı dönüşüm).
   */
  function fileHref(path) {
    if (!path) return '';
    var raw = String(path).trim();
    if (!raw) return '';
    if (/^(https?:|blob:|data:)/i.test(raw)) return raw;
    var clean = raw.replace(/^\.\.\//, '');
    return Portal.asset(clean.indexOf('/') === 0 ? clean : '/' + clean);
  }

  /* ─── Index ─── */

  function initIndex(slug) {
    var meta = META[slug];
    var api = apiFor(slug);

    var rows = [];
    var err = '';
    var loading = true;

    function setRowsFrom(data) {
      rows = Array.isArray(data) ? data : data.results || [];
    }

    function render() {
      var content = AdminLayout.content;
      content.innerHTML = '';

      var module = document.createElement('div');
      module.className = 'admin-module';
      content.appendChild(module);

      module.insertAdjacentHTML(
        'beforeend',
        '<header class="admin-page-head">' +
          '<div class="admin-page-head__text">' +
          '<h2><i class="' + meta.icon + '" aria-hidden="true"></i>' + esc(meta.title) + '</h2>' +
          '</div>' +
          '<div class="admin-page-head__actions">' +
          '<span class="admin-count-pill">Toplam <strong>' + rows.length + '</strong></span>' +
          '<a href="' + AdminConfig.href(meta.base + '/ekle') + '" class="admin-btn admin-btn-primary">' +
          '<i class="fas fa-plus" aria-hidden="true"></i> Yeni Kayıt' +
          '</a>' +
          '</div>' +
          '</header>'
      );

      if (err) {
        module.appendChild(
          AdminWidgets.alert({
            type: 'danger',
            text: err,
            onClose: function () {
              err = '';
              render();
            },
          })
        );
      }

      var bodyHtml = '';
      if (loading) {
        bodyHtml = '<tr><td colspan="7" class="admin-empty">Yükleniyor…</td></tr>';
      } else if (rows.length === 0) {
        bodyHtml = '<tr><td colspan="7" class="admin-empty">Henüz kayıt yok. Yeni ekleyin.</td></tr>';
      } else {
        rows.forEach(function (row, index) {
          bodyHtml +=
            '<tr>' +
            '<td class="admin-td-index">' + (index + 1) + '</td>' +
            '<td class="admin-td-media">' +
            '<span class="admin-icon-pill" title="' + esc(row.ikon || '') + '">' +
            '<i class="' + esc(row.ikon || meta.defaultIcon) + '" aria-hidden="true"></i>' +
            '</span>' +
            '</td>' +
            '<td>' +
            '<div class="admin-row-title">' + esc(row.baslik) + '</div>' +
            (row.aciklama
              ? '<div class="admin-row-meta">' +
                esc(row.aciklama.length > 110 ? row.aciklama.slice(0, 108) + '…' : row.aciklama) +
                '</div>'
              : '') +
            '</td>' +
            '<td>' +
            (row.dosya_yolu
              ? '<a href="' + esc(fileHref(row.dosya_yolu)) + '" target="_blank" rel="noreferrer" class="admin-link-muted">' +
                esc(shortLink(row.dosya_yolu)) +
                '</a>'
              : '—') +
            '</td>' +
            '<td class="admin-td-nowrap">' + esc(row.boyut || '—') + '</td>' +
            '<td class="admin-td-nowrap">' + esc(displayDate(row.tarih)) + '</td>' +
            '<td></td>' +
            '</tr>';
        });
      }

      module.insertAdjacentHTML(
        'beforeend',
        '<div class="admin-card admin-card--flush">' +
          '<div class="admin-table-wrap">' +
          '<table class="admin-table admin-table--crud admin-table--kaynak">' +
          '<thead>' +
          '<tr><th>#</th><th>İkon</th><th>Başlık</th><th>Dosya</th><th>Boyut</th><th>Tarih</th><th>İşlem</th></tr>' +
          '</thead>' +
          '<tbody>' + bodyHtml + '</tbody>' +
          '</table>' +
          '</div>' +
          '</div>'
      );

      if (!loading) {
        var trs = module.querySelectorAll('tbody tr');
        rows.forEach(function (row, index) {
          trs[index].lastElementChild.appendChild(
            AdminWidgets.rowActions({
              editTo: meta.base + '/' + row.id + '/duzenle',
              onDelete: function () {
                onDelete(row.id);
              },
            })
          );
        });
      }
    }

    function onDelete(id) {
      if (!window.confirm('Bu kaydı silmek istiyor musunuz?')) return;
      api
        .delete(id)
        .then(function () {
          loading = true;
          render();
          return api.list().then(setRowsFrom);
        })
        .catch(function (ex) {
          err = ex.message;
        })
        .finally(function () {
          loading = false;
          render();
        });
    }

    loading = true;
    err = '';
    rows = [];
    api
      .list()
      .then(setRowsFrom)
      .catch(function (ex) {
        err = ex.message;
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  /* ─── Form (KaynakForm) ─── */

  function formHtml(slug, mode) {
    var meta = META[slug];
    return (
      '<div class="admin-module">' +
      '<header class="admin-page-head">' +
      '<div class="admin-page-head__text">' +
      '<h2><i class="' + meta.icon + '" aria-hidden="true"></i>' +
      esc(mode === 'edit' ? meta.title + ' — Düzenle' : meta.title + ' — Yeni') +
      '</h2>' +
      '</div>' +
      '<div class="admin-page-head__actions">' +
      '<a href="' + AdminConfig.href(meta.base) + '" class="admin-btn admin-btn-secondary">' +
      '<i class="fas fa-arrow-left" aria-hidden="true"></i> Listeye dön' +
      '</a>' +
      '</div>' +
      '</header>' +
      '<div class="admin-crud-form-shell">' +
      '<div class="admin-card">' +
      '<div class="admin-card-body">' +
      '<form class="admin-form admin-form--grid">' +
      '<div class="admin-form__main">' +
      '<label>Başlık<input required maxlength="255" placeholder="Kaynak başlığı" /></label>' +
      '<label>Açıklama<textarea rows="5" required placeholder="Açıklama / özet"></textarea></label>' +
      '<div class="admin-form__row-2">' +
      '<label>Boyut<input required placeholder="Örn: 1.7 MB" /></label>' +
      '<label>Tarih<input type="date" required /></label>' +
      '</div>' +
      '<label>Resmi sayfa (opsiyonel)<input placeholder="https://www.mevzuat.gov.tr/…" /></label>' +
      '</div>' +
      '<div class="admin-form__side"></div>' +
      '<div class="admin-form__actions admin-form__span-2">' +
      '<button type="submit" class="admin-btn admin-btn-primary">Kaydet</button>' +
      '<a href="' + AdminConfig.href(meta.base) + '" class="admin-btn admin-btn-secondary">İptal</a>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function setupForm(slug, mode, initial, onSubmit) {
    var meta = META[slug];
    var content = AdminLayout.content;
    content.innerHTML = formHtml(slug, mode);

    var cardBody = content.querySelector('.admin-card-body');
    var form = content.querySelector('form.admin-form');
    var main = form.querySelector('.admin-form__main');
    var side = form.querySelector('.admin-form__side');
    var fields = main.querySelectorAll('input, textarea');
    var baslikInput = fields[0];
    var aciklamaInput = fields[1];
    var boyutInput = fields[2];
    var tarihInput = fields[3];
    var resmiSayfaInput = fields[4];
    var submitBtn = form.querySelector('button[type="submit"]');

    var iconField = AdminWidgets.iconSelectField({
      value: (initial && initial.ikon) || meta.defaultIcon,
      defaultIcon: meta.defaultIcon,
      label: 'İkon değiştir',
    });
    var pdfField = AdminWidgets.pdfPickerField({
      value: (initial && initial.dosya_yolu) || '',
      onUploaded: function (info) {
        if (info && info.size_label) boyutInput.value = info.size_label;
      },
      mode: 'document',
      label: 'Dosya değiştir',
    });
    side.appendChild(iconField.el);
    side.appendChild(pdfField.el);

    function applyInitial(data) {
      baslikInput.value = (data && data.baslik) || '';
      aciklamaInput.value = (data && data.aciklama) || '';
      boyutInput.value = (data && data.boyut) || '';
      tarihInput.value = toDateInput(data && data.tarih);
      resmiSayfaInput.value = (data && data.resmi_sayfa) || '';
      iconField.setValue((data && data.ikon) || meta.defaultIcon);
      pdfField.setValue((data && data.dosya_yolu) || '');
    }

    applyInitial(initial);

    var alerts = { success: null, danger: null };

    function clearAlert(kind) {
      if (alerts[kind]) alerts[kind].dismiss();
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

    function setBusy(busy) {
      submitBtn.disabled = busy;
      submitBtn.textContent = busy ? 'Kaydediliyor…' : 'Kaydet';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dosyaYolu = pdfField.getValue() || '';
      if (!dosyaYolu.trim()) {
        clearAlert('danger');
        showAlert('danger', 'Dosya zorunludur. Sağdaki alandan seçin veya URL yapıştırın.');
        return;
      }
      clearAlert('danger');
      onSubmit({
        baslik: baslikInput.value.trim(),
        aciklama: aciklamaInput.value.trim(),
        ikon: iconField.getValue() || meta.defaultIcon,
        dosya_yolu: dosyaYolu.trim(),
        resmi_sayfa: resmiSayfaInput.value.trim() || null,
        boyut: boyutInput.value.trim(),
        tarih: fromDateInput(tarihInput.value) || tarihInput.value.trim(),
      });
    });

    return {
      applyInitial: applyInitial,
      showAlert: showAlert,
      clearAlert: clearAlert,
      setBusy: setBusy,
    };
  }

  /* ─── Ekle ─── */

  function initEkle(slug) {
    var meta = META[slug];
    var api = apiFor(slug);

    var ui = setupForm(slug, 'create', null, function (payload) {
      ui.setBusy(true);
      ui.clearAlert('danger');
      api
        .create(payload)
        .then(function () {
          AdminConfig.goto(meta.base);
        })
        .catch(function (ex) {
          ui.showAlert('danger', ex.message);
        })
        .finally(function () {
          ui.setBusy(false);
        });
    });
  }

  /* ─── Düzenle ─── */

  function initDuzenle(slug) {
    var api = apiFor(slug);
    var id = Portal.param('id');
    var content = AdminLayout.content;

    api
      .get(id)
      .then(function (initial) {
        var ui = setupForm(slug, 'edit', initial, function (payload) {
          ui.setBusy(true);
          ui.clearAlert('danger');
          ui.clearAlert('success');
          api
            .update(id, payload)
            .then(function (updated) {
              ui.applyInitial(updated);
              ui.showAlert('success', 'Kayıt başarıyla güncellendi.');
            })
            .catch(function (ex) {
              ui.showAlert('danger', ex.message);
            })
            .finally(function () {
              ui.setBusy(false);
            });
        });
      })
      .catch(function (ex) {
        /* React: !initial && err → yalnızca danger alert; kapatılınca err ''
           olur ve tekrar "Yükleniyor…" görünür. */
        content.innerHTML = '';
        content.appendChild(
          AdminWidgets.alert({
            type: 'danger',
            text: ex.message,
            onClose: function () {
              content.innerHTML = '<p class="admin-muted">Yükleniyor…</p>';
            },
          })
        );
      });
  }

  function init() {
    var m = /^\/admin\/(dokumanlar|mevzuatlar|egitimler)(?:\/(ekle|duzenle))?$/.exec(Portal.route());
    if (!m) return;
    if (m[2] === 'ekle') initEkle(m[1]);
    else if (m[2] === 'duzenle') initDuzenle(m[1]);
    else initIndex(m[1]);
  }

  Portal.onReady(init);
})();
