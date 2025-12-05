import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Offcanvas, Badge } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import "./Header.css";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/70x70?text=No+Image";

// Separate component to handle image loading with error fallback
const CartItemImage = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMAGE);
  const [hasError, setHasError] = useState(false);

  // Update image source when prop changes
  useEffect(() => {
    if (src && src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(PLACEHOLDER_IMAGE);
    }
  }, [hasError]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={{
        width: "70px",
        height: "70px",
        objectFit: "cover",
        borderRadius: "8px",
      }}
      onError={handleError}
    />
  );
};

function Header() {
  const {
    items,
    totalItems,
    totalPrice,
    updateItem,
    removeItem,
    formatPrice,
    loading,
  } = useCart();
  const [showCart, setShowCart] = useState(false);

  const handleCloseCart = () => setShowCart(false);
  const handleShowCart = () => setShowCart(true);

  return (
    <div className="header-main bg-white border-bottom">
      <Container fluid>
        <Row className="align-items-center">
          {/* Logo */}
          <Col xs={12} md={3} lg={2} className="mb-3 mb-md-0">
            <Link to="/" className="d-block text-decoration-none">
              <div className="logo-wrapper d-flex align-items-center justify-content-center justify-content-md-start">
                <img
                  src="/logo.png"
                  alt="FKV Bếp Sạch Việt"
                  className="img-fluid logo-img"
                />
              </div>
            </Link>
          </Col>

          {/* Service Icons */}
          <Col xs={12} md={7} lg={8}>
            <Row className="g-2">
              <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                <div className="service-item d-flex align-items-center">
                  <div className="service-icon shipping-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#FFE8CC" />
                      <path
                        d="M12 18H20V24H12V18Z M22 18H28L30 22V24H22V18Z M11 24C11 25.1 11.9 26 13 26C14.1 26 15 25.1 15 24M25 24C25 25.1 25.9 26 27 26C28.1 26 29 25.1 29 24"
                        stroke="#FF8C00"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="service-text ms-2">
                    <div className="service-title">Miễn phí vận chuyển</div>
                    <div className="service-desc">
                      Bán kính 5 km khi mua từ 5kg
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                <div className="service-item d-flex align-items-center">
                  <div className="service-icon support-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#FFE0B2" />
                      <path
                        d="M20 12C16.13 12 13 15.13 13 19V24H17V19H15.5C15.5 16.24 17.74 14 20.5 14C23.26 14 25.5 16.24 25.5 19H24V24H28V19C28 15.13 24.87 12 21 12H20Z M18 26H22V28H18V26Z"
                        fill="#FF6F00"
                      />
                    </svg>
                  </div>
                  <div className="service-text ms-2">
                    <div className="service-title">Hỗ trợ 24/7</div>
                    <div className="service-desc">
                      Hotline: 0868839655 | 0963538357
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={4}>
                <div className="service-item d-flex align-items-center">
                  <div className="service-icon time-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#FFCDD2" />
                      <circle
                        cx="20"
                        cy="20"
                        r="8"
                        stroke="#E53935"
                        strokeWidth="2"
                      />
                      <path
                        d="M20 16V20L23 23"
                        stroke="#E53935"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="service-text ms-2">
                    <div className="service-title">Giờ làm việc</div>
                    <div className="service-desc">T2 - T7 Giờ hành chính</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>

          {/* Cart Button */}
          <Col xs={12} md={2} className="text-end mt-3 mt-md-0">
            <Button
              className="cart-btn position-relative"
              onClick={handleShowCart}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="white"
                className="me-2"
              >
                <path d="M6 16C4.9 16 4.01 16.9 4.01 18C4.01 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16ZM0 0V2H2L5.6 9.59L4.25 12.04C4.09 12.32 4 12.65 4 13C4 14.1 4.9 15 6 15H18V13H6.42C6.28 13 6.17 12.89 6.17 12.75L6.2 12.63L7.1 11H14.55C15.3 11 15.96 10.59 16.3 9.97L19.88 3.48C19.96 3.34 20 3.17 20 3C20 2.45 19.55 2 19 2H4.21L3.27 0H0ZM16 16C14.9 16 14.01 16.9 14.01 18C14.01 19.1 14.9 20 16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16Z" />
              </svg>
              Giỏ hàng
              {totalItems > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="cart-badge position-absolute"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Cart Offcanvas/Sidebar */}
      <Offcanvas show={showCart} onHide={handleCloseCart} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <i className="bi bi-cart3 me-2"></i>
            Giỏ hàng ({totalItems} sản phẩm)
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-5 flex-grow-1 d-flex flex-column justify-content-center">
              <i
                className="bi bi-cart-x text-muted"
                style={{ fontSize: "4rem" }}
              ></i>
              <p className="text-muted mt-3">Giỏ hàng của bạn đang trống</p>
              <Link
                to="/san-pham"
                className="btn btn-primary"
                onClick={handleCloseCart}
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items flex-grow-1 overflow-auto">
                {items.map((item) => (
                  <div
                    key={item.itemId || item.productId}
                    className="cart-item d-flex align-items-center border-bottom py-3"
                  >
                    <div className="cart-item-image me-3">
                      <CartItemImage src={item.imageSrc} alt={item.name} />
                    </div>
                    <div className="cart-item-details flex-grow-1">
                      <Link
                        to={`/san-pham/${item.productId}`}
                        className="text-decoration-none text-dark fw-semibold d-block mb-1"
                        onClick={handleCloseCart}
                      >
                        {item.name}
                      </Link>
                      <div className="text-primary fw-bold mb-2">
                        {formatPrice(item.price)}
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              updateItem(
                                item.itemId || item.productId,
                                item.quantity - 1,
                                item.stockQuantity
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span
                            className="btn btn-outline-secondary disabled"
                            style={{ minWidth: "40px" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              updateItem(
                                item.itemId || item.productId,
                                item.quantity + 1,
                                item.stockQuantity
                              )
                            }
                            disabled={
                              item.stockQuantity !== null &&
                              item.stockQuantity !== undefined &&
                              item.quantity >= item.stockQuantity
                            }
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link text-danger ms-auto p-0"
                          onClick={() =>
                            removeItem(item.itemId || item.productId)
                          }
                          title="Xóa sản phẩm"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer border-top pt-3 mt-auto">
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-semibold">Tạm tính:</span>
                  <span className="text-primary fw-bold fs-5">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="d-grid gap-2">
                  <Link
                    to="/thanh-toan"
                    className="btn btn-primary"
                    onClick={handleCloseCart}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Tiến hành thanh toán
                  </Link>
                  <Link
                    to="/san-pham"
                    className="btn btn-outline-secondary"
                    onClick={handleCloseCart}
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default Header;
