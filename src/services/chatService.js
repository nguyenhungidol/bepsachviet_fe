import { apiRequest, API_BASE_URL } from "./apiClient";
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

// ============ CUSTOMER CHAT APIs ============

/**
 * Start a new chat conversation
 * @param {Object} data - Guest info if not logged in
 * @param {string} [data.guestEmail] - Guest email
 * @param {string} [data.guestPhone] - Guest phone
 * @param {string} [data.guestName] - Guest name
 */
export const startConversation = async (data = {}) => {
  return apiRequest(
    "/chat/conversations",
    withAuth({
      method: "POST",
      data,
    })
  );
};

/**
 * Get current user's active conversation
 * @param {Object} options
 * @param {string} [options.guestEmail] - Guest email (for guest users)
 * @param {string} [options.guestPhone] - Guest phone (for guest users)
 */
export const getMyConversation = async ({
  guestEmail,
  guestPhone,
  signal,
} = {}) => {
  const params = new URLSearchParams();
  if (guestEmail) params.set("guestEmail", guestEmail);
  if (guestPhone) params.set("guestPhone", guestPhone);

  const queryString = params.toString();
  const url = `/chat/conversations/me${queryString ? `?${queryString}` : ""}`;

  return apiRequest(url, withAuth({ signal }));
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} content - Message content
 */
export const sendMessage = async (conversationId, content) => {
  return apiRequest(
    `/chat/conversations/${conversationId}/messages`,
    withAuth({
      method: "POST",
      data: { content },
    })
  );
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} options
 */
export const getMessages = async (conversationId, { signal } = {}) => {
  return apiRequest(
    `/chat/conversations/${conversationId}/messages`,
    withAuth({ signal })
  );
};

/**
 * Close/end a conversation (customer side)
 * @param {string} conversationId - Conversation ID
 */
export const closeConversation = async (conversationId) => {
  return apiRequest(
    `/chat/conversations/${conversationId}/close`,
    withAuth({ method: "POST" })
  );
};

/**
 * Reopen a completed/closed conversation (customer side)
 * This will change status from COMPLETED back to PENDING
 * @param {string} conversationId - Conversation ID
 */
export const reopenConversation = async (conversationId) => {
  return apiRequest(
    `/chat/conversations/${conversationId}/reopen`,
    withAuth({ method: "POST" })
  );
};

// ============ ADMIN CHAT APIs ============

/**
 * Get all conversations (admin)
 * @param {Object} options
 * @param {string} [options.status] - Filter by status: PENDING, ACTIVE, CLOSED
 * @param {number} [options.page=0] - Page number
 * @param {number} [options.size=20] - Page size
 */
export const getAdminConversations = async ({
  status,
  page = 0,
  size = 20,
  signal,
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());
  if (status) params.set("status", status);

  return apiRequest(
    `/admin/chat/conversations?${params.toString()}`,
    withAuth({ signal })
  );
};

/**
 * Get pending conversations count (for notification badge)
 */
export const getPendingCount = async ({ signal } = {}) => {
  return apiRequest(
    "/admin/chat/conversations/pending-count",
    withAuth({ signal })
  );
};

/**
 * Assign a conversation to the current admin
 * @param {string} conversationId - Conversation ID
 */
export const assignConversation = async (conversationId) => {
  return apiRequest(
    `/admin/chat/conversations/${conversationId}/assign`,
    withAuth({ method: "POST" })
  );
};

/**
 * Admin sends a message
 * @param {string} conversationId - Conversation ID
 * @param {string} content - Message content
 */
export const adminSendMessage = async (conversationId, content) => {
  return apiRequest(
    `/admin/chat/conversations/${conversationId}/messages`,
    withAuth({
      method: "POST",
      data: { content },
    })
  );
};

/**
 * Mark conversation as completed/archived
 * @param {string} conversationId - Conversation ID
 */
export const finishConversation = async (conversationId) => {
  return apiRequest(
    `/admin/chat/conversations/${conversationId}/finish`,
    withAuth({ method: "POST" })
  );
};

/**
 * Get customer's order history (for admin support context)
 * @param {string} conversationId - Conversation ID
 */
export const getCustomerOrders = async (conversationId, { signal } = {}) => {
  return apiRequest(
    `/admin/chat/conversations/${conversationId}/customer-orders`,
    withAuth({ signal })
  );
};

// ============ WEBSOCKET CONNECTION ============

/**
 * Create WebSocket connection for real-time chat
 * @param {string} conversationId - Conversation ID
 * @param {Object} handlers - Event handlers
 * @param {Function} handlers.onMessage - Called when new message arrives
 * @param {Function} handlers.onOpen - Called when connection opens
 * @param {Function} handlers.onClose - Called when connection closes
 * @param {Function} handlers.onError - Called on error
 */
export const createChatWebSocket = (conversationId, handlers = {}) => {
  const token = getStoredToken();
  const wsBaseUrl = API_BASE_URL.replace(/^http/, "ws").replace(
    "/api/v1.0",
    ""
  );
  const wsUrl = `${wsBaseUrl}/ws/chat?conversationId=${conversationId}${
    token ? `&token=${token}` : ""
  }`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("Chat WebSocket connected");
    handlers.onOpen?.();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handlers.onMessage?.(data);
    } catch (err) {
      console.error("Failed to parse WebSocket message:", err);
    }
  };

  ws.onclose = (event) => {
    console.log("Chat WebSocket closed:", event.code, event.reason);
    handlers.onClose?.(event);
  };

  ws.onerror = (error) => {
    console.error("Chat WebSocket error:", error);
    handlers.onError?.(error);
  };

  return ws;
};

/**
 * Create WebSocket for admin notifications (new conversations)
 * @param {Object} handlers - Event handlers
 */
export const createAdminNotificationSocket = (handlers = {}) => {
  const token = getStoredToken();
  if (!token) return null;

  const wsBaseUrl = API_BASE_URL.replace(/^http/, "ws").replace(
    "/api/v1.0",
    ""
  );
  const wsUrl = `${wsBaseUrl}/ws/admin/notifications?token=${token}`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("Admin notification WebSocket connected");
    handlers.onOpen?.();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handlers.onMessage?.(data);
    } catch (err) {
      console.error("Failed to parse notification message:", err);
    }
  };

  ws.onclose = (event) => {
    console.log("Admin notification WebSocket closed");
    handlers.onClose?.(event);
  };

  ws.onerror = (error) => {
    console.error("Admin notification WebSocket error:", error);
    handlers.onError?.(error);
  };

  return ws;
};

// ============ POLLING FALLBACK ============

// ============ LOCAL STORAGE FOR GUEST ============

const GUEST_CONVERSATION_KEY = "bepsachviet_guest_conversation";

export const saveGuestConversation = (conversationId, guestInfo) => {
  localStorage.setItem(
    GUEST_CONVERSATION_KEY,
    JSON.stringify({ conversationId, guestInfo, timestamp: Date.now() })
  );
};

export const getGuestConversation = () => {
  try {
    const data = localStorage.getItem(GUEST_CONVERSATION_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);
    // Expire after 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(GUEST_CONVERSATION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearGuestConversation = () => {
  localStorage.removeItem(GUEST_CONVERSATION_KEY);
};
