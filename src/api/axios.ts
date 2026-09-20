import axios, { type AxiosAdapter } from 'axios';
import { encolar } from './requestQueue';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  adapter: encolar as AxiosAdapter,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;