import axios from "axios"
const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api",
  timeout: 1000,
  headers: { "X-Custom-Header": "foobar" },
});
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
