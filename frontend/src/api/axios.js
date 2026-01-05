import axios from "axios";
import { toast } from "react-hot-toast";

/* ================= AXIOS INSTANCES ================= */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= GLOBAL AUTH STATE ================= */

let isRefreshing = false;
let subscribers = [];

let refreshFailed =
    localStorage.getItem("refresh_failed") === "true";

    const addSubscriber = (cb) => subscribers.push(cb);

    const notifySubscribers = (token) => {
    subscribers.forEach((cb) => cb(token));
    subscribers = [];
    };

/* ================= LOGOUT HANDLER ================= */

const logout = async () => {
  refreshFailed = true;
  localStorage.setItem("refresh_failed", "true");
  localStorage.removeItem("access_token");

  try {
    await refreshApi.post("/api/auth/logout");
  } catch {}

  notifySubscribers(null);
  window.location.replace("/");
};

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) {
      toast.error("Network error");
      return Promise.reject(error);
    }

    if (refreshFailed) {
      return Promise.reject(error);
    }

    if (config.url?.includes("/api/auth/me")) {
      logout();
      return Promise.reject(error);
    }

    if (
      response.status === 403 &&
      response.data?.error_code === "refresh_token_required"
    ) {
      toast.error("Session expired. Please log in again.");
      logout();
      return Promise.reject(error);
    }

    if (response.status !== 401) {
      return Promise.reject(error);
    }

    if (
      config._retry ||
      config.url?.includes("/api/auth/login") ||
      config.url?.includes("/api/auth/refresh") ||
      !localStorage.getItem("access_token")
    ) {
      logout();
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addSubscriber((token) => {
          if (!token) return reject(error);
          config.headers.Authorization = `Bearer ${token}`;
          resolve(api(config));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await refreshApi.post("/api/auth/refresh");
      const newToken = res.data.access_token;

      localStorage.setItem("access_token", newToken);
      localStorage.removeItem("refresh_failed");
      refreshFailed = false;

      notifySubscribers(newToken);

      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (err) {
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
