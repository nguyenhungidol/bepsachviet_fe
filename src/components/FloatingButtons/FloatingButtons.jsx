import "./FloatingButtons.css";

function FloatingButtons() {
  return (
    <div className="floating-buttons">
      <a
        href="https://zalo.me/0868839655"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn zalo-btn"
        title="Chat qua Zalo"
      >
        <svg width="40" height="40" viewBox="0 0 48 48" fill="white">
          <path d="M24 4C12.95 4 4 11.93 4 21.67c0 5.78 3.19 10.93 8.12 14.29-.11 3.44-1.18 9.87-1.26 10.33-.09.56.26 1.07.82 1.2.15.04.31.05.46.05.43 0 .84-.19 1.12-.53.84-.99 5.82-6.66 7.03-7.94 1.19.13 2.41.2 3.65.2 11.05 0 20-7.93 20-17.67S35.05 4 24 4z" />
        </svg>
      </a>

      <a
        href="https://m.me/bepsachviet"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn messenger-btn"
        title="Chat qua Messenger"
      >
        <svg width="40" height="40" viewBox="0 0 48 48" fill="white">
          <path d="M24 4C12.97 4 4 12.42 4 23c0 5.52 2.42 10.43 6.24 13.83V44l7.08-3.88c1.89.52 3.89.8 5.96.8 11.03 0 19.72-8.42 19.72-18.92S35.03 4 24 4zm2.13 25.5l-5.06-5.39-9.87 5.39L22.41 18l5.18 5.39 9.75-5.39L26.13 29.5z" />
        </svg>
      </a>

      <a
        href="tel:0868839655"
        className="floating-btn phone-btn"
        title="Gọi điện"
      >
        <svg width="40" height="40" viewBox="0 0 48 48" fill="white">
          <path d="M13.25 21.59c2.88 5.66 7.51 10.29 13.18 13.17l4.4-4.41c.55-.55 1.34-.71 2.03-.49 2.24.74 4.65 1.14 7.14 1.14 1.11 0 2 .89 2 2V40c0 1.11-.89 2-2 2C19.22 42 6 28.78 6 8c0-1.11.9-2 2-2h7c1.11 0 2 .89 2 2 0 2.49.4 4.9 1.14 7.14.22.7.06 1.48-.5 2.03l-4.39 4.42z" />
        </svg>
      </a>
    </div>
  );
}

export default FloatingButtons;
