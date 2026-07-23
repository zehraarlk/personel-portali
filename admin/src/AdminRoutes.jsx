import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import ModuleStub from './pages/ModuleStub';
import ChangePassword from './pages/ChangePassword';
import SessionHistory from './pages/SessionHistory';
import {
  EtkinliklerIndex,
  EtkinliklerEkle,
  EtkinliklerDuzenle,
} from './pages/etkinlikler/EtkinliklerPages';
import {
  DuyurularIndex,
  DuyurularEkle,
  DuyurularDuzenle,
} from './pages/duyurular/DuyurularPages';
import {
  PersonellerIndex,
  PersonellerEkle,
  PersonellerDuzenle,
  YoneticilerIndex,
  YoneticilerEkle,
  YoneticilerDuzenle,
} from './pages/yonetim/YonetimPages';
import {
  VideolarIndex,
  VideolarEkle,
  VideolarDuzenle,
} from './pages/videolar/VideolarPages';
import {
  SizdenGelenlerIndex,
  SizdenGelenlerEkle,
  SizdenGelenlerDuzenle,
} from './pages/sizden-gelenler/SizdenGelenlerPages';

const STUBS = [
  'protokoller',
  'dokumanlar',
  'mevzuatlar',
  'egitimler',
  'anketler',
  'yardimci-linkler',
  'vefat',
  'dogum-gunu',
];

/** Portal router altında /admin/* */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Home />} />
        <Route path="personeller" element={<PersonellerIndex />} />
        <Route path="personeller/ekle" element={<PersonellerEkle />} />
        <Route path="personeller/:id/duzenle" element={<PersonellerDuzenle />} />
        <Route path="yoneticiler" element={<YoneticilerIndex />} />
        <Route path="yoneticiler/ekle" element={<YoneticilerEkle />} />
        <Route path="yoneticiler/:id/duzenle" element={<YoneticilerDuzenle />} />
        <Route path="videolar" element={<VideolarIndex />} />
        <Route path="videolar/ekle" element={<VideolarEkle />} />
        <Route path="videolar/:id/duzenle" element={<VideolarDuzenle />} />
        <Route path="sizden-gelenler" element={<SizdenGelenlerIndex />} />
        <Route path="sizden-gelenler/ekle" element={<SizdenGelenlerEkle />} />
        <Route path="sizden-gelenler/:id/duzenle" element={<SizdenGelenlerDuzenle />} />
        <Route path="etkinlikler" element={<EtkinliklerIndex />} />
        <Route path="etkinlikler/ekle" element={<EtkinliklerEkle />} />
        <Route path="etkinlikler/:id/duzenle" element={<EtkinliklerDuzenle />} />
        <Route path="duyurular" element={<DuyurularIndex />} />
        <Route path="duyurular/ekle" element={<DuyurularEkle />} />
        <Route path="duyurular/:id/duzenle" element={<DuyurularDuzenle />} />
        <Route path="profil/sifre-degistir" element={<ChangePassword />} />
        <Route path="profil/oturum-kayitlari" element={<SessionHistory />} />
        {STUBS.map((slug) => (
          <Route key={slug} path={slug} element={<ModuleStub slug={slug} />} />
        ))}
        {STUBS.map((slug) => (
          <Route key={`${slug}-ekle`} path={`${slug}/ekle`} element={<ModuleStub slug={slug} />} />
        ))}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
