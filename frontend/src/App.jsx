import { Navigate, Routes, Route } from 'react-router-dom';
import Test from './pages/Test';
import PersonelDb from './pages/PersonelDb';
import ChangePassword from './pages/ChangePassword';
import ChangeEmail from './pages/ChangeEmail';
import SessionHistory from './pages/SessionHistory';
import SizdenGelenler from './pages/SizdenGelenler';
import SizdenGelenlerDetay from './pages/SizdenGelenlerDetay';
import Videos from './pages/Videos';
import Etkinlikler from './pages/Etkinlikler';
import EtkinlikDetay from './pages/EtkinlikDetay';
import Duyurular from './pages/Duyurular';
import DuyuruDetay from './pages/DuyuruDetay';
import VefatEdenler from './pages/VefatEdenler';
import DogumGunu from './pages/DogumGunu';
import YardimciLinkler from './pages/YardimciLinkler';
import Anketler from './pages/Anketler';
import AnketDetay from './pages/AnketDetay';

import Protokoller from './pages/kaynaklar/Protokoller';
import Dokumanlar from './pages/kaynaklar/Dokumanlar';
import Mevzuatlar from './pages/kaynaklar/Mevzuatlar';
import Egitimler from './pages/kaynaklar/Egitimler';

import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/auth/AdminLogin';
import { RootEntry, RequirePortal, RequireYonetici } from './auth/RequireAuth';
import AdminLayout from '@admin/components/AdminLayout.jsx';
import { adminChildRoutes } from '@admin/AdminRoutes.jsx';


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
        <Route path="/duyurular/:id" element={<DuyuruDetay />} />
        <Route path="/protokoller" element={<Protokoller />} />
        <Route path="/dokumanlar" element={<Dokumanlar />} />
        <Route path="/mevzuatlar" element={<Mevzuatlar />} />
        <Route path="/egitimler" element={<Egitimler />} />
        <Route path="/vefat" element={<VefatEdenler />} />
        <Route path="/dogum-gunu" element={<DogumGunu />} />
        <Route path="/yardimci-linkler" element={<YardimciLinkler />} />
        <Route path="/anketler" element={<Anketler />} />
        <Route path="/anketler/:id" element={<AnketDetay />} />

        <Route path="/test" element={<Test />} />
        <Route path="/test/personel-db" element={<PersonelDb />} />
        <Route path="/profil/sifre-degistir" element={<ChangePassword />} />
        <Route path="/profil/eposta-degistir" element={<ChangeEmail />} />
        <Route path="/sizden-gelenler" element={<SizdenGelenler />} />
        <Route path="/sizden-gelenler/detay/:id" element={<SizdenGelenlerDetay />} />
        <Route path="/profil/oturum-kayitlari" element={<SessionHistory />} />
      </Route>

      <Route element={<RequireYonetici />}>
        <Route path="/admin" element={<AdminLayout />}>
          {adminChildRoutes}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}