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

const withAuth = ({ method = "GET", data } = {}) => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  };
};

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

// ============ AUTH APIs ============

export const loginUser = async (credentials) => {
  return apiRequest("/login", jsonOptions(credentials));
};

export const registerUser = async (payload) => {
  return apiRequest("/registers", jsonOptions(payload));
};

// ============ PASSWORD APIs ============

/**
 * POST /forgot-password - Request password reset email
 * @param {string} email - User's email address
 */
export const forgotPassword = async (email) => {
  return apiRequest("/forgot-password", jsonOptions({ email }));
};

/**
 * POST /reset-password - Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 */
export const resetPassword = async (token, newPassword) => {
  return apiRequest(
    "/reset-password",
    jsonOptions({ resetToken: token, newPassword })
  );
};

/**
 * POST /change-password - Change password (authenticated)
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
export const changePassword = async (currentPassword, newPassword) => {
  return apiRequest(
    "/change-password",
    withAuth({ method: "POST", data: { currentPassword, newPassword } })
  );
};

// ============ PROFILE APIs ============

/**
 * GET /user/profile - Get current user profile
 */
export const getUserProfile = async () => {
  return apiRequest("/user/profile", withAuth());
};

/**
 * PUT /user/profile - Update user profile
 * @param {Object} profileData - Profile data to update (name, phone, address, etc.)
 */
export const updateUserProfile = async (profileData) => {
  return apiRequest(
    "/user/profile",
    withAuth({ method: "PUT", data: profileData })
  );
};

// ============ LOCAL STORAGE ============

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

export const updateStoredUser = (userData) => {
  if (typeof window === "undefined") return;
  const currentUser = parseStoredUser();
  const updatedUser = { ...currentUser, ...userData };

  // Check which storage has the user
  if (window.localStorage.getItem(USER_INFO_KEY)) {
    window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUser));
  } else if (window.sessionStorage.getItem(USER_INFO_KEY)) {
    window.sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUser));
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
  forgotPassword,
  resetPassword,
  changePassword,
  getUserProfile,
  updateUserProfile,
  saveAuthData,
  updateStoredUser,
  clearAuthData,
  getStoredUser,
  getStoredToken,
};

export default userService;
