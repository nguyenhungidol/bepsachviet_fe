import { apiRequest } from "./apiClient";

const DEFAULT_PLACEHOLDER = "https://via.placeholder.com/300x300?text=No+Image";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content; // handle paginated response
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const trimmed =
      typeof value === "string" ? value.trim() : value.toString?.() ?? value;
    if (trimmed === "") return;
    searchParams.set(key, trimmed);
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const formatPriceLabel = (price) => {
  if (price === null || price === undefined || price === "") {
    return "LIÊN HỆ";
  }

  if (typeof price === "number") {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  }

  if (typeof price === "string") {
    return price.trim() || "LIÊN HỆ";
  }

  return "LIÊN HỆ";
};

const generateFallbackId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `product-${Math.random().toString(36).substring(2, 9)}`;

const deriveId = (product) =>
  product?.productId ||
  product?.id ||
  product?.code ||
  product?.slug ||
  product?.name ||
  generateFallbackId();

const normalizeProduct = (product) => {
  if (!product || typeof product !== "object") {
    return null;
  }

  const hasTag = (tag) =>
    Array.isArray(product.tags) &&
    product.tags.some((item) => {
      if (typeof item === "string") {
        return item.toUpperCase() === tag.toUpperCase();
      }
      if (typeof item === "object") {
        return (
          item?.code?.toUpperCase?.() === tag.toUpperCase() ||
          item?.name?.toUpperCase?.() === tag.toUpperCase()
        );
      }
      return false;
    });

  const normalized = {
    id: deriveId(product),
    productId: product.productId || product.id || null,
    name: product.name || product.title || "Sản phẩm",
    description: product.description || product.detail || "",
    imageSrc:
      product.imageUrl ||
      product.image ||
      product.thumbnail ||
      product.coverImage ||
      DEFAULT_PLACEHOLDER,
    ocUrl: product.ocopImageUrl || product.ocopUrl || product.ocopBadgeUrl,
    price: product.price,
    priceLabel: formatPriceLabel(product.price ?? product.priceLabel),
    categoryId: product.categoryId || product.category?.categoryId || null,
    isBestSeller:
      product.bestSeller ?? product.isBestSeller ?? hasTag("BEST") ?? false,
    isNew: product.isNew ?? product.newProduct ?? hasTag("NEW") ?? false,
  };

  return normalized;
};

export const fetchProducts = async ({ signal, search } = {}) => {
  const query = buildQueryString({ search });
  const data = await apiRequest(`/products${query}`, { signal });
  return normalizeList(data).map(normalizeProduct).filter(Boolean);
};

export const fetchProductById = async (productId, { signal } = {}) => {
  if (!productId) throw new Error("productId is required");
  const data = await apiRequest(`/products/${productId}`, { signal });
  return normalizeProduct(data);
};

export const fetchProductsByCategory = async (categoryId, { signal } = {}) => {
  if (!categoryId) throw new Error("categoryId is required");
  const data = await apiRequest(`/categories/${categoryId}/products`, {
    signal,
  });
  return normalizeList(data).map(normalizeProduct).filter(Boolean);
};

const productService = {
  fetchProducts,
  fetchProductById,
  fetchProductsByCategory,
};

export default productService;
