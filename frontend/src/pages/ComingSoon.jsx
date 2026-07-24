import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';

const TITLES = {
  '/videolar': 'Videolar',
  '/sizden-gelenler': 'Sizden Gelenler',
  '/etkinlikler': 'Etkinlikler',
  '/duyurular': 'Duyurular',
  '/anketler': 'Anketler',
  '/yardimci-linkler': 'Yardımcı Linkler',
  '/vefat': 'Vefat Eden Bilgisi',
  '/dogum-gunu': 'Doğum Günü Bilgisi',
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Sayfa';

  return (
    <Layout>
      <div className="rounded-2xl border border-outline-variant/20 bg-white p-8 md:p-12 shadow-[0_4px_20px_rgba(30,58,138,0.05)] max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Yakında</p>
        <h1 className="text-3xl font-bold text-on-surface mb-3">{title}</h1>
        <p className="text-on-surface-variant leading-relaxed">
          Bu modül personel-portal-backend menüsünden aktarıldı. İçerik ve API bağlantısı
          sonraki adımda eklenecek.
        </p>
      </div>
    </Layout>
  );
}
