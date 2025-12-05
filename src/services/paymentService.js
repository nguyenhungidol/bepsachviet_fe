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
  }

  return {
    method,
    signal,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  };
};

// ============ MOMO PAYMENT APIs ============

/**
 * POST /payment/momo/create - Create MoMo payment
 * @param {string} orderId - Order ID to create payment for
 * @returns {Promise<{payUrl: string, orderId: string, requestId: string}>}
 */
export const createMoMoPayment = async (orderId) => {
  if (!orderId) {
    throw new Error("Thiếu mã đơn hàng");
  }

  return apiRequest(
    "/payment/momo/create",
    withAuth({
      method: "POST",
      data: { orderId },
    })
  );
};

/**
 * Check order payment status by polling
 * @param {string} orderId - Order ID to check
 * @returns {Promise<{status: string, paymentStatus: string}>}
 */
export const checkOrderStatus = async (orderId, { signal } = {}) => {
  if (!orderId) {
    throw new Error("Thiếu mã đơn hàng");
  }

  return apiRequest(`/orders/${orderId}`, withAuth({ signal }));
};

// ============ PAYMENT STATUS HELPERS ============

export const PAYMENT_STATUSES = {
  PENDING: { label: "Chờ thanh toán", color: "warning" },
  PAID: { label: "Đã thanh toán", color: "success" },
  FAILED: { label: "Thanh toán thất bại", color: "danger" },
  CANCELED: { label: "Đã hủy", color: "secondary" },
};

export const isPaymentCompleted = (order) => {
  // Check if order status is CONFIRMED or payment is successful
  return (
    order?.status === "CONFIRMED" ||
    order?.status === "SHIPPING" ||
    order?.status === "DELIVERED" ||
    order?.paymentStatus === "PAID" ||
    order?.paymentStatus === "SUCCESS"
  );
};

export const isPaymentCanceled = (order) => {
  return order?.status === "CANCELED" || order?.paymentStatus === "CANCELED";
};

const paymentService = {
  createMoMoPayment,
  checkOrderStatus,
  PAYMENT_STATUSES,
  isPaymentCompleted,
  isPaymentCanceled,
};

export default paymentService;
