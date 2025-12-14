import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import "./FloatingChat.css";
// Icons
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// Consultant/Headset Icon
const ConsultantIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
    className={className}
  >
    <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9zM7 14v4H6c-.55 0-1-.45-1-1v-3h2zm12 3c0 .55-.45 1-1 1h-1v-4h2v3z" />
  </svg>
);

// Format time helper
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Guest Form Component
const GuestForm = ({ onSubmit, loading }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState("phone"); // phone or email

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contact.trim()) return;

    const guestData = {
      name: name.trim() || "Khách",
      [contactType === "phone" ? "phone" : "email"]: contact.trim(),
    };
    onSubmit(guestData);
  };

  const isValidContact = () => {
    if (contactType === "phone") {
      return /^[0-9]{10,11}$/.test(contact.replace(/\s/g, ""));
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  };

  return (
    <form className="chat-guest-form" onSubmit={handleSubmit}>
      <h3 className="chat-guest-form__title">Xin chào! 👋</h3>
      <p className="chat-guest-form__subtitle">
        Vui lòng để lại thông tin để chúng tôi có thể hỗ trợ bạn tốt hơn
      </p>

      <div className="chat-guest-form__field">
        <label className="chat-guest-form__label">
          Tên của bạn (không bắt buộc)
        </label>
        <input
          type="text"
          className="chat-guest-form__input"
          placeholder="Nhập tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="chat-guest-form__field">
        <label className="chat-guest-form__label">
          {contactType === "phone" ? "Số điện thoại" : "Email"} *
        </label>
        <input
          type={contactType === "phone" ? "tel" : "email"}
          className="chat-guest-form__input"
          placeholder={
            contactType === "phone"
              ? "Nhập số điện thoại"
              : "Nhập địa chỉ email"
          }
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "#e53935",
            fontSize: "12px",
            padding: "4px 0",
            cursor: "pointer",
          }}
          onClick={() => {
            setContactType(contactType === "phone" ? "email" : "phone");
            setContact("");
          }}
        >
          Sử dụng {contactType === "phone" ? "email" : "số điện thoại"} thay thế
        </button>
      </div>

      <div className="chat-guest-form__actions">
        <button
          type="submit"
          className="chat-guest-form__submit"
          disabled={loading || !isValidContact()}
        >
          {loading ? "Đang kết nối..." : "Bắt đầu trò chuyện"}
        </button>

        <p className="chat-guest-form__login-link">
          Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
        </p>
      </div>
    </form>
  );
};

// Chat Messages Component
const ChatMessages = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="chat-window__loading">
        <div className="chat-window__loading-spinner" />
        <p>Đang tải tin nhắn...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="chat-window__empty">
        <div className="chat-window__empty-icon">
          <ConsultantIcon className="chat-window__empty-svg" />
        </div>
        <p className="chat-window__empty-text">
          Chào bạn! Bạn cần hỗ trợ gì?
          <br />
          Hãy gửi tin nhắn cho chúng tôi.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-window__messages">
      {messages.map((message) => {
        const senderType = (message.senderType || "").toUpperCase();
        const isAdmin = senderType === "ADMIN";
        const isCustomer =
          senderType === "CUSTOMER" ||
          senderType === "GUEST" ||
          senderType === "USER";
        const isSystem = senderType === "SYSTEM";

        // Nếu không xác định được, dựa vào logic: nếu không phải admin/system thì là customer
        const finalIsCustomer = isCustomer || (!isAdmin && !isSystem);
        const senderName = finalIsCustomer ? "Bạn" : "Tư vấn viên";

        return (
          <div
            key={message.id}
            className={`chat-message ${
              isSystem
                ? "chat-message--system"
                : finalIsCustomer
                ? "chat-message--customer"
                : "chat-message--admin"
            }`}
          >
            {!isSystem && (
              <div className="chat-message__sender">{senderName}</div>
            )}
            <div className="chat-message__content">{message.content}</div>
            {!isSystem && (
              <div className="chat-message__time">
                {formatTime(message.createdAt)}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Main Floating Chat Component
const FloatingChat = () => {
  const { isAuthenticated } = useAuth();
  const {
    isOpen,
    conversation,
    messages,
    loading,
    sending,
    error,
    unreadCount,
    connectionStatus,
    openChat,
    closeChat,
    startNewConversation,
    send,
    setError,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && conversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, conversation]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || sending) return;

    try {
      await send(inputValue);
      setInputValue("");
    } catch {
      // Error is handled in context
    }
  }, [inputValue, sending, send]);

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle guest form submit
  const handleGuestSubmit = async (guestData) => {
    try {
      await startNewConversation(guestData);
    } catch {
      // Error is handled in context
    }
  };

  // Start conversation for logged-in user
  const handleStartChat = async () => {
    try {
      await startNewConversation();
    } catch {
      // Error is handled in context
    }
  };

  // Render chat window content
  const renderContent = () => {
    // Not logged in and no conversation - show guest form
    if (!isAuthenticated && !conversation) {
      return <GuestForm onSubmit={handleGuestSubmit} loading={loading} />;
    }

    // Logged in but no conversation - show start button
    if (isAuthenticated && !conversation) {
      return (
        <div className="chat-window__empty">
          <div className="chat-window__empty-icon">
            <ConsultantIcon className="chat-window__empty-svg" />
          </div>
          <p className="chat-window__empty-text">
            Chào bạn! Bạn cần hỗ trợ gì?
          </p>
          <button
            className="chat-guest-form__submit"
            style={{ marginTop: "16px", padding: "10px 24px" }}
            onClick={handleStartChat}
            disabled={loading}
          >
            {loading ? "Đang kết nối..." : "Bắt đầu trò chuyện"}
          </button>
        </div>
      );
    }

    // Check if conversation is completed
    const isCompleted =
      conversation?.status === "COMPLETED" || conversation?.status === "CLOSED";

    // Has conversation - show messages
    return (
      <>
        <ChatMessages
          messages={messages}
          loading={loading && messages.length === 0}
        />

        {/* Thông báo khi cuộc trò chuyện đã hoàn thành */}
        {isCompleted && (
          <div className="chat-window__completed-notice">
            <span>✅ Cuộc trò chuyện đã kết thúc.</span>
            <span className="chat-window__completed-hint">
              Gửi tin nhắn để mở lại cuộc hội thoại.
            </span>
          </div>
        )}

        <div className="chat-window__input-area">
          <textarea
            ref={inputRef}
            className="chat-window__input"
            placeholder={
              isCompleted
                ? "Nhập tin nhắn để mở lại hội thoại..."
                : "Nhập tin nhắn..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={sending}
          />
          <button
            className="chat-window__send"
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            title="Gửi tin nhắn"
          >
            <SendIcon />
          </button>
        </div>
      </>
    );
  };

  // Only render the chat window (button is now in FloatingButtons)
  if (!isOpen) return null;

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window__header">
        <div className="chat-window__header-info">
          <div className="chat-window__avatar">
            <ConsultantIcon />
          </div>
          <div>
            <h4 className="chat-window__title">Tư vấn trực tuyến</h4>
            <div className="chat-window__status">
              <span
                className={`chat-window__status-dot ${
                  connectionStatus !== "connected"
                    ? "chat-window__status-dot--offline"
                    : ""
                }`}
              />
              {connectionStatus === "connected"
                ? "Đang kết nối"
                : connectionStatus === "connecting"
                ? "Đang kết nối..."
                : "Chế độ offline"}
            </div>
          </div>
        </div>
        <button className="chat-window__close" onClick={closeChat} title="Đóng">
          <CloseIcon />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="chat-window__error">
          <span>⚠️ {error}</span>
          <button
            className="chat-window__error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default FloatingChat;
