import { Navigate, Routes, Route } from 'react-router-dom';
import Test from './pages/Test';
import PersonelDb from './pages/PersonelDb';
import ComingSoon from './pages/ComingSoon';
import ChangePassword from './pages/ChangePassword';
import ChangeEmail from './pages/ChangeEmail';
import SessionHistory from './pages/SessionHistory';
import SizdenGelenler from './pages/SizdenGelenler';
import SizdenGelenlerDetay from './pages/SizdenGelenlerDetay';
import Videos from './pages/Videos';
import Etkinlikler from './pages/Etkinlikler';
import EtkinlikDetay from './pages/EtkinlikDetay';
import Duyurular from './pages/Duyurular';
import Protokoller from './pages/kaynaklar/Protokoller';
import Dokumanlar from './pages/kaynaklar/Dokumanlar';
import Mevzuatlar from './pages/kaynaklar/Mevzuatlar';
import Egitimler from './pages/kaynaklar/Egitimler';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/auth/AdminLogin';
import { RootEntry, RequirePortal, RequireYonetici } from './auth/RequireAuth';
import AdminRoutes from '@admin/AdminRoutes.jsx';

const PLACEHOLDER_PATHS = [
  'anketler',
  'yardimci-linkler',
  'vefat',
  'dogum-gunu',
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootEntry />} />
      <Route path="/giris" element={<Login />} />
      <Route path="/sifre-sifirla" element={<ForgotPassword />} />
      <Route path="/admin/giris" element={<AdminLogin />} />

      <Route element={<RequirePortal />}>
        <Route path="/videolar" element={<Videos />} />
        <Route path="/etkinlikler" element={<Etkinlikler />} />
        <Route path="/etkinlikler/:id" element={<EtkinlikDetay />} />
        <Route path="/duyurular" element={<Duyurular />} />
        <Route path="/protokoller" element={<Protokoller />} />
        <Route path="/dokumanlar" element={<Dokumanlar />} />
        <Route path="/mevzuatlar" element={<Mevzuatlar />} />
        <Route path="/egitimler" element={<Egitimler />} />
        <Route path="/test" element={<Test />} />
        <Route path="/test/personel-db" element={<PersonelDb />} />
        <Route path="/profil/sifre-degistir" element={<ChangePassword />} />
        <Route path="/profil/eposta-degistir" element={<ChangeEmail />} />
        <Route path="/sizden-gelenler" element={<SizdenGelenler />} />
        <Route path="/sizden-gelenler/detay/:id" element={<SizdenGelenlerDetay />} />
        <Route path="/profil/oturum-kayitlari" element={<SessionHistory />} />
        {PLACEHOLDER_PATHS.map((slug) => (
          <Route key={slug} path={`/${slug}`} element={<ComingSoon />} />
        ))}
      </Route>

      <Route element={<RequireYonetici />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
