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

const MAX_PRICE_VALUE = Number.MAX_SAFE_INTEGER;
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

  const filteredProducts = useMemo(
    () => filterProductsByPrice(rawProducts, priceFilter),
    [rawProducts, priceFilter]
  );
  const featuredProducts = useMemo(
    () => filteredProducts.slice(0, 3),
    [filteredProducts]
  );
  const productCount = filteredProducts.length;
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
              <h4 className="sidebar-heading green-bg text-white p-3 rounded-top">
                CÓ THỂ BẠN SẼ THÍCH
              </h4>
              <div className="p-3">
                {featuredProducts.length === 0 && !loading && (
                  <p className="mb-0">Chưa có sản phẩm để gợi ý.</p>
                )}
                {featuredProducts.map((item) => (
                  <div key={item.id} className="featured-item d-flex mb-3">
                    <img
                      src={
                        item.imageSrc ||
                        item.imageUrl ||
                        "https://via.placeholder.com/80x80?text=No+Image"
                      }
                      alt={item.name}
                      className="featured-image me-2"
                    />
                    <div className="featured-details">
                      <p className="featured-name mb-1">{item.name}</p>
                      <p className="featured-price mb-0">
                        {item.priceLabel || item.price || "LIÊN HỆ"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                {!loading && filteredProducts.length === 0 && (
                  <p className="product-grid-status">{emptyStateMessage}</p>
                )}
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination giả lập */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="d-flex justify-content-center mt-5">
                <nav>
                  <ul className="pagination">
                    <li className="page-item disabled">
                      <a className="page-link" href="#">
                        Trước
                      </a>
                    </li>
                    <li className="page-item active">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        ...
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        Sau
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Store;
