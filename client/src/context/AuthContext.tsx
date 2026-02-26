import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";
import { IUser, UserRole } from "../types/shared";
import { API_CONFIG } from "../config/api";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
  ) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`);
          setUser(res.data);
        } catch (error) {
          console.error("Auth verification failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, {
      email,
      password,
    });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data); // data contains user object mixed with token? Check controller.
    return res.data;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
  ) => {
    const res = await axios.post(`${API_CONFIG.BASE_URL}/auth/register`, {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
