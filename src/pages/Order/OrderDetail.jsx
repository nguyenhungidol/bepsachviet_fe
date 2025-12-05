import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import { NavLink, useParams, Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  fetchOrderById,
  getOrderStatusInfo,
  getPaymentMethodInfo,
  formatOrderDate,
  formatPrice,
} from "../../services/orderService";
import "./OrderDetail.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/80x80?text=No+Image";
const POLLING_INTERVAL = 3000; // Poll every 3 seconds

const OrderDetail = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoMoSuccess, setShowMoMoSuccess] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef(null);

  // Check if returning from MoMo payment
  useEffect(() => {
    const pendingOrderId = sessionStorage.getItem("momo_pending_order");
    const resultCode = searchParams.get("resultCode");

    // If this is the order we're waiting for and MoMo returned success
    if (pendingOrderId === orderId && resultCode === "0") {
      // Show success message only once
      toast.success("Thanh toán MoMo thành công! Cảm ơn bạn đã mua sắm.");
      setShowMoMoSuccess(true);
      // Clear the pending order from session
      sessionStorage.removeItem("momo_pending_order");
    } else if (pendingOrderId === orderId && resultCode && resultCode !== "0") {
      // MoMo payment failed
      toast.error("Thanh toán MoMo không thành công. Vui lòng thử lại.");
      sessionStorage.removeItem("momo_pending_order");
    } else if (pendingOrderId === orderId) {
      // User returned without completing (closed MoMo page)
      sessionStorage.removeItem("momo_pending_order");
    }
  }, [orderId, searchParams]);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err.message || "Không thể tải thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Poll for order status updates when waiting for MoMo payment
  useEffect(() => {
    const shouldPoll =
      order?.status === "PENDING" && order?.paymentMethod === "MOMO";

    if (shouldPoll && !isPolling) {
      setIsPolling(true);

      const poll = async () => {
        try {
          const updatedOrder = await fetchOrderById(orderId);

          // Check if status changed from PENDING
          if (updatedOrder.status !== "PENDING") {
            setOrder(updatedOrder);
            setIsPolling(false);

            if (
              updatedOrder.status === "CONFIRMED" ||
              updatedOrder.status === "SHIPPING" ||
              updatedOrder.status === "DELIVERED"
            ) {
              if (!showMoMoSuccess) {
                toast.success(
                  "Thanh toán thành công! Đơn hàng đã được xác nhận."
                );
                setShowMoMoSuccess(true);
              }
            }
            return; // Stop polling
          }

          // Continue polling
          pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
        } catch (err) {
          console.error("Polling error:", err);
          // Continue polling even on error
          pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
        }
      };

      // Start polling after initial delay
      pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
    }

    // Cleanup polling on unmount or when order changes
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [
    order?.status,
    order?.paymentMethod,
    orderId,
    isPolling,
    showMoMoSuccess,
  ]);

  if (loading) {
    return (
      <div className="order-detail-page bg-light">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Đang tải thông tin đơn hàng...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page bg-light">
        <Container className="py-5 text-center">
          <i
            className="bi bi-exclamation-triangle text-danger"
            style={{ fontSize: "3rem" }}
          ></i>
          <h4 className="mt-3 text-danger">Lỗi</h4>
          <p className="text-muted">{error}</p>
          <Link to="/tai-khoan" className="btn btn-success">
            Quay lại tài khoản
          </Link>
        </Container>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page bg-light">
        <Container className="py-5 text-center">
          <i
            className="bi bi-inbox text-muted"
            style={{ fontSize: "3rem" }}
          ></i>
          <h4 className="mt-3">Không tìm thấy đơn hàng</h4>
          <Link to="/tai-khoan" className="btn btn-success mt-3">
            Quay lại tài khoản
          </Link>
        </Container>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);
  const paymentInfo = getPaymentMethodInfo(order.paymentMethod);
  const orderItems = order.orderItems || order.items || [];

  return (
    <div className="order-detail-page bg-light">
      {/* Breadcrumb */}
      <div className="page-header-top bg-gray-100 py-3 mb-4">
        <Container>
          <nav className="breadcrumb text-sm text-muted mb-0">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ
            </NavLink>
            <span className="mx-2">/</span>
            <NavLink
              to="/tai-khoan"
              className="text-muted text-decoration-none"
            >
              Tài khoản
            </NavLink>
            <span className="mx-2">/</span>
            <span className="fw-bold text-dark">Đơn hàng #{orderId}</span>
          </nav>
        </Container>
      </div>

      <Container className="order-detail-container pb-5">
        {/* Success Message for MoMo payment */}
        {showMoMoSuccess && (
          <div className="alert alert-success mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Thanh toán thành công!</strong> Đơn hàng của bạn đã được xác
            nhận. Cảm ơn bạn đã mua sắm tại Bếp Sạch Việt.
          </div>
        )}

        {/* Success Message for COD orders */}
        {!showMoMoSuccess &&
          order.status === "PENDING" &&
          order.paymentMethod === "CASH_ON_DELIVERY" && (
            <div className="alert alert-success mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Đặt hàng thành công!</strong> Cảm ơn bạn đã mua sắm tại
              Bếp Sạch Việt. Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng.
            </div>
          )}

        {/* Pending MoMo payment message */}
        {!showMoMoSuccess &&
          order.status === "PENDING" &&
          order.paymentMethod === "MOMO" && (
            <div className="alert alert-warning mb-4 d-flex align-items-center">
              <Spinner
                animation="border"
                size="sm"
                variant="warning"
                className="me-3"
              />
              <div>
                <strong>Đang chờ thanh toán MoMo...</strong>
                <br />
                <small>
                  Vui lòng hoàn tất thanh toán trong tab mới. Trang sẽ tự động
                  cập nhật khi thanh toán thành công.
                </small>
              </div>
            </div>
          )}

        <Row className="g-4">
          {/* Order Info */}
          <Col lg={8}>
            {/* Order Status Card */}
            <Card className="order-card mb-4">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">
                    Đơn hàng #{order.orderId || order.id}
                  </h5>
                  <small className="text-muted">
                    Đặt lúc:{" "}
                    {formatOrderDate(order.createdAt || order.orderDate)}
                  </small>
                </div>
                <Badge bg={statusInfo.color} className="status-badge">
                  <i className={`bi ${statusInfo.icon} me-1`}></i>
                  {statusInfo.label}
                </Badge>
              </Card.Header>
            </Card>

            {/* Order Items */}
            <Card className="order-card mb-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">
                  <i className="bi bi-box me-2"></i>
                  Sản phẩm đã đặt ({orderItems.length})
                </h6>
              </Card.Header>
              <Card.Body className="p-0">
                {orderItems.map((item, index) => (
                  <div key={item.id || index} className="order-item">
                    <img
                      src={
                        item.productImageSrc ||
                        item.productImage ||
                        item.imageSrc ||
                        item.imageUrl ||
                        item.image ||
                        item.product?.imageSrc ||
                        item.product?.imageUrl ||
                        FALLBACK_IMAGE
                      }
                      alt={item.productName || item.name}
                      className="order-item-image"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="order-item-info">
                      <Link
                        to={`/san-pham/${item.productId}`}
                        className="order-item-name text-decoration-none"
                      >
                        {item.productName || item.name}
                      </Link>
                      <p className="order-item-price mb-0">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="order-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Order Note */}
            {order.note && (
              <Card className="order-card mb-4">
                <Card.Header className="bg-white">
                  <h6 className="mb-0">
                    <i className="bi bi-chat-left-text me-2"></i>
                    Ghi chú
                  </h6>
                </Card.Header>
                <Card.Body>
                  <p className="mb-0 text-muted">{order.note}</p>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Order Summary Sidebar */}
          <Col lg={4}>
            {/* Shipping Info */}
            <Card className="order-card mb-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Thông tin giao hàng
                </h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>{order.deliveryName}</strong>
                </p>
                <p className="mb-2">
                  <i className="bi bi-telephone me-2 text-muted"></i>
                  {order.deliveryPhone}
                </p>
                <p className="mb-0">
                  <i className="bi bi-geo-alt me-2 text-muted"></i>
                  {order.deliveryAddress}
                </p>
              </Card.Body>
            </Card>

            {/* Payment Info */}
            <Card className="order-card mb-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">
                  <i className="bi bi-credit-card me-2"></i>
                  Thanh toán
                </h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">
                  <i className={`bi ${paymentInfo.icon} me-2 text-muted`}></i>
                  {paymentInfo.label}
                </p>
              </Card.Body>
            </Card>

            {/* Order Total */}
            <Card className="order-card order-total-card">
              <Card.Body>
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>
                    {formatPrice(order.subtotal || order.totalAmount)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span className="text-success">
                    {order.shippingFee
                      ? formatPrice(order.shippingFee)
                      : "Miễn phí"}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="summary-row">
                    <span>Giảm giá:</span>
                    <span className="text-danger">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <hr />
                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span className="total-price">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </Card.Body>
            </Card>

            {/* Actions */}
            <div className="d-grid gap-2 mt-4">
              <Link to="/tai-khoan" className="btn btn-outline-success">
                <i className="bi bi-arrow-left me-2"></i>
                Quay lại tài khoản
              </Link>
              <Link to="/san-pham" className="btn btn-success">
                <i className="bi bi-cart me-2"></i>
                Tiếp tục mua sắm
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderDetail;
