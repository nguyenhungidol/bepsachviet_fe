import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminConversations } from "../../services/chatService";
import "./NotificationDropdown.css";

// Format time helper - hiển thị đầy đủ ngày tháng năm
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `Hôm nay, ${time}`;
  if (diffDays === 1) return `Hôm qua, ${time}`;
  if (diffDays < 7) return `${diffDays} ngày trước, ${time}`;

  return (
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + `, ${time}`
  );
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Get customer name helper
const getCustomerName = (conv) => {
  if (conv.customer?.name) return conv.customer.name;
  if (conv.userName) return conv.userName;
  if (conv.user?.name) return conv.user.name;
  if (conv.guestName) return conv.guestName;
  if (conv.customer?.email) return conv.customer.email.split("@")[0];
  if (conv.userEmail) return conv.userEmail.split("@")[0];
  if (conv.guestPhone) return `Khách ${conv.guestPhone}`;
  if (conv.guestEmail) return conv.guestEmail.split("@")[0];
  return "Khách";
};

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load recent conversations with new messages
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await getAdminConversations({ size: 10 });
        const conversations = response?.content || [];

        // Filter and sort - ưu tiên PENDING và tin nhắn từ khách hàng
        const sorted = [...conversations].sort((a, b) => {
          // Ưu tiên PENDING
          if (a.status === "PENDING" && b.status !== "PENDING") return -1;
          if (b.status === "PENDING" && a.status !== "PENDING") return 1;
          // Sau đó sắp xếp theo thời gian
          const timeA = new Date(a.lastMessageAt || a.updatedAt || 0);
          const timeB = new Date(b.lastMessageAt || b.updatedAt || 0);
          return timeB - timeA;
        });

        setNotifications(sorted.slice(0, 8));
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Handle notification click
  const handleNotificationClick = (conv) => {
    onClose?.();
    navigate(`/admin/chat?id=${conv.conversationId || conv.id}`);
  };

  // Handle view all click
  const handleViewAll = () => {
    onClose?.();
    navigate("/admin/chat");
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown__header">
        <h4>Thông báo tin nhắn</h4>
        <span className="notification-dropdown__count">
          {notifications.length} cuộc hội thoại
        </span>
      </div>

      <div className="notification-dropdown__content">
        {loading ? (
          <div className="notification-dropdown__loading">
            <div className="notification-dropdown__spinner" />
            <span>Đang tải...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-dropdown__empty">
            <span className="notification-dropdown__empty-icon">🔔</span>
            <p>Không có thông báo mới</p>
          </div>
        ) : (
          <div className="notification-dropdown__list">
            {notifications.map((conv) => {
              const name = getCustomerName(conv);
              const isPending = conv.status === "PENDING";
              const isInProgress = conv.status === "IN_PROGRESS";
              const lastMessage =
                typeof conv.lastMessage === "string"
                  ? conv.lastMessage
                  : conv.lastMessage?.content || "Tin nhắn mới";

              // Xác định loại sender
              const lastSenderType = (
                conv.lastMessageSenderType ||
                conv.lastSenderType ||
                (typeof conv.lastMessage === "object"
                  ? conv.lastMessage?.senderType
                  : null) ||
                ""
              ).toUpperCase();
              const isFromCustomer =
                lastSenderType !== "ADMIN" && lastSenderType !== "SYSTEM";

              return (
                <div
                  key={conv.id || conv.conversationId}
                  className={`notification-dropdown__item ${
                    isPending ? "notification-dropdown__item--pending" : ""
                  } ${
                    isFromCustomer ? "notification-dropdown__item--unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(conv)}
                >
                  <div className="notification-dropdown__avatar">
                    {getInitials(name)}
                    {(isPending || isFromCustomer) && (
                      <span className="notification-dropdown__dot" />
                    )}
                  </div>
                  <div className="notification-dropdown__info">
                    <div className="notification-dropdown__name">
                      {name}
                      {isPending && (
                        <span className="notification-dropdown__badge notification-dropdown__badge--new">
                          Mới
                        </span>
                      )}
                      {isInProgress && (
                        <span className="notification-dropdown__badge notification-dropdown__badge--progress">
                          Đang xử lý
                        </span>
                      )}
                    </div>
                    <div className="notification-dropdown__message">
                      {isFromCustomer ? "" : "Bạn: "}
                      {lastMessage.length > 40
                        ? lastMessage.slice(0, 40) + "..."
                        : lastMessage}
                    </div>
                    <div className="notification-dropdown__time">
                      📅 {formatTime(conv.lastMessageAt || conv.updatedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="notification-dropdown__footer">
        <button
          className="notification-dropdown__view-all"
          onClick={handleViewAll}
        >
          Xem tất cả tin nhắn
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
