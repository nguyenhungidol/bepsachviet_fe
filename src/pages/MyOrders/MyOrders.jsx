import "./MyOrders.css";
import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { getStoredUser, AUTH_STATE_EVENT } from "../../services/userService";
import {
  fetchMyOrders,
  getOrderStatusInfo,
  formatOrderDate,
  formatPrice,
} from "../../services/orderService";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      navigate("/dang-nhap", {
        replace: true,
        state: { from: "/don-hang-cua-toi" },
      });
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  // Load orders
  const loadOrders = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const response = await fetchMyOrders({ page, size: 10 });
      console.log("My Orders API response:", response);

      // Handle different response structures
      const ordersData = response.content || response.data || response || [];
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];

      setOrders(ordersArray);
      setPagination({
        page: response.number ?? response.page ?? 0,
        totalPages:
          response.totalPages ??
          Math.ceil((response.totalElements || ordersArray.length) / 10) ??
          0,
        totalElements: response.totalElements ?? ordersArray.length ?? 0,
      });
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const user = getStoredUser();
      if (!user) {
        setIsAuthenticated(false);
        navigate("/dang-nhap", { replace: true });
      } else {
        setIsAuthenticated(true);
        loadOrders();
      }
    };

    window.addEventListener(AUTH_STATE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_STATE_EVENT, handleAuthChange);
  }, [navigate, loadOrders]);

  return (
    <div className="my-orders-page">
      <div className="page-header-top bg-gray-100 py-3">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ&nbsp;
            </NavLink>{" "}
            /&nbsp;{" "}
            <NavLink
              to="/tai-khoan"
              className="text-muted text-decoration-none"
            >
              Tài khoản&nbsp;
            </NavLink>{" "}
            /&nbsp; <span className="fw-bold">Đơn hàng của tôi</span>
          </div>
        </Container>
      </div>

      <div className="my-orders-container py-5">
        <Container>
          <Row>
            <Col xs={12}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <i className="bi bi-bag-check me-2"></i>
                    Đơn hàng của tôi
                  </h4>
                  {pagination.totalElements > 0 && (
                    <Badge bg="success" pill className="fs-6">
                      {pagination.totalElements} đơn hàng
                    </Badge>
                  )}
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="success" />
                      <p className="mt-3 text-muted">Đang tải đơn hàng...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-bag-x display-1 text-muted"></i>
                      <h5 className="mt-3 text-muted">
                        Bạn chưa có đơn hàng nào
                      </h5>
                      <p className="text-muted">
                        Hãy khám phá các sản phẩm của chúng tôi!
                      </p>
                      <Button
                        variant="success"
                        size="lg"
                        onClick={() => navigate("/san-pham")}
                      >
                        <i className="bi bi-cart-plus me-2"></i>
                        Mua sắm ngay
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="orders-list">
                        {orders.map((order) => {
                          const statusInfo = getOrderStatusInfo(order.status);
                          return (
                            <div
                              key={order.orderId}
                              className="order-card"
                              onClick={() => navigate(`/don-hang/${order.orderId}`)}
                            >
                              <div className="order-card-header">
                                <div className="order-meta">
                                  <span className="order-id">
                                    Mã đơn: #
                                    {order.orderId?.slice(0, 8).toUpperCase() ||
                                      "N/A"}
                                  </span>
                                  <span className="order-date">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    {formatOrderDate(order.createdAt)}
                                  </span>
                                </div>
                                <Badge
                                  bg={statusInfo.color}
                                  className="order-status"
                                >
                                  <i className={`${statusInfo.icon} me-1`}></i>
                                  {statusInfo.label}
                                </Badge>
                              </div>

                              <div className="order-card-body">
                                <div className="order-products">
                                  {order.items && order.items.length > 0 ? (
                                    <div className="products-info">
                                      <div className="products-images">
                                        {order.items
                                          .slice(0, 3)
                                          .map((item, idx) => (
                                            <div
                                              key={idx}
                                              className="product-thumb"
                                            >
                                              <img
                                                src={
                                                  item.productImage ||
                                                  item.productImageSrc ||
                                                  "/placeholder.png"
                                                }
                                                alt={item.productName}
                                                onError={(e) => {
                                                  e.target.src =
                                                    "/placeholder.png";
                                                }}
                                              />
                                            </div>
                                          ))}
                                        {order.items.length > 3 && (
                                          <div className="product-thumb more">
                                            +{order.items.length - 3}
                                          </div>
                                        )}
                                      </div>
                                      <div className="products-text">
                                        <span className="products-count">
                                          {order.items.length} sản phẩm
                                        </span>
                                        <span className="products-names">
                                          {order.items
                                            .slice(0, 2)
                                            .map((item) => item.productName)
                                            .join(", ")}
                                          {order.items.length > 2 && "..."}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted">
                                      Không có sản phẩm
                                    </span>
                                  )}
                                </div>

                                <div className="order-summary">
                                  <div className="order-total">
                                    <span className="total-label">
                                      Tổng tiền:
                                    </span>
                                    <span className="total-value">
                                      {formatPrice(order.totalAmount)}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="view-detail-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/don-hang/${order.orderId}`);
                                    }}
                                  >
                                    Xem chi tiết
                                    <i className="bi bi-chevron-right ms-1"></i>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="orders-pagination mt-4">
                          <Button
                            variant="outline-secondary"
                            disabled={pagination.page === 0}
                            onClick={() => loadOrders(pagination.page - 1)}
                          >
                            <i className="bi bi-chevron-left me-1"></i>
                            Trang trước
                          </Button>
                          <span className="page-info">
                            Trang {pagination.page + 1} /{" "}
                            {pagination.totalPages}
                          </span>
                          <Button
                            variant="outline-secondary"
                            disabled={
                              pagination.page >= pagination.totalPages - 1
                            }
                            onClick={() => loadOrders(pagination.page + 1)}
                          >
                            Trang sau
                            <i className="bi bi-chevron-right ms-1"></i>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default MyOrders;
