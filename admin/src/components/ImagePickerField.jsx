import { useEffect, useRef, useState } from 'react';
import { uploadAdminImage } from '../api/client';
import { BRAND_IMG } from '../constants';

function toPreviewSrc(path) {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http')) {
    return path;
  }
  return path.replace(/^\.\.\//, '/');
}

/**
 * Dosya seçici + yükleme. value: DB yolu (örn. ../images/uploads/x.webp)
 */
export default function ImagePickerField({ value, onChange, label = 'Resim' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [localPreview, setLocalPreview] = useState('');

  useEffect(() => {
    return () => {
      if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const preview = localPreview || toPreviewSrc(value);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setUploading(true);

    try {
      const data = await uploadAdminImage(file);
      onChange(data.path);
      setLocalPreview('');
      URL.revokeObjectURL(blobUrl);
    } catch (ex) {
      setError(ex.message || 'Yükleme başarısız');
      setLocalPreview('');
      URL.revokeObjectURL(blobUrl);
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    setLocalPreview('');
    setError('');
    onChange('');
  };

  return (
    <div className="admin-image-picker">
      <div className="admin-form-preview">
        {preview ? (
          <img
            src={preview}
            alt=""
            onError={(e) => {
              e.currentTarget.src = BRAND_IMG;
            }}
          />
        ) : (
          <div className="admin-form-preview__empty">
            <i className="fas fa-image" aria-hidden="true" />
            Görsel önizleme
          </div>
        )}
      </div>

      <span className="admin-image-picker__label">{label}</span>
      <div className="admin-image-picker__row">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
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
          <i className="fas fa-folder-open" aria-hidden="true" />{' '}
          {uploading ? 'Yükleniyor…' : 'Dosya seç'}
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
      {value ? <div className="admin-image-picker__path">{value}</div> : null}
      {error ? <div className="admin-alert admin-alert-danger">{error}</div> : null}
    </div>
  );
}
