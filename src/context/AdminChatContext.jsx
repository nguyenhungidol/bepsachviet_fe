import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getPendingCount,
  getAdminConversations,
} from "../services/chatService";

const AdminChatContext = createContext(null);

// Play notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // Ignore audio errors
  }
};

// Request browser notification permission
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

// Show browser notification
const showBrowserNotification = (title, body, onClick) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "chat-notification",
      renotify: true,
    });
    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };
    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
};

export const AdminChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const pollIntervalRef = useRef(null);
  const prevPendingCountRef = useRef(0);
  const prevLastMessageRef = useRef(null);
  const toastIdRef = useRef(0);

  // Check if user is admin
  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  // Request notification permission on mount
  useEffect(() => {
    if (isAdmin) {
      requestNotificationPermission();
    }
  }, [isAdmin]);

  // Add toast notification
  const addToast = useCallback((message, type = "info", onClick = null) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [
      ...prev,
      { id, message, type, onClick, duration: 5000 },
    ]);
    return id;
  }, []);

  // Remove toast notification
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Fetch pending count and check for new messages
  const fetchPendingCount = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await getPendingCount();
      const count = response?.pendingCount ?? 0;
      const newCount = typeof count === "number" ? count : 0;

      // Check if pending count increased (new conversation)
      if (
        newCount > prevPendingCountRef.current &&
        prevPendingCountRef.current > 0
      ) {
        setHasNewMessage(true);
        playNotificationSound();
      }

      prevPendingCountRef.current = newCount;
      setPendingCount(newCount);
    } catch (err) {
      console.error("Failed to fetch pending count:", err);
    }
  }, [isAdmin]);

  // Helper to get customer name from conversation
  const getCustomerName = useCallback((conv) => {
    if (conv.customer?.name) return conv.customer.name;
    if (conv.userName) return conv.userName;
    if (conv.user?.name) return conv.user.name;
    if (conv.guestName) return conv.guestName;
    if (conv.customer?.email) return conv.customer.email.split("@")[0];
    if (conv.userEmail) return conv.userEmail.split("@")[0];
    if (conv.guestPhone) return `Khách ${conv.guestPhone}`;
    if (conv.guestEmail) return conv.guestEmail.split("@")[0];
    return "Khách";
  }, []);

  // Check for new messages in active conversations
  const checkNewMessages = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Get all conversations to check for new messages
      const response = await getAdminConversations({ size: 10 });
      const conversations = response?.content || [];

      // Update recent notifications
      setRecentNotifications(
        conversations.slice(0, 5).map((conv) => ({
          id: conv.conversationId || conv.id,
          customerName: getCustomerName(conv),
          preview: conv.lastMessage || "Tin nhắn mới",
          time: conv.lastMessageAt || conv.updatedAt,
          status: conv.status,
          unread: conv.unreadCount > 0 || conv.hasUnread,
        }))
      );

      if (conversations.length > 0) {
        // Find the most recent message time
        const latestConv = conversations.reduce((latest, conv) => {
          const convTime = new Date(
            conv.lastMessageAt || conv.updatedAt || 0
          ).getTime();
          const latestTime = new Date(
            latest?.lastMessageAt || latest?.updatedAt || 0
          ).getTime();
          return convTime > latestTime ? conv : latest;
        }, conversations[0]);

        const latestTime = latestConv?.lastMessageAt || latestConv?.updatedAt;

        if (latestTime && prevLastMessageRef.current) {
          const newTime = new Date(latestTime).getTime();
          const prevTime = new Date(prevLastMessageRef.current).getTime();

          // Kiểm tra sender type - chỉ thông báo khi tin nhắn từ khách hàng
          const lastSenderType = (
            latestConv.lastMessageSenderType ||
            latestConv.lastSenderType ||
            (typeof latestConv.lastMessage === "object"
              ? latestConv.lastMessage?.senderType
              : null) ||
            ""
          ).toUpperCase();

          const isFromCustomer =
            lastSenderType !== "ADMIN" && lastSenderType !== "SYSTEM";

          // New message detected - chỉ thông báo nếu từ khách hàng
          if (newTime > prevTime && isFromCustomer) {
            setHasNewMessage(true);
            playNotificationSound();

            // Show toast notification
            const customerName = getCustomerName(latestConv);
            const preview = latestConv.lastMessage || "Tin nhắn mới";
            addToast(
              `${customerName}: ${preview.substring(0, 50)}${
                preview.length > 50 ? "..." : ""
              }`,
              "info",
              () => {
                // Navigate to chat when clicked
                window.location.href = `/admin/chat?id=${
                  latestConv.conversationId || latestConv.id
                }`;
              }
            );

            // Show browser notification if page is not focused
            if (document.hidden) {
              showBrowserNotification(
                "Tin nhắn mới từ khách hàng",
                `${customerName}: ${preview.substring(0, 100)}`,
                () => {
                  window.location.href = `/admin/chat?id=${
                    latestConv.conversationId || latestConv.id
                  }`;
                }
              );
            }
          }
        }

        if (latestTime) {
          prevLastMessageRef.current = latestTime;
        }
      }
    } catch (err) {
      console.error("Failed to check new messages:", err);
    }
  }, [isAdmin, addToast, getCustomerName]);

  // Start polling when admin is logged in
  useEffect(() => {
    if (!isAdmin) {
      setPendingCount(0);
      setHasNewMessage(false);
      return;
    }

    // Fetch immediately
    fetchPendingCount();
    checkNewMessages();

    // Poll every 10 seconds for faster notification
    pollIntervalRef.current = setInterval(() => {
      fetchPendingCount();
      checkNewMessages();
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isAdmin, fetchPendingCount, checkNewMessages]);

  // Mark that there's a new message (for notification)
  const notifyNewMessage = useCallback(() => {
    setHasNewMessage(true);
    // Auto-clear after 5 seconds
    setTimeout(() => setHasNewMessage(false), 5000);
  }, []);

  // Clear new message notification
  const clearNewMessageNotification = useCallback(() => {
    setHasNewMessage(false);
  }, []);

  // Refresh pending count (called after admin actions)
  const refreshPendingCount = useCallback(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  const value = {
    pendingCount,
    hasNewMessage,
    toasts,
    recentNotifications,
    addToast,
    removeToast,
    clearToasts,
    notifyNewMessage,
    clearNewMessage: clearNewMessageNotification,
    clearNewMessageNotification,
    refreshPendingCount,
  };

  return (
    <AdminChatContext.Provider value={value}>
      {children}
    </AdminChatContext.Provider>
  );
};

export const useAdminChat = () => {
  const context = useContext(AdminChatContext);
  if (!context) {
    throw new Error("useAdminChat must be used within an AdminChatProvider");
  }
  return context;
};

export default AdminChatContext;
