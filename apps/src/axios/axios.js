import axios from "axios"

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "X-Custom-Header": "foobar" },
});
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;