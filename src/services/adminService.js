import { toast } from "react-toastify";
import { apiRequest } from "./apiClient";
import { getStoredToken } from "./userService";

const rejectWithToast = (message) => {
  toast.error(message);
  return Promise.reject(new Error(message));
};

const withAuth = ({ method = "GET", data, signal } = {}) => {
  const headers = {};
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return {
    method,
    signal,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  };
};

const adminGet = (endpoint, options) => apiRequest(endpoint, withAuth(options));
const adminMutation = (endpoint, options) =>
  apiRequest(endpoint, withAuth(options));

export const fetchAdminUsers = ({ signal } = {}) =>
  adminGet("/admin/users", { signal });

export const deleteAdminUser = (userId) => {
  if (!userId) {
    return rejectWithToast("Thiếu mã người dùng.");
  }
  return adminMutation(`/admin/users/${userId}`, { method: "DELETE" });
};

export const fetchAdminCategories = ({ signal } = {}) =>
  adminGet("/categories", { signal });

export const createAdminCategory = (payload) =>
  adminMutation("/admin/categories", { method: "POST", data: payload });

export const updateAdminCategory = (categoryId, payload) => {
  if (!categoryId) {
    return rejectWithToast("Thiếu mã danh mục.");
  }
  return adminMutation(`/admin/categories/${categoryId}`, {
    method: "PUT",
    data: payload,
  });
};

export const deleteAdminCategory = (categoryId) => {
  if (!categoryId) {
    return rejectWithToast("Thiếu mã danh mục.");
  }
  return adminMutation(`/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
};

export const fetchAdminProducts = ({ signal } = {}) =>
  adminGet("/products", { signal });

export const createAdminProduct = (payload) =>
  adminMutation("/admin/products", { method: "POST", data: payload });

export const updateAdminProduct = (productId, payload) => {
  if (!productId) {
    return rejectWithToast("Thiếu mã sản phẩm.");
  }
  return adminMutation(`/admin/products/${productId}`, {
    method: "PUT",
    data: payload,
  });
};

export const deleteAdminProduct = (productId) => {
  if (!productId) {
    return rejectWithToast("Thiếu mã sản phẩm.");
  }
  return adminMutation(`/admin/products/${productId}`, {
    method: "DELETE",
  });
};

// Posts
export const fetchAdminPosts = ({
  signal,
  page = 0,
  size = 100,
  categoryId,
  status,
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());
  if (categoryId) params.set("categoryId", categoryId);
  if (status) params.set("status", status);
  return adminGet(`/admin/posts?${params.toString()}`, { signal });
};

export const fetchAdminPostById = (postId, { signal } = {}) => {
  if (!postId) {
    return rejectWithToast("Thiếu mã bài viết.");
  }
  return adminGet(`/admin/posts/${postId}`, { signal });
};

export const createAdminPost = (payload) =>
  adminMutation("/admin/posts", { method: "POST", data: payload });

export const updateAdminPost = (postId, payload) => {
  if (!postId) {
    return rejectWithToast("Thiếu mã bài viết.");
  }
  return adminMutation(`/admin/posts/${postId}`, {
    method: "PUT",
    data: payload,
  });
};

export const deleteAdminPost = (postId) => {
  if (!postId) {
    return rejectWithToast("Thiếu mã bài viết.");
  }
  return adminMutation(`/admin/posts/${postId}`, {
    method: "DELETE",
  });
};

const adminService = {
  fetchAdminUsers,
  deleteAdminUser,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminPosts,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
};

export default adminService;
