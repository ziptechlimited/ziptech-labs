import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import axios from "axios";
import { IUser, UserRole } from "../types/shared";
import { API_CONFIG } from "../config/api";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<IUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem("token");
    setAuthHeader(t);
    return t;
  });
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setAuthHeader(null);
    setToken(null);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    const res = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`);
    setUser(res.data);
    return res.data as IUser;
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .catch((error) => {
        console.error("Auth verification failed", error);
        logout();
      })
      .finally(() => setLoading(false));
  }, [token, fetchMe, logout]);

  const startSession = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setAuthHeader(newToken);
    const me = await fetchMe();
    setToken(newToken);
    return me;
  };

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, { email, password });
    return startSession(res.data.token);
  };

  const register = async (name: string, email: string, password: string, role?: UserRole) => {
    const res = await axios.post(`${API_CONFIG.BASE_URL}/auth/register`, { name, email, password, role });
    return startSession(res.data.token);
  };

  const refreshUser = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
