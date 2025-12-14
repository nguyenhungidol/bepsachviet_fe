import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  getAdminConversations,
  getPendingCount,
  assignConversation,
  adminSendMessage,
  finishConversation,
  getMessages,
  getCustomerOrders,
  createChatWebSocket,
  createAdminNotificationSocket,
} from "../../services/chatService";
import "./AdminChat.css";

// Icons
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
  </svg>
);

// Format helpers
// Format thời gian cho danh sách conversation (ngắn gọn)
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("vi-VN", { weekday: "short" });
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

// Format thời gian đầy đủ cho tin nhắn (bao gồm ngày tháng năm)
const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) {
    return `Hôm nay, ${time}`;
  } else if (diffDays === 1) {
    return `Hôm qua, ${time}`;
  } else {
    const dateStr = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${dateStr}, ${time}`;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const ORDER_STATUS_MAP = {
  PENDING: { label: "Chờ xác nhận", class: "pending" },
  CONFIRMED: { label: "Đã xác nhận", class: "confirmed" },
  SHIPPING: { label: "Đang giao", class: "shipping" },
  DELIVERED: { label: "Đã giao", class: "delivered" },
  CANCELED: { label: "Đã hủy", class: "canceled" },
};

// Notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignore audio play errors (user interaction required)
    });
  } catch {
    // Ignore audio errors
  }
};

const AdminChat = () => {
  // State
  const [conversations, setConversations] = useState([]);
  // Status mapping: PENDING (chờ), IN_PROGRESS (đang xử lý), COMPLETED (hoàn thành)
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [needsAssignment, setNeedsAssignment] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Track conversations đã đọc (lưu lastMessageAt khi admin click vào)
  const [readConversations, setReadConversations] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_read_conversations");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const notificationWsRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const conversationPollRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const isInitialLoadRef = useRef(true); // Track initial load để không phát âm thanh

  const normalizeConversation = (conv) => {
    if (!conv) return null;

    // Nếu server trả về conversationId (UUID), dùng nó đè lên id (số)
    // Để thống nhất toàn bộ App dùng UUID để gọi API
    if (conv.conversationId) {
      return {
        ...conv,
        id: conv.conversationId, // Quan trọng: Gán UUID vào id
        originalId: conv.id, // Lưu lại ID số phòng khi cần (ít dùng)
      };
    }
    return conv;
  };

  // Load conversations - không dùng activeTab trong dependency để tránh stale closure
  const loadConversations = useCallback(async () => {
    try {
      // Load tất cả conversations
      const response = await getAdminConversations({});
      const allConversations = response.content || response || [];
      const normalizedConvs = allConversations.map(normalizeConversation);

      // Kiểm tra có tin nhắn mới không (so sánh với conversations hiện tại)
      setConversations((prevConvs) => {
        // Không phát âm thanh khi là lần load đầu tiên
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          return normalizedConvs;
        }

        // So sánh để phát hiện tin nhắn mới
        normalizedConvs.forEach((newConv) => {
          const oldConv = prevConvs.find((c) => c.id === newConv.id);
          const newLastTime = newConv.lastMessageAt || newConv.updatedAt;
          const oldLastTime = oldConv?.lastMessageAt || oldConv?.updatedAt;

          // Kiểm tra có tin nhắn mới từ khách hàng
          const newSenderType = (
            newConv.lastMessageSenderType ||
            newConv.lastSenderType ||
            (typeof newConv.lastMessage === "object"
              ? newConv.lastMessage?.senderType
              : null) ||
            ""
          ).toUpperCase();

          const isFromCustomer =
            newSenderType !== "ADMIN" && newSenderType !== "SYSTEM";

          // Chỉ phát âm thanh khi:
          // 1. Có oldConv (không phải conversation mới load lần đầu)
          // 2. Có tin nhắn mới hơn
          // 3. Tin nhắn từ khách hàng
          if (
            oldConv &&
            newLastTime &&
            oldLastTime &&
            new Date(newLastTime) > new Date(oldLastTime) &&
            isFromCustomer
          ) {
            // Có tin nhắn mới từ khách hàng!
            playNotificationSound();
          }
        });

        return normalizedConvs;
      });
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  // Load pending count
  const loadPendingCount = useCallback(async () => {
    try {
      const response = await getPendingCount();
      // Backend returns {pendingCount: n}
      setPendingCount(response?.pendingCount ?? 0);
    } catch (err) {
      console.error("Failed to load pending count:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadConversations(), loadPendingCount()]);
      setLoading(false);
    };
    init();
  }, [loadConversations, loadPendingCount]);

  // Reload when tab changes - không cần vì đã load all và filter bằng useMemo
  // useEffect(() => {
  //   loadConversations();
  // }, [activeTab, loadConversations]);

  // Setup admin notification - use polling instead of WebSocket for reliability
  useEffect(() => {
    // Clear any existing interval
    if (conversationPollRef.current) {
      clearInterval(conversationPollRef.current);
    }

    // Poll for pending count and new conversations every 5 seconds
    conversationPollRef.current = setInterval(() => {
      loadPendingCount();
      loadConversations();
    }, 5000);

    // Initial load
    loadPendingCount();
    loadConversations();

    // Also try WebSocket for real-time updates (optional)
    try {
      notificationWsRef.current = createAdminNotificationSocket({
        onMessage: (data) => {
          if (data.type === "NEW_CONVERSATION") {
            playNotificationSound();
            loadPendingCount();
            loadConversations();
          } else if (data.type === "CONVERSATION_UPDATED") {
            loadConversations();
          } else if (data.type === "NEW_MESSAGE") {
            // Có tin nhắn mới - reload conversations để cập nhật lastMessage
            loadConversations();
          }
        },
        onError: () => {
          // WebSocket failed, polling will handle updates
          console.log(
            "Admin notification WebSocket not available, using polling"
          );
        },
      });
    } catch (err) {
      // WebSocket not available, polling will handle updates
      console.log("Admin notification WebSocket not available, using polling");
    }

    return () => {
      if (conversationPollRef.current) {
        clearInterval(conversationPollRef.current);
        conversationPollRef.current = null;
      }
      notificationWsRef.current?.close();
    };
  }, [loadConversations, loadPendingCount]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([]);
      setCustomerOrders([]);
      return;
    }

    const loadData = async () => {
      setLoadingMessages(true);
      try {
        // Load messages - this is the main data
        console.log(
          "Loading messages for conversation:",
          selectedConversation.id
        );
        const messagesResponse = await getMessages(selectedConversation.id);
        const msgs = Array.isArray(messagesResponse)
          ? messagesResponse
          : messagesResponse.content || messagesResponse || [];
        console.log("Parsed messages:", msgs);
        setMessages(msgs);

        if (msgs.length > 0) {
          lastMessageIdRef.current = msgs[msgs.length - 1].id;
        }

        // Load customer orders - optional, don't fail if this errors
        try {
          const ordersResponse = await getCustomerOrders(
            selectedConversation.id
          );
          setCustomerOrders(
            Array.isArray(ordersResponse)
              ? ordersResponse
              : ordersResponse.content || []
          );
        } catch {
          // Orders failed to load, that's okay
          setCustomerOrders([]);
        }

        // Check if needs assignment
        const isAssigned =
          selectedConversation.assignedTo ||
          selectedConversation.assignedAdminId ||
          selectedConversation.status === "IN_PROGRESS";
        const needsAssign =
          !isAssigned && selectedConversation.status === "PENDING";
        console.log("Assignment check:", {
          status: selectedConversation.status,
          assignedTo: selectedConversation.assignedTo,
          assignedAdminId: selectedConversation.assignedAdminId,
          isAssigned,
          needsAssign,
        });
        setNeedsAssignment(needsAssign);
      } catch (err) {
        console.error("Failed to load messages:", err);
        // Don't clear messages on error - keep existing data
      } finally {
        setLoadingMessages(false);
      }
    };

    loadData();
  }, [
    selectedConversation?.id,
    selectedConversation?.status,
    selectedConversation?.assignedTo,
  ]);

  // Polling fallback - uses getMessages endpoint (defined before useEffect that uses it)
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current || !selectedConversation?.id) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        // Use standard getMessages endpoint
        const response = await getMessages(selectedConversation.id);
        const allMessages = Array.isArray(response) ? response : [];

        if (allMessages.length > 0) {
          setMessages((prev) => {
            // Check if there are new messages by comparing lengths and last message id
            const lastNewId = allMessages[allMessages.length - 1]?.id;
            const lastPrevId = prev[prev.length - 1]?.id;

            // If different number of messages or different last message, update all
            if (
              allMessages.length !== prev.length ||
              lastNewId !== lastPrevId
            ) {
              lastMessageIdRef.current = lastNewId;
              return allMessages;
            }
            return prev;
          });
        }
      } catch (err) {
        // Log but don't crash
        console.log("Polling error:", err.message);
      }
    }, 3000);
  }, [selectedConversation?.id]);

  // Connect to conversation WebSocket (optional) with polling fallback
  useEffect(() => {
    if (!selectedConversation?.id || needsAssignment) return;

    // Always start polling for reliability
    startPolling();

    // Also try WebSocket for real-time updates (optional)
    try {
      wsRef.current = createChatWebSocket(selectedConversation.id, {
        onMessage: (data) => {
          if (data.type === "NEW_MESSAGE") {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              lastMessageIdRef.current = data.message.id;
              return [...prev, data.message];
            });
          } else if (data.type === "CONVERSATION_CLOSED") {
            setSelectedConversation((prev) =>
              prev ? { ...prev, status: "COMPLETED" } : null
            );
            loadConversations();
          }
        },
        onOpen: () => {
          // WebSocket connected, can reduce polling frequency
          console.log("Chat WebSocket connected");
        },
        onError: () => {
          // WebSocket failed, polling will handle updates
          console.log("Chat WebSocket not available, using polling");
        },
      });
    } catch {
      // WebSocket not available, polling is already running
      console.log("Chat WebSocket not available, using polling");
    }

    return () => {
      wsRef.current?.close();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [
    selectedConversation?.id,
    needsAssignment,
    activeTab,
    loadConversations,
    startPolling,
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Delay nhỏ để đảm bảo DOM đã render xong
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // Cập nhật readTime khi đang xem conversation và có tin nhắn mới
  // Điều này đảm bảo conversation đang xem không hiển thị unread
  useEffect(() => {
    if (selectedConversation?.id && messages.length > 0) {
      const now = new Date().toISOString();
      setReadConversations((prev) => {
        // Chỉ cập nhật nếu chưa có hoặc có tin nhắn mới
        const currentReadTime = prev[selectedConversation.id];
        if (!currentReadTime || new Date(now) > new Date(currentReadTime)) {
          const updated = {
            ...prev,
            [selectedConversation.id]: now,
          };
          try {
            localStorage.setItem(
              "admin_read_conversations",
              JSON.stringify(updated)
            );
          } catch {
            // Ignore storage errors
          }
          return updated;
        }
        return prev;
      });
    }
  }, [selectedConversation?.id, messages.length]);

  // Scroll to bottom when conversation is selected
  useEffect(() => {
    if (selectedConversation && !loadingMessages && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
  }, [selectedConversation?.id, loadingMessages]);

  // Focus input after assignment
  useEffect(() => {
    if (!needsAssignment && selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [needsAssignment, selectedConversation]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedConversation(null);
  };

  // Handle conversation select
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);

    // Mark conversation as read - lưu thời điểm hiện tại
    // Điều này đảm bảo mọi tin nhắn đến sau thời điểm này sẽ được đánh dấu unread
    const now = new Date().toISOString();
    setReadConversations((prev) => {
      const updated = {
        ...prev,
        [conv.id]: now,
      };
      // Lưu vào localStorage
      try {
        localStorage.setItem(
          "admin_read_conversations",
          JSON.stringify(updated)
        );
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  // Handle assign conversation
  const handleAssign = async () => {
    if (!selectedConversation?.id || assigning) return;

    setAssigning(true);
    try {
      await assignConversation(selectedConversation.id);
      setNeedsAssignment(false);

      // Cập nhật status của selectedConversation
      setSelectedConversation((prev) =>
        prev ? { ...prev, status: "IN_PROGRESS" } : null
      );

      // Chuyển sang tab "Đang xử lý" để tiếp tục chat
      setActiveTab("IN_PROGRESS");

      // Load lại conversations và pending count
      loadConversations();
      loadPendingCount();
    } catch (err) {
      console.error("Failed to assign conversation:", err);
      alert("Không thể nhận hội thoại. Vui lòng thử lại.");
    } finally {
      setAssigning(false);
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || !selectedConversation?.id || sending) return;

    setSending(true);
    const content = inputValue.trim();
    setInputValue("");

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content,
      senderType: "ADMIN",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await adminSendMessage(selectedConversation.id, content);
      // Replace optimistic message with real one
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempId);
        // Check if real message already exists
        if (response?.id && filtered.some((m) => m.id === response.id)) {
          return filtered;
        }
        return [...filtered, response];
      });
      if (response?.id) {
        lastMessageIdRef.current = response.id;
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputValue(content); // Restore input
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle finish conversation
  const handleFinish = async () => {
    if (!selectedConversation?.id) return;

    if (!window.confirm("Bạn có chắc muốn kết thúc hội thoại này?")) return;

    try {
      await finishConversation(selectedConversation.id);
      setSelectedConversation(null);
      loadConversations();
    } catch (err) {
      console.error("Failed to finish conversation:", err);
      alert("Không thể kết thúc hội thoại. Vui lòng thử lại.");
    }
  };

  // Get customer display name
  const getCustomerName = (conv) => {
    // Ưu tiên tên từ customer object (người dùng đã đăng nhập)
    if (conv.customer?.name) return conv.customer.name;
    // Tên từ field userName (từ API response)
    if (conv.userName) return conv.userName;
    // Tên từ user object
    if (conv.user?.name) return conv.user.name;
    // Tên khách vãng lai
    if (conv.guestName) return conv.guestName;
    // Fallback: email hoặc phone
    if (conv.customer?.email) return conv.customer.email;
    if (conv.userEmail) return conv.userEmail;
    if (conv.guestPhone) return conv.guestPhone;
    if (conv.guestEmail) return conv.guestEmail;
    return "Khách";
  };

  // Filtered conversations based on active tab
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => c.status === activeTab);
  }, [conversations, activeTab]);

  // Render conversation list item
  const renderConversationItem = (conv) => {
    const isActive = selectedConversation?.id === conv.id;
    const isGuest = !conv.customer;
    const customerName = getCustomerName(conv);

    // lastMessage có thể là string hoặc object tùy API
    const lastMessageContent =
      typeof conv.lastMessage === "string"
        ? conv.lastMessage
        : conv.lastMessage?.content;

    // Kiểm tra senderType từ lastMessage object hoặc từ field riêng
    const lastSenderType = (
      conv.lastMessageSenderType ||
      conv.lastSenderType ||
      (typeof conv.lastMessage === "object"
        ? conv.lastMessage?.senderType
        : null) ||
      ""
    ).toUpperCase();

    // Thời gian tin nhắn cuối
    const lastMessageTime = conv.lastMessageAt || conv.updatedAt;
    // Thời gian đã đọc (từ localStorage)
    const readTime = readConversations[conv.id];

    // Check if has unread message:
    // 1. Conversation không đang được chọn
    // 2. VÀ một trong các điều kiện sau:
    //    - Có unreadCount > 0 từ backend
    //    - Có hasUnread flag từ backend
    //    - Có tin nhắn mới hơn thời điểm đã đọc
    //    - Chưa từng đọc VÀ lastSender không phải ADMIN
    const hasNewMessageSinceRead =
      lastMessageTime &&
      (!readTime || new Date(lastMessageTime) > new Date(readTime));

    const hasUnread =
      !isActive &&
      (conv.unreadCount > 0 ||
        conv.hasUnread === true ||
        conv.unreadByAdmin === true ||
        (hasNewMessageSinceRead &&
          lastSenderType !== "ADMIN" &&
          lastSenderType !== "SYSTEM"));

    return (
      <div
        key={conv.id}
        className={`admin-chat__item ${
          isActive ? "admin-chat__item--active" : ""
        } ${hasUnread ? "admin-chat__item--unread" : ""}`}
        onClick={() => handleSelectConversation(conv)}
      >
        <div
          className={`admin-chat__item-avatar ${
            isGuest ? "admin-chat__item-avatar--guest" : ""
          }`}
        >
          {getInitials(customerName)}
          {hasUnread && <span className="admin-chat__unread-dot" />}
        </div>
        <div className="admin-chat__item-content">
          <div className="admin-chat__item-header">
            <span className="admin-chat__item-name">{customerName}</span>
            <span className="admin-chat__item-time">
              {formatTime(conv.updatedAt || conv.createdAt)}
            </span>
          </div>
          {lastMessageContent && (
            <div
              className={`admin-chat__item-preview ${
                hasUnread ? "admin-chat__item-preview--unread" : ""
              }`}
            >
              {lastMessageContent}
            </div>
          )}
          <div className="admin-chat__item-meta">
            {isGuest ? (
              <span className="admin-chat__item-badge admin-chat__item-badge--guest">
                Khách vãng lai
              </span>
            ) : (
              <span className="admin-chat__item-badge admin-chat__item-badge--member">
                Thành viên
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render messages
  const renderMessages = () => {
    if (loadingMessages) {
      return (
        <div className="admin-chat__loading">
          <div className="admin-chat__loading-spinner" />
          <p>Đang tải tin nhắn...</p>
        </div>
      );
    }

    return (
      <div className="admin-chat__messages">
        {messages.map((message, index) => {
          const senderType = (message.senderType || "").toUpperCase();
          const isAdmin = senderType === "ADMIN";
          const isCustomer =
            senderType === "CUSTOMER" ||
            senderType === "GUEST" ||
            senderType === "USER";
          const isSystem = senderType === "SYSTEM";

          // If senderType is not recognized, try to determine from other fields
          const finalIsCustomer =
            isCustomer ||
            (!isAdmin &&
              !isSystem &&
              message.senderId !== selectedConversation?.assignedAdminId);

          // Tên hiển thị rõ ràng hơn
          const customerName =
            selectedConversation?.customer?.name ||
            selectedConversation?.guestName ||
            selectedConversation?.userName ||
            "Khách hàng";
          const senderLabel = finalIsCustomer ? "Khách hàng" : "Tư vấn viên";

          return (
            <div
              key={message.id}
              className={`admin-chat__message ${
                isSystem
                  ? "admin-chat__message--system"
                  : finalIsCustomer
                  ? "admin-chat__message--customer"
                  : "admin-chat__message--admin"
              }`}
            >
              {!isSystem && (
                <div className="admin-chat__message-sender">
                  <span className="admin-chat__message-role">
                    {senderLabel}
                  </span>
                  {finalIsCustomer && (
                    <span className="admin-chat__message-name">
                      {" "}
                      - {customerName}
                    </span>
                  )}
                </div>
              )}
              <div className="admin-chat__message-content">
                {message.content}
              </div>
              {!isSystem && (
                <div className="admin-chat__message-time">
                  {formatMessageTime(message.createdAt)}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  // Render customer info panel
  const renderInfoPanel = () => {
    if (!selectedConversation) return null;

    const customerName = getCustomerName(selectedConversation);
    const isGuest = !selectedConversation.customer;

    return (
      <div className="admin-chat__info-panel">
        <div className="admin-chat__info-section">
          <h5>Thông tin khách hàng</h5>
          <div className="admin-chat__customer-detail">
            <span className="admin-chat__customer-detail-label">Tên:</span>
            <span className="admin-chat__customer-detail-value">
              {customerName}
            </span>
          </div>
          {selectedConversation.customer?.email && (
            <div className="admin-chat__customer-detail">
              <span className="admin-chat__customer-detail-label">Email:</span>
              <span className="admin-chat__customer-detail-value">
                {selectedConversation.customer.email}
              </span>
            </div>
          )}
          {selectedConversation.customer?.phone && (
            <div className="admin-chat__customer-detail">
              <span className="admin-chat__customer-detail-label">SĐT:</span>
              <span className="admin-chat__customer-detail-value">
                {selectedConversation.customer.phone}
              </span>
            </div>
          )}
          {isGuest && selectedConversation.guestPhone && (
            <div className="admin-chat__customer-detail">
              <span className="admin-chat__customer-detail-label">SĐT:</span>
              <span className="admin-chat__customer-detail-value">
                {selectedConversation.guestPhone}
              </span>
            </div>
          )}
          {isGuest && selectedConversation.guestEmail && (
            <div className="admin-chat__customer-detail">
              <span className="admin-chat__customer-detail-label">Email:</span>
              <span className="admin-chat__customer-detail-value">
                {selectedConversation.guestEmail}
              </span>
            </div>
          )}
          <div className="admin-chat__customer-detail">
            <span className="admin-chat__customer-detail-label">Loại:</span>
            <span className="admin-chat__customer-detail-value">
              {isGuest ? "Khách vãng lai" : "Thành viên"}
            </span>
          </div>
        </div>

        <div className="admin-chat__info-section">
          <h5>Lịch sử đơn hàng</h5>
          {customerOrders.length === 0 ? (
            <p style={{ color: "#999", fontSize: "13px" }}>
              {isGuest ? "Không có (khách vãng lai)" : "Chưa có đơn hàng"}
            </p>
          ) : (
            <div className="admin-chat__order-list">
              {customerOrders.slice(0, 5).map((order) => {
                const statusInfo = ORDER_STATUS_MAP[order.status] || {
                  label: order.status,
                  class: "pending",
                };
                return (
                  <div key={order.id} className="admin-chat__order-item">
                    <div className="admin-chat__order-header">
                      <span className="admin-chat__order-id">#{order.id}</span>
                      <span
                        className={`admin-chat__order-status admin-chat__order-status--${statusInfo.class}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="admin-chat__order-info">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="admin-chat__order-total">
                        {" • "}
                        {formatCurrency(order.totalAmount || order.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-chat">
        <div className="admin-chat__loading" style={{ width: "100%" }}>
          <div className="admin-chat__loading-spinner" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat">
      {/* Sidebar - Conversation List */}
      <div className="admin-chat__sidebar">
        <div className="admin-chat__tabs">
          <button
            className={`admin-chat__tab ${
              activeTab === "PENDING" ? "admin-chat__tab--active" : ""
            }`}
            onClick={() => handleTabChange("PENDING")}
          >
            Chờ xử lý
            {pendingCount > 0 && (
              <span className="admin-chat__tab-badge">{pendingCount}</span>
            )}
          </button>
          <button
            className={`admin-chat__tab ${
              activeTab === "IN_PROGRESS" ? "admin-chat__tab--active" : ""
            }`}
            onClick={() => handleTabChange("IN_PROGRESS")}
          >
            Đang xử lý
          </button>
          <button
            className={`admin-chat__tab ${
              activeTab === "COMPLETED" ? "admin-chat__tab--active" : ""
            }`}
            onClick={() => handleTabChange("COMPLETED")}
          >
            Lịch sử
          </button>
        </div>

        <div className="admin-chat__list">
          {filteredConversations.length === 0 ? (
            <div className="admin-chat__empty">
              <div className="admin-chat__empty-icon">💬</div>
              <p>Không có hội thoại nào</p>
            </div>
          ) : (
            filteredConversations.map(renderConversationItem)
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="admin-chat__main">
        {!selectedConversation ? (
          <div className="admin-chat__no-selection">
            <ChatIcon />
            <p>Chọn một hội thoại để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="admin-chat__header">
              <div className="admin-chat__header-info">
                <div className="admin-chat__header-avatar">
                  {getInitials(getCustomerName(selectedConversation))}
                </div>
                <div className="admin-chat__header-details">
                  <h4>{getCustomerName(selectedConversation)}</h4>
                  <p>
                    {selectedConversation.status === "PENDING"
                      ? "Chờ xử lý"
                      : selectedConversation.status === "IN_PROGRESS"
                      ? "Đang hỗ trợ"
                      : "Đã kết thúc"}
                  </p>
                </div>
              </div>
              <div className="admin-chat__header-actions">
                {selectedConversation.status === "IN_PROGRESS" && (
                  <button
                    className="admin-chat__action-btn admin-chat__action-btn--finish"
                    onClick={handleFinish}
                  >
                    ✓ Hoàn thành
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {needsAssignment && (
                <div className="admin-chat__assign-overlay">
                  <h3>Nhận hỗ trợ khách hàng này?</h3>
                  <p>
                    Khi bạn nhận hội thoại, bạn sẽ là người duy nhất hỗ trợ
                    khách hàng này.
                  </p>
                  <button
                    className="admin-chat__action-btn admin-chat__action-btn--primary"
                    onClick={handleAssign}
                    disabled={assigning}
                  >
                    {assigning ? "Đang xử lý..." : "Nhận hội thoại"}
                  </button>
                </div>
              )}
              {renderMessages()}
            </div>

            {/* Input */}
            {selectedConversation.status !== "COMPLETED" &&
              !needsAssignment && (
                <div className="admin-chat__input-area">
                  <textarea
                    ref={inputRef}
                    className="admin-chat__input"
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    disabled={sending}
                  />
                  <button
                    className="admin-chat__send-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sending}
                    title="Gửi tin nhắn"
                  >
                    <SendIcon />
                  </button>
                </div>
              )}
          </>
        )}
      </div>

      {/* Customer Info Panel */}
      {renderInfoPanel()}
    </div>
  );
};

export default AdminChat;
