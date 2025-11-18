import { apiRequest } from "./apiClient";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const fetchCategories = async ({ signal } = {}) => {
  const data = await apiRequest("/categories", { signal });
  return normalizeList(data);
};

export const fetchActiveCategories = async ({ signal } = {}) => {
  const categories = await fetchCategories({ signal });
  return categories.filter((category) => category?.active);
};

const categoryService = {
  fetchCategories,
  fetchActiveCategories,
};

export default categoryService;
