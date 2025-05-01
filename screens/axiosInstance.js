import axios from 'axios';
import { BACKEND_URL } from './config'; // or wherever you have your URL

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// ✅ Automatically attach Authorization token if exists
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken'); // fetch token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // attach token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
