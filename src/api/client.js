import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_MAIN_APP_API,
  headers: {
    "Content-Type": "application/json",
    // "X-Internal-Token": import.meta.env.VITE_INTERNAL_TOKEN, // enable later
  },
  timeout: 10000,
});

export default client;
