import { useNavigate } from 'react-router-dom';

/**
 * Liste satırı işlemleri — combobox (yalnızca Düzenle / Sil).
 */
export default function AdminRowActions({ editTo, onDelete, label = 'İşlem' }) {
  const navigate = useNavigate();

  return (
    <select
      className="admin-row-actions"
      defaultValue=""
      aria-label={label}
      onChange={(e) => {
        const value = e.target.value;
        e.target.value = '';
        if (value === 'edit' && editTo) {
          navigate(editTo);
        } else if (value === 'delete' && onDelete) {
          onDelete();
        }
      }}
    >
      <option value="" disabled hidden>
        {label}
      </option>
      <option value="edit">Düzenle</option>
      <option value="delete">Sil</option>
    </select>
  );
}
