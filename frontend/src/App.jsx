import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmployeeList from './pages/EmployeeList';
import Test from './pages/Test';
import ComingSoon from './pages/ComingSoon';

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
      <Route path="/personel" element={<EmployeeList />} />
      <Route path="/test" element={<Test />} />
      {PLACEHOLDER_PATHS.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<ComingSoon />} />
      ))}
    </Routes>
  );
}
