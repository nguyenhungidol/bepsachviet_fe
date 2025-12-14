import { useEffect, useState } from "react";
import "./ToastNotification.css";

const ToastNotification = ({
  message,
  type = "info",
  duration = 5000,
  onClose,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`toast-notification toast-notification--${type} ${
        isExiting ? "toast-notification--exit" : ""
      }`}
      onClick={onClick}
    >
      <div className="toast-notification__icon">
        {type === "chat" && "💬"}
        {type === "success" && "✓"}
        {type === "warning" && "⚠"}
        {type === "error" && "✕"}
        {type === "info" && "ℹ"}
      </div>
      <div className="toast-notification__content">{message}</div>
      <button
        className="toast-notification__close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      >
        ✕
      </button>
    </div>
  );
};

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
          onClick={toast.onClick}
        />
      ))}
    </div>
  );
};

export default ToastNotification;
