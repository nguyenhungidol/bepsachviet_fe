import { toast } from "react-toastify";
import { apiRequest } from "./apiClient";
import { getStoredToken } from "./userService";

const LOCAL_CART_KEY = "bepsachviet_cart";

// Helper to get auth headers
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

// ============ LOCAL STORAGE CART (for guests) ============

export const getLocalCart = () => {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveLocalCart = (items) => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage", error);
  }
};

export const clearLocalCart = () => {
  try {
    localStorage.removeItem(LOCAL_CART_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage cart", error);
  }
};

export const addToLocalCart = (product, quantity = 1) => {
  const cart = getLocalCart();
  const productId = product.productId || product.id;

  const existingIndex = cart.findIndex(
    (item) => (item.productId || item.id) === productId
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
    // Update stockQuantity in case it changed
    if (product.stockQuantity !== undefined) {
      cart[existingIndex].stockQuantity = product.stockQuantity;
    }
  } else {
    // Generate a unique itemId for localStorage items
    const itemId = `local_${productId}_${Date.now()}`;
    cart.push({
      itemId,
      productId,
      name: product.name,
      price: product.price,
      imageSrc: product.imageSrc || product.imageUrl,
      quantity,
      stockQuantity: product.stockQuantity ?? null,
    });
  }

  saveLocalCart(cart);
  // Return a new array reference to ensure React detects the change
  return [...cart];
};

export const updateLocalCartItem = (itemIdOrProductId, quantity) => {
  const cart = getLocalCart();
  // Find by itemId first, then by productId
  const index = cart.findIndex(
    (item) =>
      item.itemId === itemIdOrProductId ||
      item.productId === itemIdOrProductId ||
      item.id === itemIdOrProductId
  );

  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index] = { ...cart[index], quantity };
    }
  }

  saveLocalCart(cart);
  // Return a new array reference to ensure React detects the change
  return [...cart];
};

export const removeFromLocalCart = (itemIdOrProductId) => {
  const cart = getLocalCart();
  const filtered = cart.filter(
    (item) =>
      item.itemId !== itemIdOrProductId &&
      item.productId !== itemIdOrProductId &&
      item.id !== itemIdOrProductId
  );
  saveLocalCart(filtered);
  // Return a new array reference
  return [...filtered];
};

export const getLocalCartCount = () => {
  const cart = getLocalCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

// ============ API CART (for authenticated users) ============

/**
 * GET /cart - Get user's cart
 */
export const fetchCart = async ({ signal } = {}) => {
  try {
    const response = await apiRequest("/cart", withAuth({ signal }));
    return normalizeCart(response);
  } catch (error) {
    console.error(
      "[CartService] fetchCart error:",
      error.status,
      error.message
    );
    if (error.status === 403) {
      console.warn(
        "[CartService] 403 Forbidden - Check if cart API is enabled on backend"
      );
    }
    throw error;
  }
};

/**
 * POST /cart/items - Add item to cart
 */
export const addCartItem = async (productId, quantity = 1) => {
  if (!productId) {
    toast.error("Thiếu mã sản phẩm.");
    return Promise.reject(new Error("Missing productId"));
  }

  try {
    const response = await apiRequest(
      "/cart/items",
      withAuth({
        method: "POST",
        data: { productId, quantity },
      })
    );
    return normalizeCart(response);
  } catch (error) {
    console.error(
      "[CartService] addCartItem error:",
      error.status,
      error.message
    );
    if (error.status === 403) {
      console.warn(
        "[CartService] 403 Forbidden - Check if cart API is enabled on backend"
      );
    }
    throw error;
  }
};

/**
 * PUT /cart/items/{itemId} - Update item quantity
 */
export const updateCartItem = async (itemId, quantity) => {
  if (!itemId) {
    toast.error("Thiếu mã sản phẩm.");
    return Promise.reject(new Error("Missing itemId"));
  }

  try {
    const response = await apiRequest(
      `/cart/items/${itemId}`,
      withAuth({
        method: "PUT",
        data: { quantity },
      })
    );
    return normalizeCart(response);
  } catch (error) {
    console.error(
      "[CartService] updateCartItem error:",
      error.status,
      error.message
    );
    if (error.status === 403) {
      console.warn(
        "[CartService] 403 Forbidden - Check if cart API is enabled on backend"
      );
    }
    throw error;
  }
};

/**
 * DELETE /cart/items/{itemId} - Remove item from cart
 */
export const removeCartItem = async (itemId) => {
  if (!itemId) {
    toast.error("Thiếu mã sản phẩm.");
    return Promise.reject(new Error("Missing itemId"));
  }

  const response = await apiRequest(
    `/cart/items/${itemId}`,
    withAuth({ method: "DELETE" })
  );
  return normalizeCart(response);
};

/**
 * DELETE /cart - Clear entire cart
 */
export const clearCart = async () => {
  const response = await apiRequest("/cart", withAuth({ method: "DELETE" }));
  return normalizeCart(response);
};

/**
 * GET /cart/count - Get cart item count
 */
export const fetchCartCount = async ({ signal } = {}) => {
  const response = await apiRequest("/cart/count", withAuth({ signal }));
  return typeof response === "number" ? response : response?.count || 0;
};

/**
 * POST /cart/sync - Sync localStorage cart with server
 */
export const syncCart = async (localItems = []) => {
  const response = await apiRequest(
    "/cart/sync",
    withAuth({
      method: "POST",
      data: { items: localItems },
    })
  );
  return normalizeCart(response);
};

// ============ HELPERS ============

const normalizeCartItem = (item) => {
  if (!item) return null;
  const productId =
    item.productId || item.product?.productId || item.product?.id;

  return {
    // For localStorage items, itemId might be like "local_123_timestamp"
    // For API items, it's the cart item ID
    itemId: item.itemId || item.cartItemId || item.id || `local_${productId}`,
    productId,

    // Map tên sản phẩm (Backend: productName)
    name: item.productName || item.name || item.product?.name || "Sản phẩm",

    // Map giá (Backend: productPrice)
    // Ưu tiên lấy productPrice (từ Backend), sau đó mới đến price (Local)
    price: item.productPrice ?? item.price ?? item.product?.price ?? 0,

    // Map ảnh (Backend: productImageSrc)
    imageSrc:
      item.productImageSrc || // <-- Quan trọng: lấy từ backend
      item.imageSrc ||
      item.imageUrl ||
      item.product?.imageSrc ||
      item.product?.imageUrl ||
      "https://via.placeholder.com/100?text=No+Image", // <-- Fallback image

    quantity: item.quantity || 1,

    // Stock quantity for validation
    stockQuantity:
      item.stockQuantity ??
      item.productStockQuantity ??
      item.product?.stockQuantity ??
      null,
  };
};

const normalizeCart = (response) => {
  if (!response) {
    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  // Handle different response formats
  const items = (
    response.items ||
    response.cartItems ||
    response.content ||
    (Array.isArray(response) ? response : [])
  )
    .map(normalizeCartItem)
    .filter(Boolean);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    cartId: response.cartId || response.id,
    items,
    totalItems,
    totalPrice,
  };
};

const cartService = {
  // Local storage
  getLocalCart,
  saveLocalCart,
  clearLocalCart,
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  getLocalCartCount,
  // API
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  fetchCartCount,
  syncCart,
};

export default cartService;
