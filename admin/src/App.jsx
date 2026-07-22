import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Test from './pages/Test';
import PersonelDb from './pages/PersonelDb';
import ComingSoon from './pages/ComingSoon';
import ChangePassword from './pages/ChangePassword';
import ChangeEmail from './pages/ChangeEmail';
import SessionHistory from './pages/SessionHistory';

const PLACEHOLDER_PATHS = [
  'videolar',
  'sizden-gelenler',
  'etkinlikler',
  'duyurular',
  'protokoller',
  'dokumanlar',
  'mevzuatlar',
  'egitimler',
  'anketler',
  'yardimci-linkler',
  'vefat',
  'dogum-gunu',
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<Test />} />
      <Route path="/test/personel-db" element={<PersonelDb />} />
      <Route path="/profil/sifre-degistir" element={<ChangePassword />} />
      <Route path="/profil/eposta-degistir" element={<ChangeEmail />} />
      <Route path="/profil/oturum-kayitlari" element={<SessionHistory />} />
      {PLACEHOLDER_PATHS.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<ComingSoon />} />
      ))}
    </Routes>
  );
}
