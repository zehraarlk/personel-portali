import { useRef, useState } from 'react';
import { uploadAdminImage } from '../api/client';

const DOC_EXT = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx']);

const EXT_META = {
  '.pdf': { icon: 'fas fa-file-pdf', label: 'PDF', colorClass: 'is-pdf' },
  '.doc': { icon: 'fas fa-file-word', label: 'DOC', colorClass: 'is-word' },
  '.docx': { icon: 'fas fa-file-word', label: 'DOCX', colorClass: 'is-word' },
  '.xls': { icon: 'fas fa-file-excel', label: 'XLS', colorClass: 'is-excel' },
  '.xlsx': { icon: 'fas fa-file-excel', label: 'XLSX', colorClass: 'is-excel' },
};

function toHref(path) {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http')) {
    return path;
  }
  return path.replace(/^\.\.\//, '/');
}

function shortName(path) {
  if (!path) return '';
  try {
    if (path.startsWith('http')) {
      const u = new URL(path);
      const parts = u.pathname.split('/').filter(Boolean);
      return decodeURIComponent(parts[parts.length - 1] || u.hostname);
    }
  } catch {
    /* ignore */
  }
  const clean = String(path).replace(/^\.\.\//, '');
  const parts = clean.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || clean);
}

function getExt(pathOrName) {
  if (!pathOrName) return '';
  const clean = String(pathOrName).split('?')[0].split('#')[0];
  const name = clean.includes('/') ? clean.split('/').pop() : clean;
  const dot = name.lastIndexOf('.');
  if (dot < 0) return '';
  return name.slice(dot).toLowerCase();
}

function getMeta(pathOrName) {
  const ext = getExt(pathOrName);
  return (
    EXT_META[ext] || {
      icon: 'fas fa-file-alt',
      label: ext ? ext.replace('.', '').toUpperCase() : 'Dosya',
      colorClass: 'is-file',
    }
  );
}

function isAllowedFile(file, mode) {
  const ext = getExt(file.name);
  if (mode === 'pdf') {
    return ext === '.pdf' || file.type === 'application/pdf';
  }
  return DOC_EXT.has(ext);
}

/**
 * Belge seçici + yükleme (PDF / Word / Excel).
 * mode: "document" | "pdf"
 */
export default function PdfPickerField({
  value,
  onChange,
  onUploaded,
  label,
  mode = 'document',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlDraft, setUrlDraft] = useState('');

  const href = toHref(value);
  const meta = getMeta(value);
  const accept =
    mode === 'pdf'
      ? 'application/pdf,.pdf'
      : '.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const fieldLabel =
    label ||
    (mode === 'pdf'
      ? 'PDF dosyası'
      : value
        ? `${meta.label} dosyası`
        : 'Dosya');

  const actionLabel = uploading
    ? 'Yükleniyor…'
    : value
      ? `${meta.label} değiştir`
      : mode === 'pdf'
        ? 'PDF seç'
        : 'Dosya seç';

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (!isAllowedFile(file, mode)) {
      setError(
        mode === 'pdf'
          ? 'Yalnızca PDF dosyası yükleyebilirsiniz.'
          : 'İzin verilen türler: PDF, DOC, DOCX, XLS, XLSX.',
      );
      return;
    }

    setUploading(true);
    try {
      const data = await uploadAdminImage(file);
      onChange(data.path);
      if (typeof onUploaded === 'function') {
        onUploaded({
          path: data.path,
          size_label: data.size_label || '',
          filename: data.filename,
        });
      }
    } catch (ex) {
      setError(ex.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const applyUrl = () => {
    const next = urlDraft.trim();
    if (!next) return;
    const ext = getExt(next);
    if (mode === 'pdf' && ext && ext !== '.pdf') {
      setError('URL bir PDF dosyasına işaret etmeli.');
      return;
    }
    if (mode === 'document' && ext && !DOC_EXT.has(ext)) {
      setError('URL PDF, DOC, DOCX, XLS veya XLSX olmalı.');
      return;
    }
    setError('');
    onChange(next);
    setUrlDraft('');
  };

  const clear = () => {
    setError('');
    setUrlDraft('');
    onChange('');
  };

  return (
    <div className="admin-pdf-picker">
      <div className={`admin-form-preview admin-form-preview--pdf admin-form-preview--doc ${meta.colorClass}`}>
        {value ? (
          <div className="admin-pdf-picker__preview">
            <i className={meta.icon} aria-hidden="true" />
            <span className="admin-pdf-picker__badge">{meta.label}</span>
            <strong title={value}>{shortName(value)}</strong>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" className="admin-link-muted">
                Aç / indir
              </a>
            ) : null}
          </div>
        ) : (
          <div className="admin-form-preview__empty">
            <i className={mode === 'pdf' ? 'fas fa-file-pdf' : 'fas fa-file-upload'} aria-hidden="true" />
            {mode === 'pdf' ? 'PDF seçilmedi' : 'Dosya seçilmedi'}
          </div>
        )}
      </div>

      <span className="admin-image-picker__label">{fieldLabel}</span>
      <div className="admin-image-picker__row">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="admin-image-picker__file"
          onChange={onPick}
          disabled={uploading}
        />
        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <i className="fas fa-upload" aria-hidden="true" /> {actionLabel}
        </button>
        {value ? (
          <button
            type="button"
            className="admin-btn admin-btn-danger admin-btn-sm"
            disabled={uploading}
            onClick={clear}
          >
            Kaldır
          </button>
        ) : null}
      </div>

      <div className="admin-pdf-picker__url">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder={
            mode === 'pdf'
              ? 'veya PDF URL yapıştır…'
              : 'veya dosya URL / yolu yapıştır…'
          }
          disabled={uploading}
        />
        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          disabled={uploading || !urlDraft.trim()}
          onClick={applyUrl}
        >
          Uygula
        </button>
      </div>

      {value ? <div className="admin-image-picker__path">{value}</div> : null}
      {error ? <div className="admin-alert admin-alert-danger">{error}</div> : null}
    </div>
  );
}
