// src/components/Sidebar.jsx
import React from "react";
import { ListGroup } from "react-bootstrap";

const categories = [
  "Sản phẩm từ vịt",
  "Sản phẩm từ gà",
  "Sản phẩm từ heo",
  "Sản phẩm từ ngan",
  "Sản phẩm từ cá",
  "Hải sản",
  "Các loại hạt",
  "Các loại ruốc",
  "Thực phẩm khác",
];

function Sidebar() {
  return (
    <div>
      {/* Header Danh mục */}
      <div className="sidebar-header">🌱 DANH MỤC SẢN PHẨM</div>

      {/* Danh sách */}
      <ListGroup className="sidebar-menu">
        {categories.map((cat, index) => (
          <ListGroup.Item
            key={index}
            action
            href={`#${cat.replace(/\s/g, "-").toLowerCase()}`}
            // Chỉ định mục đầu tiên 'Sản phẩm từ vịt' là active (tô màu chữ và border trái)
            className={index === 0 ? "active" : ""}
          >
            {cat}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default Sidebar;
