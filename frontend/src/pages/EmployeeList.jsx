import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import apiClient from '../api/client';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get('/employees/')
      .then((res) => setEmployees(res.data.results ?? res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
          Personel Listesi
        </h1>
        <p className="text-on-surface-variant">Kurum personel kayıtları</p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(30,58,138,0.05)] border border-outline-variant/10 overflow-hidden">
        {loading && <p className="p-6 text-on-surface-variant">Yükleniyor...</p>}
        {error && (
          <p className="p-6 text-error">Hata: {error} (backend çalışıyor mu?)</p>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-sm text-on-surface">
                <tr>
                  <th className="px-6 py-3 font-semibold">Ad Soyad</th>
                  <th className="px-6 py-3 font-semibold">Departman</th>
                  <th className="px-6 py-3 font-semibold">Unvan</th>
                  <th className="px-6 py-3 font-semibold">Durum</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-t border-outline-variant/20 hover:bg-surface-container-low/60"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-on-surface">
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface-variant">
                      {emp.department_name}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface-variant">
                      {emp.title}
                    </td>
                    <td className="px-6 py-3 text-sm text-on-surface-variant">
                      {emp.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
