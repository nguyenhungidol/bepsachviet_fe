import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActiveCategories } from "../../../services/categoryService";
import "./Sidebar.css";

function Sidebar({
  onCategorySelect,
  selectedCategoryId,
  showAllOption = false,
}) {
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
        const enrichedCategories = showAllOption
          ? [
              {
                categoryId: "all",
                name: "Tất cả sản phẩm",
                slug: "all-products",
              },
              ...activeCategories,
            ]
          : activeCategories;

        setCategories(enrichedCategories);
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
  }, [showAllOption]);

  useEffect(() => {
    if (!categories.length) return;

    if (!selectedCategoryId) {
      if (showAllOption) {
        setActiveIndex(0);
      }
      return;
    }

    const idx = categories.findIndex(
      (cat) => cat?.categoryId === selectedCategoryId
    );
    if (idx >= 0 && idx !== activeIndex) {
      setActiveIndex(idx);
    }
  }, [categories, selectedCategoryId, showAllOption, activeIndex]);

  const handleCategoryClick = (category, index) => {
    if (!onCategorySelect) return;
    onCategorySelect(category);
    setActiveIndex(index);
  };

  const buildCategoryLink = (category, fallbackSlug) => {
    if (!category || category.categoryId === "all") {
      return "/san-pham";
    }

    const params = new URLSearchParams();
    const target = category.categoryId || category.slug || fallbackSlug;

    if (target) {
      params.set("categoryId", target);
    }

    if (category.name) {
      params.set("categoryName", category.name);
    }

    const query = params.toString();
    return query ? `/san-pham?${query}` : "/san-pham";
  };

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
      const linkTarget = buildCategoryLink(cat, slug);
      const key = cat?.categoryId || slug;
      const className = `sidebar-item ${index === activeIndex ? "active" : ""}`;

      if (onCategorySelect) {
        return (
          <button
            key={key}
            type="button"
            className={className}
            onClick={() => handleCategoryClick(cat, index)}
          >
            {cat?.name || "Danh mục chưa đặt tên"}
          </button>
        );
      }

      return (
        <Link key={key} to={linkTarget} className={className}>
          {cat?.name || "Danh mục chưa đặt tên"}
        </Link>
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
