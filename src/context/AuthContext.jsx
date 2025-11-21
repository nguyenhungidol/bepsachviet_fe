import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_STATE_EVENT,
  getStoredToken,
  getStoredUser,
} from "../services/userService";

const defaultValue = {
  user: null,
  token: null,
  role: "ROLE_USER",
  isAuthenticated: false,
  isAdmin: false,
};

const AuthContext = createContext(defaultValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleAuthChange = () => {
      setUser(getStoredUser());
      setToken(getStoredToken());
    };

    window.addEventListener(AUTH_STATE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_STATE_EVENT, handleAuthChange);
  }, []);

  const role = (user?.role || "ROLE_USER").toUpperCase();

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: Boolean(user && token),
      isAdmin: role === "ROLE_ADMIN",
      setUser,
    }),
    [user, token, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
