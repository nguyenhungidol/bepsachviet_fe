import { useState } from "react";
import "./Sidebar.css";

const categories = [
  "Sản phẩm từ vịt",
  "Sản phẩm từ gà",
  "Sản phẩm từ heo",
  "Sản phẩm từ ngan",
  "Sản phẩm từ cá",
  "Hải sản",
  "Các loại hạt",
  "Các loại rượu",
  "Thực phẩm khác",
];

function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          className="me-2"
        >
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
        DANH MỤC SẢN PHẨM
      </div>

      <div className="sidebar-menu">
        {categories.map((cat, index) => (
          <a
            key={index}
            href={`#${cat.replace(/\s/g, "-").toLowerCase()}`}
            className={`sidebar-item ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            {cat}
          </a>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
