import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, NavLink, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import "./ProductDetail.css";
import Sidebar from "../Home/Sidebar/Sidebar";
import LikeProduct from "../../components/LikeProduct/LikeProduct";
import ProductCard from "../../components/ProductCard/ProductCard";
import {
  fetchProductById,
  fetchProducts,
  fetchProductsByCategory,
} from "../../services/productService";
import { fetchCategories } from "../../services/categoryService";

const FALLBACK_IMAGE = "https://via.placeholder.com/500x500?text=No+Image";

// --- HELPERS: Icons ---
const CartIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </svg>
);

// --- HELPERS: Logic Format Văn Bản (QUAN TRỌNG) ---
const formatDescription = (content) => {
  if (!content) return "<p>Chưa có mô tả chi tiết cho sản phẩm này.</p>";

  // 1. Xử lý các ký tự lỗi hoặc ký tự ngắt dòng đặc biệt từ DB
  let clean = content;

  // Thay thế 4 dấu chấm hỏi (????) thành xuống dòng + icon tích xanh
  clean = clean.replace(/\?\?\?\?/g, '<div class="sales-point">');
  // Thay thế 3 dấu chấm hỏi (???) thành xuống dòng + icon ngón tay
  clean = clean.replace(/\?\?\?/g, '<div class="sales-point sales-icon-hand">');
  // Đóng thẻ div nếu cần (cách đơn giản là replace các break line)

  // NẾU KHÔNG DÙNG THẺ DIV CLASS, ta dùng thẻ <br> và <strong>
  // Cách tiếp cận an toàn hơn:
  clean = content
    .replace(/\?\?\?\?/g, "<br/><br/>✅ ") // Biến ???? thành Checkmark
    .replace(/\?\?\?/g, "<br/>👉 "); // Biến ??? thành Icon trỏ tay

  // 2. Tự động in đậm (Highlight) các từ khóa quan trọng thường gặp
  const keywords = [
    "Cách sử dụng:",
    "Hướng dẫn sử dụng:",
    "Hạn sử dụng:",
    "Bảo quản:",
    "Qui cách đóng gói:",
    "Quy cách:",
    "Thành phần:",
    "Lưu ý:",
    "Đặc điểm nổi bật:",
  ];

  keywords.forEach((key) => {
    // Regex case-insensitive (không phân biệt hoa thường)
    const regex = new RegExp(`(${key})`, "gi");
    clean = clean.replace(
      regex,
      '<br/><strong style="color: #198754;">$1</strong>'
    );
  });

  return clean;
};

// --- COMPONENTS: Loading & Quantity ---
const LoadingSkeleton = () => (
  <div className="product-skeleton">
    <Row>
      <Col lg={5}>
        <div className="skeleton skeleton-image"></div>
      </Col>
      <Col lg={7}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-price"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </Col>
    </Row>
  </div>
);

const QuantitySelector = ({ quantity, onChange }) => {
  const decrease = () => onChange(Math.max(1, quantity - 1));
  const increase = () => onChange(quantity + 1);

  return (
    <div className="quantity-selector">
      <button type="button" className="quantity-btn" onClick={decrease}>
        −
      </button>
      <input
        type="number"
        className="quantity-input"
        value={quantity}
        min="1"
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
      />
      <button type="button" className="quantity-btn" onClick={increase}>
        +
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [mainImage, setMainImage] = useState(FALLBACK_IMAGE);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [categoryName, setCategoryName] = useState(null);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // 1. Load Product
  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProductById(productId);
      setProduct(data);
      setMainImage(data?.imageSrc || FALLBACK_IMAGE);
    } catch (error) {
      console.error("Failed to load product", error);
      toast.error("Không thể tải thông tin sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // 2. Load Category Name
  const loadCategoryName = useCallback(async () => {
    if (product?.categoryName) {
      setCategoryName(product.categoryName);
      return;
    }
    if (!product?.categoryId) {
      setCategoryName(null);
      return;
    }
    try {
      const categories = await fetchCategories();
      const found = categories.find(
        (cat) =>
          cat.categoryId === product.categoryId || cat.id === product.categoryId
      );
      setCategoryName(found?.name || null);
    } catch (error) {
      console.error("Failed to load category", error);
    }
  }, [product]);

  // 3. Load Related Products
  const loadRelated = useCallback(async () => {
    if (!product?.categoryId) {
      setRelatedProducts([]);
      setLoadingRelated(false);
      return;
    }
    setLoadingRelated(true);
    try {
      const data = await fetchProductsByCategory(product.categoryId);
      const filtered = data.filter((p) => p.id !== product.id).slice(0, 4);
      setRelatedProducts(filtered);
    } catch (error) {
      console.error("Failed to load related products", error);
    } finally {
      setLoadingRelated(false);
    }
  }, [product]);

  // 4. Load Suggested Products
  const loadSuggested = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setSuggestedProducts(data.slice(0, 5));
    } catch (error) {
      console.error("Failed to load suggested products", error);
    }
  }, []);

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [loadProduct]);
  useEffect(() => {
    loadCategoryName();
  }, [loadCategoryName]);
  useEffect(() => {
    loadRelated();
  }, [loadRelated]);
  useEffect(() => {
    loadSuggested();
  }, [loadSuggested]);

  // Handlers
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Đã sao chép liên kết!");
    } catch {
      toast.error("Không thể sao chép liên kết.");
    }
  };

  const handleAddToCart = () => {
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const productImages = product
    ? [product.imageSrc, product.imageSrc].filter(Boolean) // Demo: Duplicate image to show gallery
    : [];

  return (
    <div className="product-detail-page bg-light">
      {/* Breadcrumb */}
      <div className="page-header-top bg-gray-100 py-3 mb-4">
        <Container>
          <nav className="breadcrumb text-sm text-muted mb-0">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ
            </NavLink>
            <span className="mx-2">/</span>
            <NavLink to="/san-pham" className="text-muted text-decoration-none">
              Sản phẩm
            </NavLink>
            <span className="mx-2">/</span>
            <span className="fw-bold text-dark">
              {loading ? "Đang tải..." : product?.name || "Sản phẩm"}
            </span>
          </nav>
        </Container>
      </div>

      <Container className="main-content-area pb-5">
        <Row className="g-4 align-items-start">
          {/* Sidebar */}
          <Col xs={12} lg={3} className="order-lg-1 order-2">
            <Sidebar />
            <div className="sidebar-section mb-4 bg-white shadow-sm rounded mt-4">
              <LikeProduct
                featuredProducts={suggestedProducts}
                loading={false}
              />
            </div>
          </Col>

          {/* Main Content */}
          <Col xs={12} lg={9} className="order-lg-2 order-1">
            {loading && <LoadingSkeleton />}

            {!loading && !product && (
              <div className="text-center py-5 bg-white rounded shadow-sm">
                <h4 className="text-muted">Không tìm thấy sản phẩm</h4>
                <Link to="/san-pham" className="btn btn-success mt-3">
                  Quay lại cửa hàng
                </Link>
              </div>
            )}

            {!loading && product && (
              <>
                {/* --- PRODUCT TOP SECTION --- */}
                <div className="product-main-section">
                  <Row>
                    {/* Gallery */}
                    <Col lg={5}>
                      <div className="product-gallery">
                        <div className="product-badges">
                          {product.isNew && (
                            <span className="product-badge new">Mới</span>
                          )}
                          {product.isBestSeller && (
                            <span className="product-badge bestseller">
                              Bán chạy
                            </span>
                          )}
                        </div>
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="product-main-image"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        {productImages.length > 1 && (
                          <div className="product-thumbnails">
                            {productImages.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Thumb ${index}`}
                                className={`product-thumbnail ${
                                  mainImage === img ? "active" : ""
                                }`}
                                onClick={() => setMainImage(img)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </Col>

                    {/* Info */}
                    <Col lg={7}>
                      <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>

                        {product.ocUrl && (
                          <div className="ocop-badge-wrapper mb-3">
                            <img
                              src={product.ocUrl}
                              alt="OCOP"
                              className="ocop-badge"
                            />
                          </div>
                        )}

                        <div className="product-meta">
                          {(categoryName || product.categoryId) && (
                            <Link
                              to={`/san-pham?categoryId=${product.categoryId}`}
                              className="product-category"
                            >
                              {categoryName || "Đặc sản"}
                            </Link>
                          )}
                          {product.productId && (
                            <span className="product-sku">
                              Mã: {product.productId}
                            </span>
                          )}
                        </div>

                        <div className="product-price-section">
                          {/* Logic hiển thị giá: Nếu giá = 0 thì hiện Liên hệ */}
                          {product.price > 0 ? (
                            <p className="product-price">
                              {product.price.toLocaleString("vi-VN")} ₫
                            </p>
                          ) : (
                            <p
                              className="product-price"
                              style={{ color: "#0d6efd" }}
                            >
                              Liên hệ
                            </p>
                          )}
                          <p className="product-price-note">
                            Cam kết chất lượng - Giao hàng nhanh chóng
                          </p>
                        </div>

                        {/* Short Desc (lấy 1 đoạn ngắn từ desc full nếu không có field shortDesc) */}
                        {product.description && (
                          <div className="product-short-desc">
                            {product.description
                              .replace(/\?\?\?\?/g, "")
                              .substring(0, 150)}
                            ...
                          </div>
                        )}

                        <div className="quantity-section">
                          <label>Số lượng:</label>
                          <QuantitySelector
                            quantity={quantity}
                            onChange={setQuantity}
                          />
                        </div>

                        <div className="product-actions">
                          {product.price > 0 ? (
                            <button
                              type="button"
                              className="btn-add-cart"
                              onClick={handleAddToCart}
                            >
                              <CartIcon /> Thêm vào giỏ
                            </button>
                          ) : (
                            // Nếu không có giá thì ẩn nút thêm giỏ hàng
                            <button
                              type="button"
                              className="btn-add-cart"
                              style={{
                                background: "#6c757d",
                                cursor: "not-allowed",
                              }}
                            >
                              Hàng đặt trước
                            </button>
                          )}

                          <Link to="/lien-he" className="btn-contact">
                            Tư vấn ngay
                          </Link>
                        </div>

                        <div className="share-section">
                          <h6>Chia sẻ ngay:</h6>
                          <div className="share-buttons">
                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                currentUrl
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="share-btn facebook"
                            >
                              <FacebookIcon />
                            </a>
                            <button
                              type="button"
                              className="share-btn copy"
                              onClick={handleCopyLink}
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* --- PRODUCT TABS (CONTENT) --- */}
                <div className="product-tabs">
                  <div className="product-tabs-nav">
                    <button
                      type="button"
                      className={`tab-btn ${
                        activeTab === "description" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("description")}
                    >
                      Mô tả sản phẩm
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${
                        activeTab === "details" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("details")}
                    >
                      Thông tin chi tiết
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${
                        activeTab === "reviews" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("reviews")}
                    >
                      Đánh giá (0)
                    </button>
                  </div>

                  <div className="tab-content">
                    {/* TAB 1: MÔ TẢ (Dùng hàm formatDescription) */}
                    {activeTab === "description" && (
                      <div
                        className="product-description"
                        dangerouslySetInnerHTML={{
                          __html: formatDescription(product.description),
                        }}
                      />
                    )}

                    {/* TAB 2: CHI TIẾT */}
                    {activeTab === "details" && (
                      <div className="product-details-tab">
                        <table className="table table-striped">
                          <tbody>
                            <tr>
                              <th>Tên sản phẩm</th>
                              <td>{product.name}</td>
                            </tr>
                            {product.productId && (
                              <tr>
                                <th>Mã sản phẩm</th>
                                <td>{product.productId}</td>
                              </tr>
                            )}
                            <tr>
                              <th>Xuất xứ</th>
                              <td>Việt Nam (OCOP)</td>
                            </tr>
                            <tr>
                              <th>Tình trạng</th>
                              <td>
                                <span className="text-success fw-bold">
                                  Còn hàng
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* TAB 3: ĐÁNH GIÁ */}
                    {activeTab === "reviews" && (
                      <div className="product-reviews-tab text-center py-4">
                        <p className="text-muted">
                          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                        </p>
                        <button className="btn btn-outline-success btn-sm">
                          Viết đánh giá
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- RELATED PRODUCTS --- */}
                {!loadingRelated && relatedProducts.length > 0 && (
                  <div className="related-products-section">
                    <h3>Sản phẩm liên quan</h3>
                    <div className="related-products-grid">
                      {relatedProducts.map((relProduct) => (
                        <ProductCard key={relProduct.id} product={relProduct} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProductDetail;
