// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8000",
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Auto-refresh on 401
// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     if (err.response.status === 401) {
//       const refreshToken = localStorage.getItem("refresh_token");
//       if (!refreshToken) return Promise.reject(err);

//       try {
//         const res = await axios.post("http://localhost:8000/api/auth/refresh", {
//           refresh_token: refreshToken,
//         });

//         localStorage.setItem("access_token", res.data.access_token);
//         localStorage.setItem("refresh_token", res.data.refresh_token);

//         err.config.headers.Authorization = `Bearer ${res.data.access_token}`;
//         return api(err.config); // retry original request
//       } catch (e) {
//         localStorage.clear();
//         window.location.href = "/login"
//       }
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;


import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // send cookies (for refresh_token)
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Refresh logic ----
let isRefreshing = false;
/** @type {Array<(token: string | null) => void>} */
let subscribers = [];

/**
 * @param {(token: string | null) => void} cb
 */
const addSubscriber = (cb) => {
  subscribers.push(cb);
};

/**
 * @param {string | null} token
 */
const notifySubscribers = (token) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) return Promise.reject(error); // network error

    if (response.status !== 401) {
      return Promise.reject(error);
    }

    // Don't try to refresh for login/refresh routes, and only retry once
    if (
      config._retry ||
      config.url?.includes("/api/auth/login") ||
      config.url?.includes("/api/auth/refresh")
    ) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    config._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addSubscriber((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(config));
        });
      });
    }

    // Start refresh
    isRefreshing = true;

    try {
      // No body needed; refresh_token comes from HttpOnly cookie
      const res = await api.post("/api/auth/refresh", {});

      const newAccess = res.data.access_token;
      localStorage.setItem("access_token", newAccess);

      notifySubscribers(newAccess);

      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch (err) {
      notifySubscribers(null);
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;