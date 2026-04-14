import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/auth.store";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
});
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // this token has died
      const { logout } = useAuthStore();
      logout();
      toast.error("Session expired. Please log in again");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
