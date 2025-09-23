import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from "@/constants/urls";


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// Request interceptor: Attach auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle specific error codes globally
    if (error.response) {
      if (error.response.status === 401) {
        // Optionally clear auth and redirect to login
        localStorage.removeItem('auth_token');
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

// You can add interceptors here if needed


export default api;
