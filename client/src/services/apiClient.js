import axios from "axios";

// 🔥 Clean base URL
const normalizeBaseUrl = (url) => {
  if (!url) return "";

  return String(url)
    .trim()
    .replace(/\/+$/, "") // remove trailing slash
    .replace(/\/api$/, ""); // remove /api if added
};

// ✅ Use ENV properly
const API_BASE_URL =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
  "https://openclaw-hackathon-hackindia-codingzam.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
});

// 🔄 Loading State Management
let activeRequests = 0;
const loadingListeners = new Set();

const notifyLoadingListeners = () => {
  const isLoading = activeRequests > 0;
  loadingListeners.forEach((listener) => listener(isLoading));
};

const startLoading = () => {
  activeRequests++;
  notifyLoadingListeners();
};

const stopLoading = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  notifyLoadingListeners();
};

export const subscribeToGlobalLoading = (listener) => {
  loadingListeners.add(listener);
  listener(activeRequests > 0);

  return () => {
    loadingListeners.delete(listener);
  };
};

// 🔐 Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    startLoading();

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  }
);

// 🔐 Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  (error) => {
    stopLoading();

    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default apiClient;