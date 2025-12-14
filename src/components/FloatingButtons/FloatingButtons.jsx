import { useChat } from "../../context/ChatContext";
import "./FloatingButtons.css";

// Consultant/Headset Icon (Phiên bản Solid - Dày và Nổi bật hơn)
const ConsultantIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="currentColor" // Dùng currentColor để dễ chỉnh màu nếu cần, hoặc để "white"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Path này vẽ tai nghe dạng khối đặc, cân xứng với Zalo/Messenger */}
    <path
      fill="white"
      d="M19 14v4h-2v-4h2M7 14v4H5v-4h2M12 2C6.48 2 2 6.48 2 12v7c0 1.66 1.34 3 3 3h4c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1H5v-3c0-3.87 3.13-7 7-7s7 3.13 7 7v3h-4c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h4c1.66 0 3-1.34 3-3v-7c0-5.52-4.48-10-10-10z"
    />
  </svg>
);

function FloatingButtons() {
  const { openChat, unreadCount } = useChat();

  return (
    <div className="floating-buttons">
      {/* Chat Support Button */}
      <button
        type="button"
        className="floating-btn support-btn"
        onClick={openChat}
        title="Tư vấn trực tuyến"
        aria-label="Mở chat tư vấn"
      >
        <ConsultantIcon />
        {unreadCount > 0 && (
          <span className="floating-btn__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Zalo Button */}
      <a
        href="https://zalo.me/0868839655"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn zalo-btn"
        title="Chat qua Zalo"
      >
        <svg width="32" height="32" viewBox="0 0 48 48" fill="white">
          <path d="M24 4C12.95 4 4 11.93 4 21.67c0 5.78 3.19 10.93 8.12 14.29-.11 3.44-1.18 9.87-1.26 10.33-.09.56.26 1.07.82 1.2.15.04.31.05.46.05.43 0 .84-.19 1.12-.53.84-.99 5.82-6.66 7.03-7.94 1.19.13 2.41.2 3.65.2 11.05 0 20-7.93 20-17.67S35.05 4 24 4z" />
        </svg>
      </a>

      {/* Messenger Button */}
      <a
        href="https://m.me/bepsachviet"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn messenger-btn"
        title="Chat qua Messenger"
      >
        <svg width="32" height="32" viewBox="0 0 48 48" fill="white">
          <path d="M24 4C12.97 4 4 12.42 4 23c0 5.52 2.42 10.43 6.24 13.83V44l7.08-3.88c1.89.52 3.89.8 5.96.8 11.03 0 19.72-8.42 19.72-18.92S35.03 4 24 4zm2.13 25.5l-5.06-5.39-9.87 5.39L22.41 18l5.18 5.39 9.75-5.39L26.13 29.5z" />
        </svg>
      </a>
    </div>
  );
}

export default FloatingButtons;
