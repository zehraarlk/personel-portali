import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const META = {
  videolar: { title: 'Videolar', icon: 'fas fa-video', countKey: 'videolar' },
  etkinlikler: { title: 'Etkinlikler', icon: 'fas fa-calendar-check', countKey: 'etkinlikler' },
  'sizden-gelenler': { title: 'Sizden Gelenler', icon: 'fas fa-comments', countKey: 'sizden_gelenler' },
  protokoller: { title: 'Protokoller', icon: 'fas fa-file-signature', countKey: 'kaynaklar' },
  dokumanlar: { title: 'Dokümanlar', icon: 'fas fa-file-alt', countKey: 'kaynaklar' },
  mevzuatlar: { title: 'Mevzuatlar', icon: 'fas fa-balance-scale', countKey: 'kaynaklar' },
  egitimler: { title: 'Eğitimler', icon: 'fas fa-graduation-cap', countKey: 'kaynaklar' },
  anketler: { title: 'Anketler', icon: 'fas fa-poll', countKey: 'anketler' },
  'yardimci-linkler': { title: 'Yardımcı Linkler', icon: 'fas fa-link', countKey: 'yardimci_linkler' },
  vefat: { title: 'Vefat Bilgisi', icon: 'fas fa-ribbon', countKey: 'vefat_bilgileri' },
  'dogum-gunu': { title: 'Doğum Günü', icon: 'fas fa-birthday-cake', countKey: 'personeller' },
};

export default function ModuleStub({ slug, count }) {
  const meta = META[slug] || { title: 'Modül', icon: 'fas fa-folder', countKey: null };
  usePageTitle(meta.title);

  return (
    <>
      <p className="admin-page-lead">
        Bu modül eski admin paneli kalıbına göre eklenecek (liste / ekle / düzenle / sil).
        Şimdilik iskelet sayfa.
      </p>

      <div className="admin-toolbar">
        <p className="admin-toolbar__meta">
          {typeof count === 'number' ? (
            <>
              Toplam kayıt (özet): <strong>{count}</strong>
            </>
          ) : (
            'CRUD sonraki adımda bağlanacak.'
          )}
        </p>
        <button type="button" className="admin-btn admin-btn-primary" disabled>
          <i className="fas fa-plus" aria-hidden="true" /> Yeni Ekle
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <i className={meta.icon} aria-hidden="true" />
            {meta.title}
          </h2>
          <Link to="/admin" className="admin-btn admin-btn-secondary admin-btn-sm">
            Dashboard
          </Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Başlık</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4}>
                  <div className="admin-empty">Henüz CRUD bağlı değil — örnek: Etkinlikler / Duyurular.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
