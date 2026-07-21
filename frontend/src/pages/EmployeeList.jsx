import { useEffect, useState } from 'react';
import apiClient from '../api/client';

function EmployeeList() {
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

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>Hata: {error} (backend çalışıyor mu?)</p>;

  return (
    <div>
      <h1>Personel Listesi</h1>
      <table>
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>Departman</th>
            <th>Unvan</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.first_name} {emp.last_name}</td>
              <td>{emp.department_name}</td>
              <td>{emp.title}</td>
              <td>{emp.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;
