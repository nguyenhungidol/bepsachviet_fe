import { apiRequest } from "./apiClient";
import { getStoredToken } from "./userService";

// Helper to get auth headers
const withAuth = ({ method = "GET", data, signal } = {}) => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No auth token found for order request!");
  }

  return {
    method,
    signal,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  };
};

// ============ USER ORDER APIs ============

/**
 * POST /orders - Create new order
 * @param {Object} orderData - Order details
 * @param {string} orderData.deliveryName - Recipient name
 * @param {string} orderData.deliveryPhone - Recipient phone
 * @param {string} orderData.deliveryAddress - Delivery address
 * @param {string} [orderData.note] - Order note (optional)
 * @param {string} [orderData.paymentMethod] - Payment method (COD, BANK_TRANSFER, etc.)
 */
export const createOrder = async (orderData) => {
  return apiRequest(
    "/orders",
    withAuth({
      method: "POST",
      data: orderData,
    })
  );
};

/**
 * GET /orders/my-orders - Get current user's order history (paginated)
 * @param {Object} options
 * @param {number} [options.page=0] - Page number (0-indexed)
 * @param {number} [options.size=10] - Page size
 * @param {AbortSignal} [options.signal] - Abort signal
 */
export const fetchMyOrders = async ({ page = 0, size = 10, signal } = {}) => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());

  return apiRequest(
    `/orders/my-orders?${params.toString()}`,
    withAuth({ signal })
  );
};

/**
 * GET /orders/{orderId} - Get order details
 * @param {string} orderId - Order ID
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Abort signal
 */
export const fetchOrderById = async (orderId, { signal } = {}) => {
  if (!orderId) {
    throw new Error("Thiếu mã đơn hàng");
  }
  return apiRequest(`/orders/${orderId}`, withAuth({ signal }));
};

// ============ ADMIN ORDER APIs ============

/**
 * GET /admin/orders - Get all orders (paginated, filterable)
 * @param {Object} options
 * @param {number} [options.page=0] - Page number
 * @param {number} [options.size=10] - Page size
 * @param {string} [options.status] - Filter by status (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELED)
 * @param {string} [options.search] - Search by order ID or customer name
 * @param {AbortSignal} [options.signal] - Abort signal
 */
export const fetchAdminOrders = async ({
  page = 0,
  size = 10,
  status,
  search,
  signal,
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  return apiRequest(`/admin/orders?${params.toString()}`, withAuth({ signal }));
};

/**
 * GET /orders/{orderId} - Get order details (admin)
 * @param {string} orderId - Order ID
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Abort signal
 */
export const fetchAdminOrderById = async (orderId, { signal } = {}) => {
  if (!orderId) {
    throw new Error("Thiếu mã đơn hàng");
  }
  return apiRequest(`/orders/${orderId}`, withAuth({ signal }));
};

/**
 * PATCH /admin/orders/{orderId}/status - Update order status
 *
 * @param {string} orderId - Order ID
 * @param {string} status - New status (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELED)
 */
export const updateOrderStatus = async (orderId, status) => {
  if (!orderId) {
    throw new Error("Thiếu mã đơn hàng");
  }
  return apiRequest(
    `/admin/orders/${orderId}/status`,
    withAuth({
      method: "PATCH",
      data: { status },
    })
  );
};

// ============ ORDER STATUS HELPERS ============

export const ORDER_STATUSES = {
  PENDING: { label: "Chờ xác nhận", color: "warning", icon: "bi-clock" },
  CONFIRMED: { label: "Đã xác nhận", color: "info", icon: "bi-check2" },
  SHIPPING: { label: "Đang giao hàng", color: "primary", icon: "bi-truck" },
  DELIVERED: { label: "Đã giao hàng", color: "success", icon: "bi-check2-all" },
  CANCELED: { label: "Đã hủy", color: "danger", icon: "bi-x-circle" },
};

export const getOrderStatusInfo = (status) => {
  return (
    ORDER_STATUSES[status] || {
      label: status,
      color: "secondary",
      icon: "bi-question-circle",
    }
  );
};

export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: {
    label: "Thanh toán khi nhận hàng (COD)",
    icon: "bi-cash",
  },
  MOMO: { label: "Ví MoMo", icon: "bi-wallet2" },
};

export const getPaymentMethodInfo = (method) => {
  return PAYMENT_METHODS[method] || { label: method, icon: "bi-credit-card" };
};

// ============ FORMAT HELPERS ============

export const formatOrderDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatPrice = (price) => {
  if (price === null || price === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const orderService = {
  // User APIs
  createOrder,
  fetchMyOrders,
  fetchOrderById,
  // Admin APIs
  fetchAdminOrders,
  fetchAdminOrderById,
  updateOrderStatus,
  // Helpers
  ORDER_STATUSES,
  getOrderStatusInfo,
  PAYMENT_METHODS,
  getPaymentMethodInfo,
  formatOrderDate,
  formatPrice,
};

export default orderService;
