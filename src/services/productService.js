import { toast } from "react-toastify";
import { apiRequest } from "./apiClient";

const DEFAULT_PLACEHOLDER = "https://via.placeholder.com/300x300?text=No+Image";
const CDN_BASE_URL = (
  import.meta?.env?.VITE_ASSET_CDN_URL ||
  import.meta?.env?.VITE_IMAGE_BASE_URL ||
  ""
).replace(/\/$/, "");

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

const resolveStorageUrl = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    if (/^https?:/i.test(value)) {
      return value;
    }
    if (CDN_BASE_URL) {
      return `${CDN_BASE_URL}/${value.replace(/^\/+/, "")}`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    const firstValid = value.find(Boolean);
    return resolveStorageUrl(firstValid);
  }

  if (typeof value === "object") {
    return resolveStorageUrl(
      value.url ||
        value.publicUrl ||
        value.secureUrl ||
        value.signedUrl ||
        value.path ||
        value.key
    );
  }

  return null;
};

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

  const storageImage =
    resolveStorageUrl(product.imageStorageUrl) ||
    resolveStorageUrl(product.imageStorage) ||
    resolveStorageUrl(product.storageImage) ||
    resolveStorageUrl(product.imageKey);

  const normalized = {
    id: deriveId(product),
    productId: product.productId || product.id || null,
    name: product.name || product.title || "Sản phẩm",
    description: product.description || product.detail || "",
    imageSrc:
      product.imageSrc ||
      storageImage ||
      product.imageUrl ||
      product.image ||
      product.thumbnail ||
      product.coverImage ||
      DEFAULT_PLACEHOLDER,
    ocUrl:
      product.ocUrl ||
      product.ocopImageUrl ||
      product.ocopUrl ||
      product.ocopBadgeUrl ||
      null,
    price: product.price,
    priceLabel: formatPriceLabel(product.price ?? product.priceLabel),
    categoryId: product.categoryId || product.category?.categoryId || null,
    categoryName: product.categoryName || product.category?.name || null,
    stockQuantity:
      product.stockQuantity ?? product.stock ?? product.quantity ?? null,
    isBestSeller:
      product.bestSeller ?? product.isBestSeller ?? hasTag("BEST") ?? false,
    isNew: product.isNew ?? product.newProduct ?? hasTag("NEW") ?? false,
    // Soft delete: product is active by default, unless explicitly set to false
    isActive:
      product.active !== false &&
      product.isActive !== false &&
      !product.deletedAt,
  };

  return normalized;
};

export const fetchProducts = async ({ signal, search } = {}) => {
  const query = buildQueryString({ search });
  const data = await apiRequest(`/products${query}`, { signal });
  return normalizeList(data).map(normalizeProduct).filter(Boolean);
};

// Fetch only active products (for public pages)
export const fetchActiveProducts = async ({ signal, search } = {}) => {
  const query = buildQueryString({ search });
  const data = await apiRequest(`/products${query}`, { signal });
  return normalizeList(data)
    .map(normalizeProduct)
    .filter((product) => product && product.isActive);
};

export const fetchProductById = async (productId, { signal } = {}) => {
  if (!productId) {
    const message = "Thiếu mã sản phẩm.";
    toast.error(message);
    return Promise.reject(new Error(message));
  }
  const data = await apiRequest(`/products/${productId}`, { signal });
  return normalizeProduct(data);
};

export const fetchProductsByCategory = async (categoryId, { signal } = {}) => {
  if (!categoryId) {
    const message = "Thiếu mã danh mục.";
    toast.error(message);
    return Promise.reject(new Error(message));
  }
  const data = await apiRequest(`/categories/${categoryId}/products`, {
    signal,
  });
  return normalizeList(data).map(normalizeProduct).filter(Boolean);
};

// Check if a product is available (active and in stock)
export const isProductAvailable = (product) => {
  if (!product) return false;
  // Check if product is active (not soft deleted)
  if (product.isActive === false || product.active === false) return false;
  // Check stock (null means no stock tracking, so it's available)
  if (
    product.stockQuantity !== null &&
    product.stockQuantity !== undefined &&
    product.stockQuantity <= 0
  )
    return false;
  return true;
};

// Validate cart items against current product status
export const validateCartItems = async (cartItems) => {
  if (!cartItems || cartItems.length === 0) return { valid: [], invalid: [] };

  const validItems = [];
  const invalidItems = [];

  for (const item of cartItems) {
    try {
      const productId = item.productId || item.id;
      const product = await fetchProductById(productId);

      if (!product || !product.isActive) {
        invalidItems.push({
          ...item,
          reason: "INACTIVE",
          message: "Sản phẩm không còn kinh doanh",
        });
      } else if (product.stockQuantity !== null && product.stockQuantity <= 0) {
        invalidItems.push({
          ...item,
          reason: "OUT_OF_STOCK",
          message: "Sản phẩm đã hết hàng",
        });
      } else if (
        product.stockQuantity !== null &&
        item.quantity > product.stockQuantity
      ) {
        invalidItems.push({
          ...item,
          reason: "INSUFFICIENT_STOCK",
          message: `Chỉ còn ${product.stockQuantity} sản phẩm`,
          availableQuantity: product.stockQuantity,
        });
      } else {
        validItems.push({ ...item, product });
      }
    } catch {
      // Product not found - treat as inactive
      invalidItems.push({
        ...item,
        reason: "NOT_FOUND",
        message: "Sản phẩm không tồn tại",
      });
    }
  }

  return { valid: validItems, invalid: invalidItems };
};

const productService = {
  fetchProducts,
  fetchActiveProducts,
  fetchProductById,
  fetchProductsByCategory,
  isProductAvailable,
  validateCartItems,
};

export default productService;
