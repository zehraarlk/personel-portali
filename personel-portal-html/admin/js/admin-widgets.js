/*
 * Admin widget'ları — React bileşenlerinin yeniden kullanılabilir vanilla portları:
 *   AdminAlert.jsx       → AdminWidgets.alert(opts)            → HTMLElement
 *   AdminRowActions.jsx  → AdminWidgets.rowActions(opts)       → HTMLElement
 *   IconSelectField.jsx  → AdminWidgets.iconSelectField(opts)  → { el, getValue, setValue }
 *   ImagePickerField.jsx → AdminWidgets.imagePickerField(opts) → { el, getValue, setValue }
 *   PdfPickerField.jsx   → AdminWidgets.pdfPickerField(opts)   → { el, getValue, setValue }
 *
 * Bağımlılıklar: Portal, Session, AdminApi, Media (../js/media.js).
 */
(function () {
  'use strict';

  var esc = function (v) { return Portal.escapeHtml(v); };
  var uid = 0;

  /* ════════════════════════════════════════════════════════════════════
   * AdminAlert — işlem sonucu bildirimi (görünür animasyon + scroll).
   * opts: { type: 'success'|'danger', text, onClose }
   * Not: Oluşturduktan hemen sonra DOM'a ekleyin (scroll/focus rAF ile çalışır).
   * Kapatma / otomatik kapanma öğeyi DOM'dan kaldırır, sonra onClose çağrılır.
   * onClose verilmezse kapat düğmesi render edilmez (React ile aynı).
   * ════════════════════════════════════════════════════════════════════ */
  function alertWidget(opts) {
    opts = opts || {};
    var type = opts.type || 'success';
    var text = opts.text || '';
    var onClose = opts.onClose;

    var icon = type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation';
    var title = type === 'success' ? 'Başarılı' : 'Hata';

    var el = document.createElement('div');
    el.className = 'admin-alert admin-alert-' + type + ' admin-alert--flash';
    el.setAttribute('role', 'alert');
    el.setAttribute('tabindex', '-1');
    el.innerHTML =
      '<span class="admin-alert__icon" aria-hidden="true"><i class="' + icon + '"></i></span>' +
      '<div class="admin-alert__body">' +
      '<strong class="admin-alert__title">' + title + '</strong>' +
      '<p class="admin-alert__text">' + esc(text) + '</p>' +
      '</div>' +
      (onClose
        ? '<button type="button" class="admin-alert__close" aria-label="Kapat">' +
          '<i class="fas fa-times" aria-hidden="true"></i>' +
          '</button>'
        : '');

    var t1 = 0;
    var t2 = 0;
    var t3 = 0;

    function reveal() {
      var topbar =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--admin-topbar-h')
        ) || 64;
      var gap = 16;
      var y = el.getBoundingClientRect().top + window.scrollY - topbar - gap;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      el.focus({ preventScroll: true });
    }

    function dismiss() {
      window.cancelAnimationFrame(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      if (el.parentNode) el.parentNode.removeChild(el);
      if (typeof onClose === 'function') onClose();
    }

    /* Layout/animasyon sonrası kesin görünsün */
    t1 = window.requestAnimationFrame(reveal);
    t2 = window.setTimeout(reveal, 80);

    if (type === 'success' && onClose) {
      t3 = window.setTimeout(dismiss, 4500);
    }

    var closeBtn = el.querySelector('.admin-alert__close');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    el.dismiss = dismiss;
    return el;
  }

  /* ════════════════════════════════════════════════════════════════════
   * AdminRowActions — liste satırı işlemleri (Düzenle / Sil dropdown'u).
   * opts: { editTo, onDelete, label = 'İşlem' }
   * editTo '/' ile başlıyorsa admin rotası kabul edilir (AdminConfig.goto),
   * aksi halde doğrudan href olarak kullanılır.
   * ════════════════════════════════════════════════════════════════════ */
  function rowActions(opts) {
    opts = opts || {};
    var editTo = opts.editTo;
    var onDelete = opts.onDelete;
    var label = opts.label === undefined ? 'İşlem' : opts.label;

    var root = document.createElement('div');
    root.className = 'admin-row-actions';
    root.innerHTML =
      '<button type="button" class="admin-row-actions__trigger"' +
      ' aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(label) + '">' +
      esc(label) +
      '<i class="fas fa-chevron-down" aria-hidden="true"></i>' +
      '</button>';

    var trigger = root.querySelector('.admin-row-actions__trigger');
    var chevron = trigger.querySelector('.fas');
    var open = false;
    var menu = null;
    var unlocked = [];

    /** overflow:auto/hidden ataları menüyü kesmesin diye geçici aç */
    function unlockOverflow() {
      unlocked = [];
      var el = root.parentElement;
      while (el && el !== document.body) {
        var style = window.getComputedStyle(el);
        var ox = style.overflowX;
        var oy = style.overflowY;
        var o = style.overflow;
        if (
          ox === 'auto' ||
          ox === 'scroll' ||
          ox === 'hidden' ||
          oy === 'auto' ||
          oy === 'scroll' ||
          oy === 'hidden' ||
          o === 'auto' ||
          o === 'scroll' ||
          o === 'hidden'
        ) {
          unlocked.push({
            el: el,
            overflow: el.style.overflow,
            overflowX: el.style.overflowX,
            overflowY: el.style.overflowY,
          });
          el.style.overflow = 'visible';
          el.style.overflowX = 'visible';
          el.style.overflowY = 'visible';
        }
        el = el.parentElement;
      }
    }

    function restoreOverflow() {
      unlocked.forEach(function (item) {
        item.el.style.overflow = item.overflow;
        item.el.style.overflowX = item.overflowX;
        item.el.style.overflowY = item.overflowY;
      });
      unlocked = [];
    }

    function onDoc(e) {
      if (!root.contains(e.target)) close();
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    function openMenu() {
      if (open) return;
      open = true;
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      chevron.className = 'fas fa-chevron-up';

      menu = document.createElement('div');
      menu.className = 'admin-row-actions__menu';
      menu.setAttribute('role', 'menu');
      menu.innerHTML =
        '<button type="button" role="menuitem" class="admin-row-actions__item" data-edit>' +
        '<i class="fas fa-pen" aria-hidden="true"></i>' +
        'Düzenle' +
        '</button>' +
        '<button type="button" role="menuitem" class="admin-row-actions__item is-danger" data-delete>' +
        '<i class="fas fa-trash" aria-hidden="true"></i>' +
        'Sil' +
        '</button>';

      menu.querySelector('[data-edit]').addEventListener('click', function () {
        close();
        if (editTo) {
          if (String(editTo).indexOf('/') === 0) AdminConfig.goto(editTo);
          else window.location.href = editTo;
        }
      });
      menu.querySelector('[data-delete]').addEventListener('click', function () {
        close();
        if (typeof onDelete === 'function') onDelete();
      });

      /* Butonun hemen altında, sağa hizalı — fixed koordinat hatası yok */
      unlockOverflow();
      root.appendChild(menu);
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('keydown', onKey);
    }

    function close() {
      if (!open) return;
      open = false;
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      chevron.className = 'fas fa-chevron-down';
      if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
      menu = null;
      restoreOverflow();
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (open) close();
      else openMenu();
    });

    return root;
  }

  /* ════════════════════════════════════════════════════════════════════
   * IconSelectField — site_ikonlari listesinden görsel ikon seçici.
   * opts: { value, onChange, defaultIcon = 'fas fa-file-alt', label = 'İkon değiştir' }
   * value: Font Awesome sınıfı (örn. "fas fa-hospital")
   * ════════════════════════════════════════════════════════════════════ */
  function normalizeIconOptions(items) {
    var seen = {};
    var options = [];
    (items || []).forEach(function (item) {
      var value = item && item.ikon_sinifi ? String(item.ikon_sinifi).trim() : '';
      if (!value || seen[value]) return;
      seen[value] = true;
      options.push({
        value: value,
        label:
          (item && item.ad && String(item.ad).trim()) ||
          (item && item.anahtar && String(item.anahtar).trim()) ||
          value,
        kategori: (item && item.kategori) || '',
      });
    });
    return options;
  }

  function iconSelectField(opts) {
    opts = opts || {};
    var value = opts.value || '';
    var onChange = opts.onChange;
    var defaultIcon = opts.defaultIcon === undefined ? 'fas fa-file-alt' : opts.defaultIcon;
    var label = opts.label === undefined ? 'İkon değiştir' : opts.label;

    uid += 1;
    var listId = 'admin-icon-select-list-' + uid;

    var options = [];
    var loading = true;
    var query = '';
    var open = false;

    var root = document.createElement('div');
    root.className = 'admin-icon-picker';
    root.innerHTML =
      '<span class="admin-image-picker__label">' + esc(label) + '</span>' +
      '<div class="admin-form-preview admin-form-preview--icon">' +
      '<div class="admin-form-preview__empty">' +
      '<i aria-hidden="true"></i>' +
      '<span></span>' +
      '</div>' +
      '</div>' +
      '<div class="admin-icon-select">' +
      '<button type="button" class="admin-icon-select__trigger"' +
      ' aria-haspopup="listbox" aria-expanded="false" aria-controls="' + listId + '">' +
      '<span class="admin-icon-select__current">' +
      '<i aria-hidden="true"></i>' +
      '<span class="admin-icon-select__text">' +
      '<strong></strong>' +
      '<small></small>' +
      '</span>' +
      '</span>' +
      '<i class="fas fa-chevron-down admin-icon-select__chevron" aria-hidden="true"></i>' +
      '</button>' +
      '</div>';

    var previewIcon = root.querySelector('.admin-form-preview__empty i');
    var previewLabel = root.querySelector('.admin-form-preview__empty span');
    var selectWrap = root.querySelector('.admin-icon-select');
    var trigger = root.querySelector('.admin-icon-select__trigger');
    var currentIcon = root.querySelector('.admin-icon-select__current i');
    var currentLabel = root.querySelector('.admin-icon-select__current strong');
    var currentValue = root.querySelector('.admin-icon-select__current small');
    var chevron = root.querySelector('.admin-icon-select__chevron');
    var panel = null;
    var listEl = null;

    function current() {
      return value || defaultIcon;
    }

    function selectedOption() {
      var cur = current();
      for (var i = 0; i < options.length; i += 1) {
        if (options[i].value === cur) return options[i];
      }
      return cur ? { value: cur, label: cur } : null;
    }

    function filteredOptions() {
      var q = query.trim();
      if (!q) return options;
      q = q.toLocaleLowerCase('tr-TR');
      return options.filter(function (o) {
        return (
          o.label.toLocaleLowerCase('tr-TR').indexOf(q) !== -1 ||
          o.value.toLocaleLowerCase('tr-TR').indexOf(q) !== -1 ||
          (o.kategori || '').toLocaleLowerCase('tr-TR').indexOf(q) !== -1
        );
      });
    }

    function renderCurrent() {
      var cur = current();
      var sel = selectedOption();
      previewIcon.className = cur;
      previewLabel.textContent = (sel && sel.label) || 'Önizleme';
      currentIcon.className = cur;
      currentLabel.textContent = (sel && sel.label) || 'İkon seç';
      currentValue.textContent = cur;
    }

    function renderList() {
      if (!listEl) return;
      var cur = current();
      var filtered = filteredOptions();
      var html = '';
      if (loading) {
        html = '<li class="admin-icon-select__empty">İkonlar yükleniyor…</li>';
      } else if (filtered.length === 0) {
        html = '<li class="admin-icon-select__empty">İkon bulunamadı.</li>';
      } else {
        filtered.forEach(function (opt) {
          var active = opt.value === cur;
          html +=
            '<li role="option" aria-selected="' + (active ? 'true' : 'false') + '">' +
            '<button type="button" class="admin-icon-select__option' +
            (active ? ' is-active' : '') + '" data-value="' + esc(opt.value) + '">' +
            '<i class="' + esc(opt.value) + '" aria-hidden="true"></i>' +
            '<span class="admin-icon-select__text">' +
            '<strong>' + esc(opt.label) + '</strong>' +
            '<small>' + esc(opt.value) + '</small>' +
            '</span>' +
            (active
              ? '<i class="fas fa-check admin-icon-select__check" aria-hidden="true"></i>'
              : '') +
            '</button>' +
            '</li>';
        });
      }
      listEl.innerHTML = html;
      listEl.querySelectorAll('.admin-icon-select__option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          pick(btn.getAttribute('data-value'));
        });
      });
    }

    function pick(next) {
      value = next;
      if (typeof onChange === 'function') onChange(next);
      closePanel();
      query = '';
      renderCurrent();
    }

    function onDocClick(e) {
      if (!root.contains(e.target)) closePanel();
    }

    function onKey(e) {
      if (e.key === 'Escape') closePanel();
    }

    function openPanel() {
      if (open) return;
      open = true;
      selectWrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      chevron.className = 'fas fa-chevron-up admin-icon-select__chevron';

      panel = document.createElement('div');
      panel.className = 'admin-icon-select__panel';
      panel.setAttribute('role', 'presentation');
      panel.innerHTML =
        '<input type="search" class="admin-icon-select__search" placeholder="İkon ara…" />' +
        '<ul id="' + listId + '" class="admin-icon-select__list" role="listbox"' +
        ' aria-label="Site ikonları"></ul>';

      var search = panel.querySelector('.admin-icon-select__search');
      search.value = query;
      search.addEventListener('input', function () {
        query = search.value;
        renderList();
      });

      listEl = panel.querySelector('.admin-icon-select__list');
      selectWrap.appendChild(panel);
      renderList();
      search.focus();

      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
    }

    function closePanel() {
      if (!open) return;
      open = false;
      selectWrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      chevron.className = 'fas fa-chevron-down admin-icon-select__chevron';
      if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
      panel = null;
      listEl = null;
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    }

    trigger.addEventListener('click', function () {
      if (open) closePanel();
      else openPanel();
    });

    renderCurrent();

    AdminApi.fetchSiteIcons()
      .then(function (data) {
        options = normalizeIconOptions((data && data.items) || []);
      })
      .catch(function () {
        options = [];
      })
      .finally(function () {
        loading = false;
        renderCurrent();
        renderList();
      });

    return {
      el: root,
      getValue: function () {
        return value;
      },
      setValue: function (next) {
        value = next || '';
        renderCurrent();
        renderList();
      },
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * Görsel / belge yolu yardımcıları (React'ta '/...' dev sunucudan gelirdi;
   * statik sürümde Portal.asset ile ../../images/... köküne çevrilir).
   * ════════════════════════════════════════════════════════════════════ */
  function toPreviewSrc(path) {
    if (!path) return '';
    if (
      path.indexOf('blob:') === 0 ||
      path.indexOf('data:') === 0 ||
      path.indexOf('http') === 0
    ) {
      return path;
    }
    return Portal.asset(path.replace(/^\.\.\//, '/'));
  }

  /* ════════════════════════════════════════════════════════════════════
   * ImagePickerField — dosya seçici + yükleme.
   * opts: { value, onChange, label = 'Resim', fit: 'cover'|'contain'|'logo' }
   * fit 'logo': PHP admin-img-preview (ortalı contain, max-height 200px).
   * Not: fit != 'logo' önizlemesi Media.frame kullanır → sayfada ../css/media.css
   * yüklü olmalı.
   * ════════════════════════════════════════════════════════════════════ */
  function imagePickerField(opts) {
    opts = opts || {};
    var value = opts.value || '';
    var onChange = opts.onChange;
    var label = opts.label === undefined ? 'Resim' : opts.label;
    var fit = opts.fit || 'cover';

    var uploading = false;
    var error = '';
    var localPreview = '';

    var contain = fit === 'contain';
    var logo = fit === 'logo';

    var root = document.createElement('div');
    root.className = 'admin-image-picker' + (logo ? ' admin-image-picker--logo' : '');

    function revokeLocal() {
      if (localPreview.indexOf('blob:') === 0) URL.revokeObjectURL(localPreview);
    }

    function render() {
      var preview = localPreview || toPreviewSrc(value);
      var html = '';

      if (logo) {
        html +=
          '<div class="admin-img-preview' + (preview ? ' has-image' : '') + '">' +
          (preview
            ? '<img src="' + esc(preview) + '" alt="" decoding="async" />'
            : '<p class="admin-img-preview-empty">' +
              'Önizleme yok — görsel seçildiğinde burada görünür.' +
              '</p>') +
          '</div>';
      } else {
        html +=
          '<div class="admin-form-preview admin-form-preview--media' +
          (preview ? ' has-image' : '') + '">' +
          (preview
            ? ''
            : '<div class="admin-form-preview__empty">' +
              '<i class="fas fa-image" aria-hidden="true"></i>' +
              'Görsel önizleme' +
              '</div>') +
          '</div>';
      }

      html +=
        '<span class="admin-image-picker__label">' + esc(label) + '</span>' +
        '<div class="admin-image-picker__row">' +
        '<input type="file"' +
        ' accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"' +
        ' class="admin-image-picker__file"' + (uploading ? ' disabled' : '') + ' />' +
        '<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" data-pick' +
        (uploading ? ' disabled' : '') + '>' +
        '<i class="fas fa-folder-open" aria-hidden="true"></i> ' +
        (uploading ? 'Yükleniyor…' : 'Dosya seç') +
        '</button>' +
        (value
          ? '<button type="button" class="admin-btn admin-btn-danger admin-btn-sm" data-clear' +
            (uploading ? ' disabled' : '') + '>Kaldır</button>'
          : '') +
        '</div>' +
        (value ? '<div class="admin-image-picker__path">' + esc(value) + '</div>' : '') +
        (error ? '<div class="admin-alert admin-alert-danger">' + esc(error) + '</div>' : '');

      root.innerHTML = html;

      if (!logo && preview) {
        var frame = Media.frame({
          src: preview,
          alt: '',
          className: 'absolute inset-0',
          eager: true,
          forceContain: contain,
          forceCover: !contain,
        });
        root.querySelector('.admin-form-preview--media').appendChild(frame);
      }

      var input = root.querySelector('.admin-image-picker__file');
      input.addEventListener('change', onPick);
      root.querySelector('[data-pick]').addEventListener('click', function () {
        input.click();
      });
      var clearBtn = root.querySelector('[data-clear]');
      if (clearBtn) clearBtn.addEventListener('click', clear);
    }

    async function onPick(e) {
      var file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;

      error = '';
      revokeLocal();
      var blobUrl = URL.createObjectURL(file);
      localPreview = blobUrl;
      uploading = true;
      render();

      try {
        var data = await AdminApi.uploadAdminImage(file);
        value = data.path;
        if (typeof onChange === 'function') onChange(data.path);
        localPreview = '';
        URL.revokeObjectURL(blobUrl);
      } catch (ex) {
        error = ex.message || 'Yükleme başarısız';
        localPreview = '';
        URL.revokeObjectURL(blobUrl);
      } finally {
        uploading = false;
        render();
      }
    }

    function clear() {
      revokeLocal();
      localPreview = '';
      error = '';
      value = '';
      if (typeof onChange === 'function') onChange('');
      render();
    }

    render();

    return {
      el: root,
      getValue: function () {
        return value;
      },
      setValue: function (next) {
        value = next || '';
        render();
      },
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * PdfPickerField — belge seçici + yükleme (PDF / Word / Excel).
   * opts: { value, onChange, onUploaded, label, mode: 'document'|'pdf' }
   * ════════════════════════════════════════════════════════════════════ */
  var DOC_EXT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

  var EXT_META = {
    '.pdf': { icon: 'fas fa-file-pdf', label: 'PDF', colorClass: 'is-pdf' },
    '.doc': { icon: 'fas fa-file-word', label: 'DOC', colorClass: 'is-word' },
    '.docx': { icon: 'fas fa-file-word', label: 'DOCX', colorClass: 'is-word' },
    '.xls': { icon: 'fas fa-file-excel', label: 'XLS', colorClass: 'is-excel' },
    '.xlsx': { icon: 'fas fa-file-excel', label: 'XLSX', colorClass: 'is-excel' },
  };

  function toHref(path) {
    if (!path) return '';
    if (
      path.indexOf('blob:') === 0 ||
      path.indexOf('data:') === 0 ||
      path.indexOf('http') === 0
    ) {
      return path;
    }
    return Portal.asset(path.replace(/^\.\.\//, '/'));
  }

  function shortName(path) {
    if (!path) return '';
    try {
      if (path.indexOf('http') === 0) {
        var u = new URL(path);
        var urlParts = u.pathname.split('/').filter(Boolean);
        return decodeURIComponent(urlParts[urlParts.length - 1] || u.hostname);
      }
    } catch (e) {
      /* ignore */
    }
    var clean = String(path).replace(/^\.\.\//, '');
    var parts = clean.split('/').filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || clean);
  }

  function getExt(pathOrName) {
    if (!pathOrName) return '';
    var clean = String(pathOrName).split('?')[0].split('#')[0];
    var name = clean.indexOf('/') !== -1 ? clean.split('/').pop() : clean;
    var dot = name.lastIndexOf('.');
    if (dot < 0) return '';
    return name.slice(dot).toLowerCase();
  }

  function getMeta(pathOrName) {
    var ext = getExt(pathOrName);
    return (
      EXT_META[ext] || {
        icon: 'fas fa-file-alt',
        label: ext ? ext.replace('.', '').toUpperCase() : 'Dosya',
        colorClass: 'is-file',
      }
    );
  }

  function isAllowedFile(file, mode) {
    var ext = getExt(file.name);
    if (mode === 'pdf') {
      return ext === '.pdf' || file.type === 'application/pdf';
    }
    return DOC_EXT.indexOf(ext) !== -1;
  }

  function pdfPickerField(opts) {
    opts = opts || {};
    var value = opts.value || '';
    var onChange = opts.onChange;
    var onUploaded = opts.onUploaded;
    var label = opts.label;
    var mode = opts.mode || 'document';

    var uploading = false;
    var error = '';

    var accept =
      mode === 'pdf'
        ? 'application/pdf,.pdf'
        : '.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    var root = document.createElement('div');
    root.className = 'admin-pdf-picker';

    /* Kalıcı düğümler: URL girişi her tuş vuruşunda yeniden çizilmesin */
    var urlRow = document.createElement('div');
    urlRow.className = 'admin-pdf-picker__url';
    urlRow.innerHTML =
      '<input placeholder="' +
      (mode === 'pdf' ? 'veya PDF URL yapıştır…' : 'veya dosya URL / yolu yapıştır…') +
      '" />' +
      '<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" disabled>' +
      'Uygula' +
      '</button>';
    var urlInput = urlRow.querySelector('input');
    var urlBtn = urlRow.querySelector('button');

    function syncUrlRow() {
      urlInput.disabled = uploading;
      urlBtn.disabled = uploading || !urlInput.value.trim();
    }

    urlInput.addEventListener('input', syncUrlRow);
    urlBtn.addEventListener('click', applyUrl);

    function fieldLabel() {
      var meta = getMeta(value);
      if (label) return label;
      if (mode === 'pdf') return 'PDF dosyası';
      return value ? meta.label + ' dosyası' : 'Dosya';
    }

    function actionLabel() {
      var meta = getMeta(value);
      if (uploading) return 'Yükleniyor…';
      if (value) return meta.label + ' değiştir';
      return mode === 'pdf' ? 'PDF seç' : 'Dosya seç';
    }

    function render() {
      var href = toHref(value);
      var meta = getMeta(value);

      var html =
        '<div class="admin-form-preview admin-form-preview--pdf admin-form-preview--doc ' +
        meta.colorClass + '">' +
        (value
          ? '<div class="admin-pdf-picker__preview">' +
            '<i class="' + meta.icon + '" aria-hidden="true"></i>' +
            '<span class="admin-pdf-picker__badge">' + esc(meta.label) + '</span>' +
            '<strong title="' + esc(value) + '">' + esc(shortName(value)) + '</strong>' +
            (href
              ? '<a href="' + esc(href) + '" target="_blank" rel="noreferrer"' +
                ' class="admin-link-muted">Aç / indir</a>'
              : '') +
            '</div>'
          : '<div class="admin-form-preview__empty">' +
            '<i class="' + (mode === 'pdf' ? 'fas fa-file-pdf' : 'fas fa-file-upload') +
            '" aria-hidden="true"></i>' +
            (mode === 'pdf' ? 'PDF seçilmedi' : 'Dosya seçilmedi') +
            '</div>') +
        '</div>' +
        '<span class="admin-image-picker__label">' + esc(fieldLabel()) + '</span>' +
        '<div class="admin-image-picker__row">' +
        '<input type="file" accept="' + accept + '" class="admin-image-picker__file"' +
        (uploading ? ' disabled' : '') + ' />' +
        '<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" data-pick' +
        (uploading ? ' disabled' : '') + '>' +
        '<i class="fas fa-upload" aria-hidden="true"></i> ' + esc(actionLabel()) +
        '</button>' +
        (value
          ? '<button type="button" class="admin-btn admin-btn-danger admin-btn-sm" data-clear' +
            (uploading ? ' disabled' : '') + '>Kaldır</button>'
          : '') +
        '</div>';

      root.innerHTML = html;
      root.appendChild(urlRow);

      if (value) {
        var pathDiv = document.createElement('div');
        pathDiv.className = 'admin-image-picker__path';
        pathDiv.textContent = value;
        root.appendChild(pathDiv);
      }
      if (error) {
        var errDiv = document.createElement('div');
        errDiv.className = 'admin-alert admin-alert-danger';
        errDiv.textContent = error;
        root.appendChild(errDiv);
      }

      var input = root.querySelector('.admin-image-picker__file');
      input.addEventListener('change', onPick);
      root.querySelector('[data-pick]').addEventListener('click', function () {
        input.click();
      });
      var clearBtn = root.querySelector('[data-clear]');
      if (clearBtn) clearBtn.addEventListener('click', clear);

      syncUrlRow();
    }

    async function onPick(e) {
      var file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;

      error = '';
      if (!isAllowedFile(file, mode)) {
        error =
          mode === 'pdf'
            ? 'Yalnızca PDF dosyası yükleyebilirsiniz.'
            : 'İzin verilen türler: PDF, DOC, DOCX, XLS, XLSX.';
        render();
        return;
      }

      uploading = true;
      render();
      try {
        var data = await AdminApi.uploadAdminImage(file);
        value = data.path;
        if (typeof onChange === 'function') onChange(data.path);
        if (typeof onUploaded === 'function') {
          onUploaded({
            path: data.path,
            size_label: data.size_label || '',
            filename: data.filename,
          });
        }
      } catch (ex) {
        error = ex.message || 'Yükleme başarısız';
      } finally {
        uploading = false;
        render();
      }
    }

    function applyUrl() {
      var next = urlInput.value.trim();
      if (!next) return;
      var ext = getExt(next);
      if (mode === 'pdf' && ext && ext !== '.pdf') {
        error = 'URL bir PDF dosyasına işaret etmeli.';
        render();
        return;
      }
      if (mode === 'document' && ext && DOC_EXT.indexOf(ext) === -1) {
        error = 'URL PDF, DOC, DOCX, XLS veya XLSX olmalı.';
        render();
        return;
      }
      error = '';
      value = next;
      if (typeof onChange === 'function') onChange(next);
      urlInput.value = '';
      render();
    }

    function clear() {
      error = '';
      urlInput.value = '';
      value = '';
      if (typeof onChange === 'function') onChange('');
      render();
    }

    render();

    return {
      el: root,
      getValue: function () {
        return value;
      },
      setValue: function (next) {
        value = next || '';
        render();
      },
    };
  }

  window.AdminWidgets = {
    alert: alertWidget,
    rowActions: rowActions,
    iconSelectField: iconSelectField,
    imagePickerField: imagePickerField,
    pdfPickerField: pdfPickerField,
  };
})();
