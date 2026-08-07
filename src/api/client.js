import axios from "axios";

const client = axios.create({
  // Netlify will use VITE_MAIN_APP_API in production
  baseURL: import.meta.env.VITE_MAIN_APP_API || "http://localhost:3000/api/v1",

  headers: {
    "Content-Type": "application/json",
    // "X-Internal-Token": import.meta.env.VITE_INTERNAL_TOKEN,
  },

  timeout: 10000,
});

// Automatically attach the JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Optional: Global error logging
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default client;
