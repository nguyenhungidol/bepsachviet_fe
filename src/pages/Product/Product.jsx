import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import Sidebar from "../Home/Sidebar/Sidebar";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import "./Product.css";
import {
  fetchProducts,
  fetchProductsByCategory,
} from "../../services/productService";
import LikeProduct from "../../components/LikeProduct/LikeProduct.jsx";

const MAX_PRICE_VALUE = Number.MAX_SAFE_INTEGER;
const ITEMS_PER_PAGE = 12;
const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const getNumericPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return null;
  }

  if (typeof price === "number" && !Number.isNaN(price)) {
    return price;
  }

  if (typeof price === "string") {
    const digits = price.replace(/[^\d]/g, "");
    if (!digits) return null;
    return Number(digits);
  }

  return null;
};

const filterProductsByPrice = (items = [], range) => {
  if (!range) return items;

  const { min = 0, max = MAX_PRICE_VALUE } = range;
  return items.filter((item) => {
    const priceValue = getNumericPrice(item?.price ?? item?.priceLabel);
    if (priceValue === null) return false;
    return priceValue >= min && priceValue <= max;
  });
};

const sortProducts = (items = [], sortOption) => {
  if (!items.length) return items;

  const sorted = [...items];

  switch (sortOption) {
    case "latest":
      // Sort by createdAt descending (newest first)
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    case "price-asc":
      // Sort by price low to high
      return sorted.sort((a, b) => {
        const priceA =
          getNumericPrice(a?.price ?? a?.priceLabel) ?? MAX_PRICE_VALUE;
        const priceB =
          getNumericPrice(b?.price ?? b?.priceLabel) ?? MAX_PRICE_VALUE;
        return priceA - priceB;
      });

    case "price-desc":
      // Sort by price high to low
      return sorted.sort((a, b) => {
        const priceA = getNumericPrice(a?.price ?? a?.priceLabel) ?? 0;
        const priceB = getNumericPrice(b?.price ?? b?.priceLabel) ?? 0;
        return priceB - priceA;
      });

    case "popular":
      // Sort by popularity (views, sales count, etc.) - fallback to isBestSeller
      return sorted.sort((a, b) => {
        const popA = a.viewCount || a.salesCount || (a.isBestSeller ? 1 : 0);
        const popB = b.viewCount || b.salesCount || (b.isBestSeller ? 1 : 0);
        return popB - popA;
      });

    case "rating":
      // Sort by rating descending
      return sorted.sort((a, b) => {
        const ratingA = a.rating || a.averageRating || 0;
        const ratingB = b.rating || b.averageRating || 0;
        return ratingB - ratingA;
      });

    case "relevance":
      // Keep original order for search relevance
      return sorted;

    default:
      return sorted;
  }
};

const formatPriceValue = (value, fallbackLabel = "Không giới hạn") => {
  if (!Number.isFinite(value) || value === MAX_PRICE_VALUE) {
    return fallbackLabel;
  }
  if (value <= 0) {
    return priceFormatter.format(0);
  }
  return priceFormatter.format(value);
};

function Store() {
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const [priceFilter, setPriceFilter] = useState(null);
  const [priceInputs, setPriceInputs] = useState({ min: "", max: "" });
  const [priceFilterError, setPriceFilterError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const controllerRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryNameParam = (searchParams.get("categoryName") || "").trim();
  const searchTermParam = (searchParams.get("search") || "").trim();
  const hasSearchQuery = Boolean(searchTermParam);

  const executeFetch = useCallback(async (fetcher) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const data = await fetcher(controller.signal);
      setRawProducts(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to load products", err);
        setRawProducts([]);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllProducts = useCallback(() => {
    setSelectedCategory(null);
    return executeFetch((signal) => fetchProducts({ signal }));
  }, [executeFetch]);

  const fetchCategoryProducts = useCallback(
    (categoryId) =>
      executeFetch((signal) => fetchProductsByCategory(categoryId, { signal })),
    [executeFetch]
  );

  const handleCategorySelect = useCallback(
    (category) => {
      const categoryId = category?.categoryId;
      const normalizedName = (category?.name || "").trim();

      if (!category || categoryId === "all") {
        if (!categoryIdParam && !hasSearchQuery) {
          return;
        }
        setSearchParams({});
        return;
      }

      if (
        categoryId === categoryIdParam &&
        normalizedName === categoryNameParam &&
        !hasSearchQuery
      ) {
        return;
      }

      const nextParams = { categoryId };
      if (normalizedName) {
        nextParams.categoryName = normalizedName;
      }
      setSearchParams(nextParams);
    },
    [categoryIdParam, categoryNameParam, hasSearchQuery, setSearchParams]
  );

  const handlePriceInputChange = useCallback((event) => {
    const { name, value } = event.target;
    const normalized = value === "" ? "" : value.replace(/[^\d]/g, "");
    setPriceInputs((prev) => ({ ...prev, [name]: normalized }));
  }, []);

  const handleApplyPriceFilter = useCallback(() => {
    const minValue = priceInputs.min === "" ? 0 : Number(priceInputs.min);
    const maxValue =
      priceInputs.max === "" ? MAX_PRICE_VALUE : Number(priceInputs.max);

    if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
      setPriceFilterError("Vui lòng nhập giá hợp lệ.");
      return;
    }

    if (maxValue < minValue) {
      setPriceFilterError("Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu.");
      return;
    }

    setPriceFilterError("");

    if (minValue === 0 && maxValue === MAX_PRICE_VALUE) {
      setPriceFilter(null);
      return;
    }

    setPriceFilter({ min: minValue, max: maxValue });
  }, [priceInputs]);

  const handleResetPriceFilter = useCallback(() => {
    setPriceFilter(null);
    setPriceInputs({ min: "", max: "" });
    setPriceFilterError("");
  }, []);

  useEffect(() => {
    if (searchTermParam) {
      setSelectedCategory(null);
      const normalizedTerm = searchTermParam.toLowerCase();
      executeFetch((signal) =>
        fetchProducts({ signal, search: searchTermParam }).then((items) =>
          items.filter((item) => {
            const name = item?.name?.toLowerCase?.() || "";
            const description = item?.description?.toLowerCase?.() || "";
            return (
              name.includes(normalizedTerm) ||
              description.includes(normalizedTerm)
            );
          })
        )
      );
      return;
    }

    if (!categoryIdParam || categoryIdParam === "all") {
      fetchAllProducts();
      return;
    }

    const normalizedCategory = {
      categoryId: categoryIdParam,
      name: categoryNameParam,
    };
    setSelectedCategory(normalizedCategory);
    fetchCategoryProducts(categoryIdParam);
  }, [
    categoryIdParam,
    categoryNameParam,
    fetchAllProducts,
    fetchCategoryProducts,
    searchTermParam,
    executeFetch,
  ]);

  useEffect(() => {
    if (hasSearchQuery) {
      setSortOption("relevance");
    } else if (sortOption === "relevance") {
      setSortOption("latest");
    }
  }, [hasSearchQuery, searchTermParam]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  // Apply price filter and then sort
  const filteredAndSortedProducts = useMemo(() => {
    const priceFiltered = filterProductsByPrice(rawProducts, priceFilter);
    return sortProducts(priceFiltered, sortOption);
  }, [rawProducts, priceFilter, sortOption]);

  // Pagination calculations
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [priceFilter, sortOption, rawProducts]);

  // Get current page items
  const paginatedProducts = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page < 0 || page >= totalPages) return;
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  // Generate pagination items with ellipsis
  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 0; i < totalPages; i++) {
        items.push({ type: "page", value: i });
      }
    } else {
      // Always show first page
      items.push({ type: "page", value: 0 });

      if (currentPage > 2) {
        items.push({ type: "ellipsis", value: "start" });
      }

      // Show pages around current page
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push({ type: "page", value: i });
      }

      if (currentPage < totalPages - 3) {
        items.push({ type: "ellipsis", value: "end" });
      }

      // Always show last page
      items.push({ type: "page", value: totalPages - 1 });
    }

    return items;
  }, [totalPages, currentPage]);

  const featuredProducts = useMemo(
    () => filteredAndSortedProducts.slice(0, 5),
    [filteredAndSortedProducts]
  );
  const productCount = filteredAndSortedProducts.length;
  const isPriceFiltering = Boolean(priceFilter);
  const desiredMinLabel = formatPriceValue(
    priceInputs.min === "" ? 0 : Number(priceInputs.min)
  );
  const desiredMaxLabel = formatPriceValue(
    priceInputs.max === "" ? MAX_PRICE_VALUE : Number(priceInputs.max)
  );
  const appliedMinLabel = priceFilter
    ? formatPriceValue(priceFilter.min)
    : null;
  const appliedMaxLabel = priceFilter
    ? formatPriceValue(priceFilter.max)
    : null;

  const selectedCategoryId = hasSearchQuery
    ? "all"
    : selectedCategory?.categoryId || "all";

  const breadcrumbCategoryLabel =
    categoryNameParam || selectedCategory?.name || "Danh mục";
  const showCategoryBreadcrumb =
    !hasSearchQuery && Boolean(categoryIdParam && categoryIdParam !== "all");
  const breadcrumbSearchLabel = `KẾT QUẢ TÌM KIẾM CHO “${searchTermParam}”`;

  const displayInfoText = useMemo(() => {
    if (loading) {
      return hasSearchQuery
        ? `Đang tìm kiếm “${searchTermParam}”...`
        : "Đang tải sản phẩm...";
    }

    if (hasSearchQuery) {
      const baseText = productCount
        ? `Tìm thấy ${productCount} sản phẩm cho “${searchTermParam}”`
        : `Không tìm thấy sản phẩm cho “${searchTermParam}”`;
      return isPriceFiltering
        ? `${baseText} trong khoảng giá đã chọn`
        : baseText;
    }

    if (showCategoryBreadcrumb) {
      const baseText = `Hiển thị ${productCount} sản phẩm trong “${breadcrumbCategoryLabel}”`;
      return isPriceFiltering
        ? `${baseText}, phù hợp với mức giá đã chọn`
        : baseText;
    }

    if (isPriceFiltering) {
      return `Hiển thị ${productCount} sản phẩm trong khoảng giá đã chọn`;
    }

    return `Hiển thị ${productCount} sản phẩm`;
  }, [
    loading,
    hasSearchQuery,
    searchTermParam,
    productCount,
    showCategoryBreadcrumb,
    breadcrumbCategoryLabel,
    isPriceFiltering,
  ]);

  const emptyStateMessage = useMemo(() => {
    if (hasSearchQuery) {
      return isPriceFiltering
        ? `Không tìm thấy sản phẩm cho “${searchTermParam}” trong khoảng giá đã chọn.`
        : `Không tìm thấy sản phẩm phù hợp cho “${searchTermParam}”.`;
    }
    if (showCategoryBreadcrumb) {
      return isPriceFiltering
        ? "Danh mục này không có sản phẩm trong khoảng giá đã chọn."
        : "Chưa có sản phẩm trong danh mục này.";
    }
    if (isPriceFiltering) {
      return "Không có sản phẩm trong khoảng giá đã chọn.";
    }
    return "Hiện chưa có sản phẩm để hiển thị.";
  }, [
    hasSearchQuery,
    searchTermParam,
    showCategoryBreadcrumb,
    isPriceFiltering,
  ]);

  return (
    <div className="store-page bg-light">
      <div className="page-header-top bg-gray-100 py-3 mb-1">
        <Container>
          {/* THÊM wrapper này để dàn hàng ngang */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            {/* Phần 1: Breadcrumb (Bên trái) */}
            <div className="breadcrumb text-sm text-muted m-0">
              <NavLink to="/" className="text-muted text-decoration-none">
                TRANG CHỦ
              </NavLink>
              <span className="mx-1 text-muted">/</span>
              {hasSearchQuery || showCategoryBreadcrumb ? (
                <>
                  <NavLink
                    to="/san-pham"
                    className="text-muted text-decoration-none"
                  >
                    CỬA HÀNG
                  </NavLink>
                  <span className="mx-1 text-muted">/</span>
                  <span className="fw-bold text-dark text-uppercase">
                    {hasSearchQuery
                      ? breadcrumbSearchLabel
                      : breadcrumbCategoryLabel}
                  </span>
                </>
              ) : (
                <span className="fw-bold">CỬA HÀNG </span>
              )}
            </div>

            {/* Phần 2: Sort/Filter (Bên phải) */}
            {/* Đã xóa mb-4 để căn giữa theo chiều dọc chuẩn hơn */}
            <div className="store-header align-items-center gap-3 m-0">
              <div className="sort-filter-area">
                <span className="display-info">{displayInfoText}</span>
                <select
                  className="sort-dropdown form-select form-select-sm"
                  style={{ width: "auto", display: "inline-block" }}
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                >
                  <option value="latest">Mới nhất</option>
                  <option value="price-asc">
                    Thứ tự theo giá: Thấp đến Cao
                  </option>
                  <option value="price-desc">
                    Thứ tự theo giá: Cao đến Thấp
                  </option>
                  <option value="popular">Thứ tự theo độ phổ biến</option>
                  <option value="rating">Thứ tự theo điểm đánh giá </option>
                  <option value="relevance">Độ liên quan</option>
                </select>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* MAIN CONTENT AREA */}
      <Container className="main-store-content pb-5">
        <Row className="g-4 align-items-start">
          {/* SIDEBAR */}
          <Col xs={12} lg={3}>
            <Sidebar
              onCategorySelect={handleCategorySelect}
              selectedCategoryId={selectedCategoryId}
              showAllOption
            />

            {/* Lọc sản phẩm */}
            <div className="sidebar-section mt-4 bg-white shadow-sm rounded">
              <h4 className="sidebar-heading green-bg text-white p-3 rounded-top">
                LỌC SẢN PHẨM
              </h4>
              <div className="p-3 price-filter-content">
                <div className="price-input-group mb-3">
                  <label
                    htmlFor="price-min"
                    className="form-label text-uppercase text-muted small mb-1"
                  >
                    Giá từ
                  </label>
                  <input
                    id="price-min"
                    name="min"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="form-control form-control-sm"
                    placeholder="0"
                    value={priceInputs.min}
                    onChange={handlePriceInputChange}
                  />
                </div>
                <div className="price-input-group mb-3">
                  <label
                    htmlFor="price-max"
                    className="form-label text-uppercase text-muted small mb-1"
                  >
                    Giá đến
                  </label>
                  <input
                    id="price-max"
                    name="max"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="form-control form-control-sm"
                    placeholder="Không giới hạn"
                    value={priceInputs.max}
                    onChange={handlePriceInputChange}
                  />
                </div>
                <p className="mb-2 small text-muted">
                  Khoảng giá mong muốn:{" "}
                  <span className="fw-semibold text-dark">
                    {desiredMinLabel}
                  </span>{" "}
                  —{" "}
                  <span className="fw-semibold text-dark">
                    {desiredMaxLabel}
                  </span>
                </p>
                {priceFilter && (
                  <p className="mb-2 small text-success">
                    Đang áp dụng:{" "}
                    <span className="fw-semibold text-dark">
                      {appliedMinLabel}
                    </span>{" "}
                    —{" "}
                    <span className="fw-semibold text-dark">
                      {appliedMaxLabel}
                    </span>
                  </p>
                )}
                {priceFilterError && (
                  <p className="mb-2 small text-danger">{priceFilterError}</p>
                )}
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="filter-button flex-grow-1"
                    onClick={handleApplyPriceFilter}
                  >
                    LỌC
                  </button>
                  {priceFilter && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm flex-grow-1"
                      onClick={handleResetPriceFilter}
                    >
                      BỎ LỌC
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Có thể bạn thích */}
            <div className="sidebar-section mt-4 bg-white shadow-sm rounded">
              <LikeProduct
                featuredProducts={featuredProducts}
                loading={loading}
              />
            </div>
          </Col>

          {/* MAIN PRODUCT GRID */}
          <Col xs={12} lg={9}>
            {error && <p className="product-grid-error">{error}</p>}
            {!error && (
              <>
                {loading && (
                  <p className="product-grid-status">Đang tải sản phẩm...</p>
                )}
                {!loading && filteredAndSortedProducts.length === 0 && (
                  <p className="product-grid-status">{emptyStateMessage}</p>
                )}
                <div className="product-grid">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav>
                  <ul className="pagination">
                    <li
                      className={`page-item ${
                        currentPage === 0 ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        Trước
                      </button>
                    </li>
                    {paginationItems.map((item, index) =>
                      item.type === "ellipsis" ? (
                        <li
                          key={`ellipsis-${item.value}`}
                          className="page-item disabled"
                        >
                          <span className="page-link">...</span>
                        </li>
                      ) : (
                        <li
                          key={item.value}
                          className={`page-item ${
                            currentPage === item.value ? "active" : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => handlePageChange(item.value)}
                          >
                            {item.value + 1}
                          </button>
                        </li>
                      )
                    )}
                    <li
                      className={`page-item ${
                        currentPage >= totalPages - 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}

            {/* Page info */}
            {!loading && !error && totalPages > 1 && (
              <p className="text-center text-muted small mt-2">
                Trang {currentPage + 1} / {totalPages} (Tổng {productCount} sản
                phẩm)
              </p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Store;
