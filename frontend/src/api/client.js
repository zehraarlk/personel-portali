import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default apiClient;

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health/`);
  if (!response.ok) {
    throw new Error('API yanıt vermedi');
  }
  return response.json();
}

export async function fetchSystemStatus() {
  const response = await fetch(`${API_BASE}/system-status/`);
  if (!response.ok) {
    throw new Error('Sistem durumu alınamadı');
  }
  return response.json();
}

export async function fetchHomeDashboard() {
  const response = await fetch(`${API_BASE}/home/`);
  if (!response.ok) {
    throw new Error('Ana sayfa verileri alınamadı');
  }
  return response.json();
}
