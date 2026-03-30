import axios from "axios";
import { Filing } from "../data/types";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
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

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const register = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
  window.location.href = "/login";
};

export const getUsername = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email || "";
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
