import { apiRequest } from "./apiClient";

const AUTH_TOKEN_KEY = "authToken";
const USER_INFO_KEY = "userInfo";
export const AUTH_STATE_EVENT = "auth-state-changed";

const jsonOptions = (payload) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to parse stored user", error);
    return null;
  }
};

const emitAuthStateChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  }
};

export const loginUser = async (credentials) => {
  return apiRequest("/login", jsonOptions(credentials));
};

export const registerUser = async (payload) => {
  return apiRequest("/register", jsonOptions(payload));
};

export const saveAuthData = ({ token, user }) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  }
  emitAuthStateChange();
};

export const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  emitAuthStateChange();
};

export const getStoredUser = () => parseStoredUser();

export const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const userService = {
  loginUser,
  registerUser,
  saveAuthData,
  clearAuthData,
  getStoredUser,
  getStoredToken,
};

export default userService;
