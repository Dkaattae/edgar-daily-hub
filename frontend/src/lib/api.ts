import axios from "axios";
import { Filing } from "../data/types";

const api = axios.create({
  baseURL: "/api", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export const login = async (username: string, password: string) => {
  const { data } = await axios.post("/api/auth/login", { username, password });
  localStorage.setItem("token", data.access_token);
  return data;
};

export const register = async (username: string, password: string) => {
  const { data } = await axios.post("/api/auth/register", { username, password });
  localStorage.setItem("token", data.access_token);
  return data;
};


export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const getUsername = (): string => {
  const token = localStorage.getItem("token");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? "";
  } catch {
    return "";
  }
};

export const fetchDailyCounts = async () => {
  const { data } = await api.get("/reports/daily-count");
  return data;
};

export const fetchAllDailyCounts = async () => {
  const { data } = await api.get("/reports/all-daily-counts");
  return data;
};

export const fetchFilingsByTicker = async (tickers: string): Promise<Filing[]> => {
  const { data } = await api.get(`/reports/by-ticker?tickers=${tickers}`);
  return data;
};

export const fetchWatchlist = async (): Promise<string[]> => {
  const { data } = await api.get("/watchlist");
  return data;
};

export const addToWatchlist = async (ticker: string): Promise<void> => {
  await api.post(`/watchlist/${ticker}`);
};

export const removeFromWatchlist = async (ticker: string): Promise<void> => {
  await api.delete(`/watchlist/${ticker}`);
};


export default api;
