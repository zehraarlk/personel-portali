import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
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
import {
  ProtokollerIndex,
  ProtokollerEkle,
  ProtokollerDuzenle,
} from './pages/protokoller/ProtokollerPages';
import {
  DokumanlarIndex,
  DokumanlarEkle,
  DokumanlarDuzenle,
  MevzuatlarIndex,
  MevzuatlarEkle,
  MevzuatlarDuzenle,
  EgitimlerIndex,
  EgitimlerEkle,
  EgitimlerDuzenle,
} from './pages/kaynaklar/KaynaklarPages';
import {
  AnketlerIndex,
  AnketlerEkle,
  AnketlerDuzenle,
} from './pages/anketler/AnketlerPages';
import {
  YardimciLinklerIndex,
  YardimciLinklerEkle,
  YardimciLinklerDuzenle,
} from './pages/yardimci-linkler/YardimciLinklerPages';
import {
  VefatIndex,
  VefatEkle,
  VefatDuzenle,
} from './pages/vefat/VefatPages';
import { DogumGunuIndex } from './pages/dogum-gunu/DogumGunuPages';

/**
 * /admin altındaki sayfa rotaları.
 * Fragment olarak export — RR createRoutesFromChildren Fragment'i açar;
 * özel bir bileşen (<AdminChildRoutes />) kullanmayın, rotalar kayıt olmaz.
 *
 * Kaynaklar (doküman/mevzuat/eğitim): her modül AYRI bileşen tipi olmalı
 * (DokumanlarIndex …). Ortak KaynakIndex’i 3 rotaya props ile vermeyin —
 * React instance’ı yeniden kullanır, tablo eski veride kalır.
 */
export const adminChildRoutes = (
  <>
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
    <Route path="protokoller" element={<ProtokollerIndex />} />
    <Route path="protokoller/ekle" element={<ProtokollerEkle />} />
    <Route path="protokoller/:id/duzenle" element={<ProtokollerDuzenle />} />

    <Route path="dokumanlar" element={<DokumanlarIndex />} />
    <Route path="dokumanlar/ekle" element={<DokumanlarEkle />} />
    <Route path="dokumanlar/:id/duzenle" element={<DokumanlarDuzenle />} />
    <Route path="mevzuatlar" element={<MevzuatlarIndex />} />
    <Route path="mevzuatlar/ekle" element={<MevzuatlarEkle />} />
    <Route path="mevzuatlar/:id/duzenle" element={<MevzuatlarDuzenle />} />
    <Route path="egitimler" element={<EgitimlerIndex />} />
    <Route path="egitimler/ekle" element={<EgitimlerEkle />} />
    <Route path="egitimler/:id/duzenle" element={<EgitimlerDuzenle />} />

    <Route path="anketler" element={<AnketlerIndex />} />
    <Route path="anketler/ekle" element={<AnketlerEkle />} />
    <Route path="anketler/:id/duzenle" element={<AnketlerDuzenle />} />

    <Route path="yardimci-linkler" element={<YardimciLinklerIndex />} />
    <Route path="yardimci-linkler/ekle" element={<YardimciLinklerEkle />} />
    <Route path="yardimci-linkler/:id/duzenle" element={<YardimciLinklerDuzenle />} />

    <Route path="vefat" element={<VefatIndex />} />
    <Route path="vefat/ekle" element={<VefatEkle />} />
    <Route path="vefat/:id/duzenle" element={<VefatDuzenle />} />

    <Route path="dogum-gunu" element={<DogumGunuIndex />} />

    <Route path="profil/sifre-degistir" element={<ChangePassword />} />
    <Route path="profil/oturum-kayitlari" element={<SessionHistory />} />
    <Route path="*" element={<Home />} />
  </>
);

/**
 * Bağımsız admin Vite uygulaması (basename=/admin) için.
 * Portal: App.jsx → AdminLayout + {adminChildRoutes}
 */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>{adminChildRoutes}</Route>
    </Routes>
  );
}
