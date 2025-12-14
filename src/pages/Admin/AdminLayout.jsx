import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminChat } from "../../context/AdminChatContext";
import NotificationDropdown from "../../components/Admin/NotificationDropdown";
import ToastNotification from "../../components/Admin/ToastNotification";
import "./AdminLayout.css";

const adminNavItems = [
  { path: "/admin", label: "Dashboard", exact: true },
  { path: "/admin/categories", label: "Quản lý danh mục" },
  { path: "/admin/products", label: "Quản lý sản phẩm" },
  { path: "/admin/orders", label: "Quản lý đơn hàng" },
  { path: "/admin/chat", label: "Hỗ trợ khách hàng" },
  { path: "/admin/marketing", label: "Kế hoạch Marketing" },
  { path: "/admin/posts", label: "Quản lý bài viết" },
  { path: "/admin/users", label: "Quản lý người dùng" },
];

// Bell icon for notifications
const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
  </svg>
);

const AdminLayout = () => {
  const { user } = useAuth();
  const {
    pendingCount,
    hasNewMessage,
    clearNewMessage,
    toasts,
    removeToast,
    recentNotifications,
  } = useAdminChat();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle notification dropdown
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (hasNewMessage) {
      clearNewMessage();
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">Bếp Sạch Việt</div>
        <nav className="admin-nav">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? "admin-nav__link--active" : ""}`
              }
            >
              {item.label}
              {item.path === "/admin/chat" && pendingCount > 0 && (
                <span className="admin-nav__badge">{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">BẢNG ĐIỀU KHIỂN</p>
            <h1 className="admin-header__title">Khu vực quản trị</h1>
          </div>
          <div className="admin-header__actions">
            {/* Chat Notification Bell with Dropdown */}
            <div className="admin-notification-wrapper" ref={notificationRef}>
              <button
                type="button"
                className={`admin-notification-btn ${
                  hasNewMessage ? "admin-notification-btn--active" : ""
                }`}
                onClick={handleBellClick}
                title="Thông báo chat"
              >
                <BellIcon />
                {/* Hiển thị badge số tin nhắn/conversation chưa xử lý */}
                {pendingCount > 0 ? (
                  <span className="admin-notification-btn__badge">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                ) : hasNewMessage ? (
                  <span className="admin-notification-btn__dot" />
                ) : null}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <NotificationDropdown
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            <button
              type="button"
              className="admin-view-site"
              onClick={() => navigate("/")}
            >
              Xem website
            </button>
            <div className="admin-user-chip">
              <span className="admin-user-chip__name">
                {user?.name || user?.email || "Admin"}
              </span>
              <span className="admin-user-chip__role">{user?.role}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="admin-toast-container">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClick={toast.onClick}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminLayout;
