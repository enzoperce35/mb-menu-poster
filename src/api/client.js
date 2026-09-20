import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_MAIN_APP_API || "https://api.servewise.fyi/api/v1",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default client;
