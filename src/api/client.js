import axios from "axios";

const client = axios.create({
  // Netlify will use VITE_MAIN_APP_API in production
  baseURL: import.meta.env.VITE_MAIN_APP_API || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    // "X-Internal-Token": import.meta.env.VITE_INTERNAL_TOKEN, // ready to enable
  },
  timeout: 10000,
});

// Optional: Add an interceptor to catch errors for your posters
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default client;
