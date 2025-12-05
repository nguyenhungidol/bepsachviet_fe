import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder, PAYMENT_METHODS } from "../../services/orderService";
import { createMoMoPayment } from "../../services/paymentService";
import { getStoredUser } from "../../services/userService";
import "./Checkout.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/80x80?text=No+Image";

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, totalPrice, formatPrice, clearAllItems, refreshCart } =
    useCart();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deliveryName: "",
    deliveryPhone: "",
    deliveryAddress: "",
    note: "",
    paymentMethod: "CASH_ON_DELIVERY",
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form with user info
  useEffect(() => {
    if (isAuthenticated) {
      const user = getStoredUser();
      if (user) {
        setForm((prev) => ({
          ...prev,
          deliveryName: prev.deliveryName || user.name || "",
          deliveryPhone:
            prev.deliveryPhone || user.phoneNumber || user.phone || "",
          deliveryAddress: prev.deliveryAddress || user.address || "",
        }));
      }
    }
  }, [isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/san-pham", { replace: true });
    }
  }, [items, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để đặt hàng.");
      navigate("/dang-nhap", { state: { from: "/thanh-toan" } });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!form.deliveryName.trim()) {
      newErrors.deliveryName = "Vui lòng nhập họ tên người nhận";
    }

    if (!form.deliveryPhone.trim()) {
      newErrors.deliveryPhone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(form.deliveryPhone.trim())) {
      newErrors.deliveryPhone = "Số điện thoại không hợp lệ";
    }

    if (!form.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Vui lòng nhập địa chỉ giao hàng";
    }

    return newErrors;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // Map to backend field names (CreateOrderRequest)
      const orderData = {
        deliveryName: form.deliveryName.trim(),
        deliveryPhone: form.deliveryPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        notes: form.note.trim() || null,
        paymentMethod: form.paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      console.log("Creating order with data:", orderData);
      const response = await createOrder(orderData);
      const orderId = response?.orderId || response?.id;

      // Handle MoMo payment
      if (form.paymentMethod === "MOMO" && orderId) {
        try {
          // Clear cart before opening MoMo
          await clearAllItems();

          // Create MoMo payment
          const paymentResponse = await createMoMoPayment(orderId);
          console.log("MoMo payment response:", paymentResponse);

          if (paymentResponse?.payUrl) {
            // Store orderId in sessionStorage for return handling
            sessionStorage.setItem("momo_pending_order", orderId);

            // Open MoMo payment page in new tab
            window.open(paymentResponse.payUrl, "_blank");

            // Navigate to order page to wait for payment
            toast.info("Vui lòng hoàn tất thanh toán MoMo trong tab mới.");
            navigate(`/don-hang/${orderId}`, { replace: true });
          } else {
            throw new Error("Không nhận được link thanh toán MoMo");
          }
        } catch (momoError) {
          console.error("MoMo payment error:", momoError);
          toast.error(
            momoError.message ||
              "Không thể tạo thanh toán MoMo. Vui lòng thử lại."
          );
          // Order created but MoMo failed - redirect to order page
          navigate(`/don-hang/${orderId}`, { replace: true });
        }
      } else {
        // COD payment - clear cart and redirect
        await clearAllItems();
        toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");

        if (orderId) {
          navigate(`/don-hang/${orderId}`, { replace: true });
        } else {
          navigate("/tai-khoan", { replace: true });
        }
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      console.error("Error details:", error.data, error.status);
      toast.error(error.message || "Không thể đặt hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !items || items.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page bg-light">
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
            <span className="fw-bold text-dark">Thanh toán</span>
          </nav>
        </Container>
      </div>

      <Container className="checkout-container pb-5">
        <h1 className="checkout-title mb-4">Thanh toán đơn hàng</h1>

        <Row className="g-4">
          {/* Shipping Information Form */}
          <Col lg={7}>
            <Card className="checkout-card">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Thông tin giao hàng
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên người nhận *</Form.Label>
                    <Form.Control
                      type="text"
                      name="deliveryName"
                      value={form.deliveryName}
                      onChange={handleChange}
                      placeholder="Nhập họ tên người nhận"
                      isInvalid={!!errors.deliveryName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.deliveryName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="deliveryPhone"
                      value={form.deliveryPhone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      isInvalid={!!errors.deliveryPhone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.deliveryPhone}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ giao hàng *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="deliveryAddress"
                      value={form.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      isInvalid={!!errors.deliveryAddress}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.deliveryAddress}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú đơn hàng</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                    />
                  </Form.Group>

                  <hr className="my-4" />

                  <h6 className="mb-3">
                    <i className="bi bi-credit-card me-2"></i>
                    Phương thức thanh toán
                  </h6>

                  {Object.entries(PAYMENT_METHODS).map(
                    ([key, { label, icon }]) => (
                      <Form.Check
                        key={key}
                        type="radio"
                        id={`payment-${key}`}
                        name="paymentMethod"
                        value={key}
                        checked={form.paymentMethod === key}
                        onChange={handleChange}
                        label={
                          <span>
                            <i className={`bi ${icon} me-2`}></i>
                            {label}
                          </span>
                        }
                        className="mb-2 payment-option"
                      />
                    )
                  )}

                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="w-100 mt-4 checkout-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Đang xử lý...
                      </>
                    ) : form.paymentMethod === "MOMO" ? (
                      <>
                        <i className="bi bi-wallet2 me-2"></i>
                        Thanh toán MoMo ({formatPrice(totalPrice)})
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Đặt hàng ({formatPrice(totalPrice)})
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={5}>
            <Card
              className="checkout-card order-summary-card sticky-top"
              style={{ top: "20px" }}
            >
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-cart3 me-2"></i>
                  Đơn hàng của bạn ({items.length} sản phẩm)
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="order-items">
                  {items.map((item) => (
                    <div
                      key={item.itemId || item.productId}
                      className="order-item"
                    >
                      <img
                        src={item.imageSrc || FALLBACK_IMAGE}
                        alt={item.name}
                        className="order-item-image"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-price">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="order-item-total">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-summary-footer">
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span className="text-success">Miễn phí</span>
                  </div>
                  <hr />
                  <div className="summary-row total">
                    <span>Tổng cộng:</span>
                    <span className="total-price">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Checkout;
