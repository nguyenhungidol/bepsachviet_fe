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

const readFromStorages = (key) => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
};

const parseStoredUser = () => {
  try {
    const raw = readFromStorages(USER_INFO_KEY);
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

export const saveAuthData = ({ token, user, remember = true }) => {
  if (typeof window === "undefined") return;
  const persistentStore = remember
    ? window.localStorage
    : window.sessionStorage;
  const secondaryStore = remember ? window.sessionStorage : window.localStorage;

  if (token) {
    persistentStore.setItem(AUTH_TOKEN_KEY, token);
    secondaryStore.removeItem(AUTH_TOKEN_KEY);
  }
  if (user) {
    persistentStore.setItem(USER_INFO_KEY, JSON.stringify(user));
    secondaryStore.removeItem(USER_INFO_KEY);
  }
  emitAuthStateChange();
};

export const clearAuthData = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(USER_INFO_KEY);
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_INFO_KEY);
  emitAuthStateChange();
};

export const getStoredUser = () => parseStoredUser();

export const getStoredToken = () => readFromStorages(AUTH_TOKEN_KEY);

const userService = {
  loginUser,
  registerUser,
  saveAuthData,
  clearAuthData,
  getStoredUser,
  getStoredToken,
};

export default userService;
