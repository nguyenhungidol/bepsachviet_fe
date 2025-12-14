import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import {
  startConversation,
  getMyConversation,
  sendMessage,
  getMessages,
  closeConversation,
  reopenConversation,
  createChatWebSocket,
  getGuestConversation,
  saveGuestConversation,
  clearGuestConversation,
} from "../services/chatService";

const ChatContext = createContext(null);

// Auto-response message when customer sends first message
const AUTO_RESPONSE = {
  id: "auto-response",
  content:
    "Cảm ơn bạn đã liên hệ! Nhân viên của chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
  senderType: "SYSTEM",
  createdAt: new Date().toISOString(),
  isAutoResponse: true,
};

// [FIX] Hàm chuẩn hóa dữ liệu: Luôn dùng UUID làm ID chính
const normalizeConversation = (conv) => {
  if (!conv) return null;
  // Nếu có conversationId (từ Server về), hãy dùng nó đè lên id
  // Để thống nhất toàn bộ App dùng UUID
  if (conv.conversationId) {
    return {
      ...conv,
      id: conv.conversationId, // Quan trọng: ID bây giờ là UUID
      originalId: conv.id, // Lưu lại ID số phòng khi cần (ít dùng)
    };
  }
  return conv;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Chat state
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [showAutoResponse, setShowAutoResponse] = useState(false);

  // Guest mode state
  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);

  // WebSocket ref
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  // Load existing conversation on mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        if (isAuthenticated) {
          // Logged-in user: fetch their conversation
          const conv = await getMyConversation();
          if (conv) {
            // [FIX] Load conversation kể cả khi COMPLETED để cho phép reopen
            setConversation(normalizeConversation(conv));
          }
        } else {
          // Guest: check localStorage first
          const guestData = getGuestConversation();
          if (guestData && guestData.guestInfo) {
            // Try to fetch guest conversation from server
            try {
              const conv = await getMyConversation({
                guestEmail: guestData.guestInfo.email,
                guestPhone: guestData.guestInfo.phone,
              });
              if (conv) {
                // [FIX] Load conversation kể cả khi COMPLETED
                setConversation(normalizeConversation(conv));
                setGuestInfo(guestData.guestInfo);
                setIsGuest(true);
              }
            } catch {
              // Guest conversation not found on server, use local data
              // Logic cũ của bạn ở đây OK vì guestData.conversationId đã là UUID
              setConversation({ id: guestData.conversationId });
              setGuestInfo(guestData.guestInfo);
              setIsGuest(true);
            }
          }
        }
      } catch (err) {
        console.log("No existing conversation found");
      }
    };

    loadConversation();
  }, [isAuthenticated]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation?.id) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        // [FIXED AUTOMATICALLY] conversation.id giờ đã là UUID nhờ hàm normalize
        const response = await getMessages(conversation.id);
        const msgs = Array.isArray(response)
          ? response
          : response.content || [];
        setMessages(msgs);

        if (msgs.length > 0) {
          lastMessageIdRef.current = msgs[msgs.length - 1].id;
        }

        const hasAdminReply = msgs.some((m) => m.senderType === "ADMIN");
        const hasCustomerMessage = msgs.some(
          (m) => m.senderType === "CUSTOMER" || m.senderType === "GUEST"
        );
        setShowAutoResponse(hasCustomerMessage && !hasAdminReply);
      } catch (err) {
        // Nếu lỗi 403/404 nghĩa là ID sai hoặc hết hạn -> Xóa cache tự động
        if (err.status === 404 || err.status === 403) {
          console.log("Conversation invalid, clearing session...");
          clearGuestConversation();
          // Optional: setConversation(null);
        }
        console.error("Failed to load messages:", err);
        // Không set error UI để tránh làm phiền người dùng nếu chỉ là lỗi polling
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation?.id]);

  // Connect WebSocket when conversation is active
  useEffect(() => {
    if (!conversation?.id || !isOpen) {
      return;
    }

    setConnectionStatus("connecting");

    try {
      // [FIXED AUTOMATICALLY] conversation.id là UUID
      wsRef.current = createChatWebSocket(conversation.id, {
        onOpen: () => {
          setConnectionStatus("connected");
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        },
        onMessage: (data) => {
          if (data.type === "NEW_MESSAGE") {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) {
                return prev;
              }
              lastMessageIdRef.current = data.message.id;

              if (data.message.senderType === "ADMIN") {
                setShowAutoResponse(false);
              }

              return [...prev, data.message];
            });

            if (!isOpen) {
              setUnreadCount((prev) => prev + 1);
            }
          } else if (data.type === "CONVERSATION_CLOSED") {
            setConversation((prev) =>
              prev ? { ...prev, status: "CLOSED" } : null
            );
          }
        },
        onClose: () => {
          setConnectionStatus("disconnected");
          startPolling();
        },
        onError: () => {
          setConnectionStatus("disconnected");
          startPolling();
        },
      });
    } catch (err) {
      console.error(
        "WebSocket connection failed, falling back to polling:",
        err
      );
      setConnectionStatus("disconnected");
      startPolling();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [conversation?.id, isOpen]);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current || !conversation?.id) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await getMessages(conversation.id);
        const allMessages = Array.isArray(response)
          ? response
          : response.content || [];

        if (allMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNew = allMessages.filter((m) => !existingIds.has(m.id));

            if (uniqueNew.length > 0) {
              lastMessageIdRef.current = allMessages[allMessages.length - 1].id;

              if (uniqueNew.some((m) => m.senderType === "ADMIN")) {
                setShowAutoResponse(false);
              }

              if (!isOpen) {
                setUnreadCount((count) => count + uniqueNew.length);
              }

              return [...prev, ...uniqueNew];
            }
            return prev;
          });
        }
      } catch (err) {
        if (err.status !== 403) {
          console.error("Polling failed:", err);
        }
      }
    }, 5000);
  }, [conversation?.id, isOpen]);

  // Open chat
  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  // Close chat UI
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Start new conversation
  const startNewConversation = useCallback(async (guestData = null) => {
    setLoading(true);
    setError(null);

    try {
      const data = guestData
        ? {
            guestName: guestData.name,
            guestEmail: guestData.email,
            guestPhone: guestData.phone,
          }
        : {};

      const rawConv = await startConversation(data);
      // [FIX] Chuẩn hóa ngay lập tức
      const conv = normalizeConversation(rawConv);

      setConversation(conv);

      if (guestData) {
        setIsGuest(true);
        setGuestInfo(guestData);
        // [FIX] Lưu ID UUID vào localStorage (conv.id giờ đã là UUID)
        saveGuestConversation(conv.id, guestData);
      }

      return conv;
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const send = useCallback(
    async (content) => {
      if (!conversation?.id || !content.trim()) return;

      setSending(true);
      setError(null);

      try {
        // Nếu cuộc trò chuyện đã COMPLETED, mở lại trước khi gửi tin nhắn
        if (
          conversation.status === "COMPLETED" ||
          conversation.status === "CLOSED"
        ) {
          try {
            const reopenedConv = await reopenConversation(conversation.id);
            if (reopenedConv) {
              setConversation((prev) => ({
                ...prev,
                status: reopenedConv.status || "PENDING",
              }));
            }
          } catch (reopenErr) {
            console.log(
              "Failed to reopen conversation, trying to send anyway:",
              reopenErr
            );
            // Tiếp tục gửi tin nhắn - backend có thể tự xử lý việc reopen
          }
        }

        const message = await sendMessage(conversation.id, content.trim());

        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        lastMessageIdRef.current = message.id;

        const hasAdminReply = messages.some((m) => m.senderType === "ADMIN");
        if (!hasAdminReply) {
          setShowAutoResponse(true);
        }

        // Cập nhật status sau khi gửi thành công (nếu backend đã reopen)
        if (
          conversation.status === "COMPLETED" ||
          conversation.status === "CLOSED"
        ) {
          setConversation((prev) => ({
            ...prev,
            status: "PENDING",
          }));
        }

        return message;
      } catch (err) {
        console.error("Failed to send message:", err);
        setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
        throw err;
      } finally {
        setSending(false);
      }
    },
    [conversation?.id, conversation?.status, messages]
  );

  // End conversation
  const endConversation = useCallback(async () => {
    if (!conversation?.id) return;

    try {
      await closeConversation(conversation.id);
      setConversation(null);
      setMessages([]);
      setShowAutoResponse(false);

      if (isGuest) {
        clearGuestConversation();
        setIsGuest(false);
        setGuestInfo(null);
      }
    } catch (err) {
      console.error("Failed to close conversation:", err);
      throw err;
    }
  }, [conversation?.id, isGuest]);

  // Get display messages
  const displayMessages = useMemo(() => {
    if (!showAutoResponse) return messages;

    const lastCustomerIndex = [...messages]
      .reverse()
      .findIndex(
        (m) => m.senderType === "CUSTOMER" || m.senderType === "GUEST"
      );

    if (lastCustomerIndex === -1) return messages;

    const insertIndex = messages.length - lastCustomerIndex;
    return [
      ...messages.slice(0, insertIndex),
      { ...AUTO_RESPONSE, createdAt: new Date().toISOString() },
      ...messages.slice(insertIndex),
    ];
  }, [messages, showAutoResponse]);

  const value = useMemo(
    () => ({
      isOpen,
      conversation,
      messages: displayMessages,
      rawMessages: messages,
      loading,
      sending,
      error,
      unreadCount,
      connectionStatus,
      isGuest,
      guestInfo,
      openChat,
      closeChat,
      startNewConversation,
      send,
      endConversation,
      setError,
    }),
    [
      isOpen,
      conversation,
      displayMessages,
      messages,
      loading,
      sending,
      error,
      unreadCount,
      connectionStatus,
      isGuest,
      guestInfo,
      openChat,
      closeChat,
      startNewConversation,
      send,
      endConversation,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
