import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmployeeList from './pages/EmployeeList';
import Test from './pages/Test';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/personel" element={<EmployeeList />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}
