import { useEffect, useState } from "react";
import { fetchActiveCategories } from "../../../services/categoryService";
import "./Sidebar.css";

function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        setLoading(true);
        const activeCategories = await fetchActiveCategories({
          signal: controller.signal,
        });
        setCategories(activeCategories);
        setActiveIndex(0);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch categories failed:", err);
          setError("Không tải được danh mục. Vui lòng thử lại.");
          setCategories([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    return () => controller.abort();
  }, []);

  const renderList = () => {
    if (loading) {
      return <div className="sidebar-placeholder">Đang tải danh mục...</div>;
    }

    if (error) {
      return <div className="sidebar-error">{error}</div>;
    }

    if (!categories.length) {
      return <div className="sidebar-placeholder">Chưa có danh mục</div>;
    }

    return categories.map((cat, index) => {
      const slug = (cat?.name || `category-${index}`)
        .toLowerCase()
        .replace(/\s+/g, "-");

      return (
        <a
          key={cat?.categoryId || index}
          href={`#${slug}`}
          className={`sidebar-item ${index === activeIndex ? "active" : ""}`}
          onClick={() => setActiveIndex(index)}
        >
          {cat?.name || "Danh mục chưa đặt tên"}
        </a>
      );
    });
  };

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

      <div className="sidebar-menu">{renderList()}</div>
    </div>
  );
}

export default Sidebar;
