import { useCallback, useEffect, useState } from "react";
import { Badge, Modal, Button, Form, Spinner, Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import {
  fetchAdminOrders,
  fetchAdminOrderById,
  updateOrderStatus,
  ORDER_STATUSES,
  getOrderStatusInfo,
  getPaymentMethodInfo,
  formatOrderDate,
  formatPrice,
} from "../../services/orderService";

const FALLBACK_IMAGE = "https://via.placeholder.com/50x50?text=No+Image";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Input value
  const [appliedSearch, setAppliedSearch] = useState(""); // Committed search value

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      // If searching by order ID, use the specific endpoint
      if (appliedSearch) {
        try {
          const order = await fetchAdminOrderById(appliedSearch.trim());
          // If status filter is set, check if order matches
          if (statusFilter && order.status !== statusFilter) {
            setOrders([]);
            setPagination((prev) => ({
              ...prev,
              totalPages: 0,
              totalElements: 0,
            }));
          } else {
            setOrders([order]);
            setPagination((prev) => ({
              ...prev,
              totalPages: 1,
              totalElements: 1,
            }));
          }
        } catch {
          // Order not found
          setOrders([]);
          setPagination((prev) => ({
            ...prev,
            totalPages: 0,
            totalElements: 0,
          }));
        }
      } else {
        // Load all orders with pagination
        const response = await fetchAdminOrders({
          page: pagination.page,
          size: pagination.size,
          status: statusFilter || undefined,
        });

        // Handle paginated response
        const content = response.content || response.orders || response;
        setOrders(Array.isArray(content) ? content : []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.totalPages || 1,
          totalElements: response.totalElements || content.length,
        }));
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Không thể tải danh sách đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, appliedSearch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleViewDetail = async (orderId) => {
    setLoadingDetail(true);
    setShowDetailModal(true);

    try {
      const order = await fetchAdminOrderById(orderId);
      setSelectedOrder(order);
    } catch (error) {
      console.error("Failed to load order detail:", error);
      toast.error("Không thể tải chi tiết đơn hàng.");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công!");

      // Refresh orders list
      await loadOrders();

      // Update selected order if viewing detail
      if (
        selectedOrder &&
        (selectedOrder.orderId || selectedOrder.id) === orderId
      ) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.message || "Không thể cập nhật trạng thái.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Commit the search query and reset to first page
    setAppliedSearch(searchQuery);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const resetFilters = () => {
    setStatusFilter("");
    setSearchQuery("");
    setAppliedSearch("");
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <section className="admin-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Quản lý đơn hàng</h2>
          <p className="mb-0 text-muted">
            Xem và cập nhật trạng thái đơn hàng của khách hàng.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadOrders}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">
                  <i className="bi bi-search me-1"></i>
                  Tìm theo mã đơn hàng
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <small className="text-muted">
                  Nhập chính xác mã đơn hàng để tìm kiếm
                </small>
              </div>
              <div className="col-md-3">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 0 }));
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-success w-100">
                  <i className="bi bi-search me-1"></i>
                  Tìm kiếm
                </button>
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={resetFilters}
                  disabled={!appliedSearch && !statusFilter}
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </form>

          {/* Active filters indicator */}
          {(appliedSearch || statusFilter) && (
            <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
              <span className="text-muted">Đang lọc:</span>
              {appliedSearch && (
                <Badge bg="info" className="d-flex align-items-center gap-1">
                  <i className="bi bi-search"></i>
                  &quot;{appliedSearch}&quot;
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => {
                      setSearchQuery("");
                      setAppliedSearch("");
                    }}
                    aria-label="Xóa tìm kiếm"
                  ></button>
                </Badge>
              )}
              {statusFilter && (
                <Badge
                  bg="secondary"
                  className="d-flex align-items-center gap-1"
                >
                  <i className="bi bi-funnel"></i>
                  {ORDER_STATUSES[statusFilter]?.label || statusFilter}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => setStatusFilter("")}
                    aria-label="Xóa trạng thái"
                  ></button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-empty-state text-center py-5">
          <i
            className="bi bi-inbox"
            style={{ fontSize: "3rem", color: "#ccc" }}
          ></i>
          {appliedSearch || statusFilter ? (
            <>
              <p className="mt-3 text-muted">
                Không tìm thấy đơn hàng phù hợp với bộ lọc.
              </p>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={resetFilters}
              >
                Xóa bộ lọc
              </button>
            </>
          ) : (
            <p className="mt-3 text-muted">Chưa có đơn hàng nào.</p>
          )}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Ngày đặt</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderId = order.orderId || order.id;
                  const statusInfo = getOrderStatusInfo(order.status);
                  const paymentInfo = getPaymentMethodInfo(order.paymentMethod);

                  return (
                    <tr key={orderId}>
                      <td>
                        <strong className="text-primary">#{orderId}</strong>
                      </td>
                      <td>
                        <div>
                          <p className="mb-0 fw-semibold">
                            {order.deliveryName}
                          </p>
                          <small className="text-muted">
                            {order.deliveryPhone}
                          </small>
                        </div>
                      </td>
                      <td className="fw-semibold text-success">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td>
                        <Badge bg={statusInfo.color}>
                          <i className={`bi ${statusInfo.icon} me-1`}></i>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          <i className={`bi ${paymentInfo.icon} me-1`}></i>
                          {order.paymentMethod}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatOrderDate(order.createdAt || order.orderDate)}
                        </small>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleViewDetail(orderId)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <Dropdown as="span">
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            disabled={updatingStatus}
                          >
                            Cập nhật
                          </Dropdown.Toggle>
                          <Dropdown.Menu
                            align="start"
                            style={{ minWidth: "180px" }}
                          >
                            {Object.entries(ORDER_STATUSES).map(
                              ([key, { label, icon }]) => (
                                <Dropdown.Item
                                  key={key}
                                  active={order.status === key}
                                  disabled={
                                    order.status === key || updatingStatus
                                  }
                                  onClick={() =>
                                    handleStatusChange(orderId, key)
                                  }
                                >
                                  <i className={`bi ${icon} me-2`}></i>
                                  {label}
                                </Dropdown.Item>
                              )
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <p className="text-muted mb-0">
                Hiển thị {orders.length} / {pagination.totalElements} đơn hàng
              </p>
              <nav>
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      pagination.page === 0 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Trước
                    </button>
                  </li>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${
                        pagination.page === index ? "active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => handlePageChange(index)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      pagination.page >= pagination.totalPages - 1
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết đơn hàng #{selectedOrder?.orderId || selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
            </div>
          ) : selectedOrder ? (
            <div className="order-detail-content">
              {/* Status */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <p className="text-muted mb-1">Trạng thái</p>
                  <Badge
                    bg={getOrderStatusInfo(selectedOrder.status).color}
                    className="fs-6"
                  >
                    <i
                      className={`bi ${
                        getOrderStatusInfo(selectedOrder.status).icon
                      } me-1`}
                    ></i>
                    {getOrderStatusInfo(selectedOrder.status).label}
                  </Badge>
                </div>
                <div className="text-end">
                  <p className="text-muted mb-1">Ngày đặt</p>
                  <p className="mb-0 fw-semibold">
                    {formatOrderDate(
                      selectedOrder.createdAt || selectedOrder.orderDate
                    )}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="card mb-3">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-person me-2"></i>
                    Thông tin khách hàng
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Người nhận:</strong>{" "}
                        {selectedOrder.deliveryName}
                      </p>
                      <p className="mb-1">
                        <strong>Điện thoại:</strong>{" "}
                        {selectedOrder.deliveryPhone}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Địa chỉ:</strong>{" "}
                        {selectedOrder.deliveryAddress}
                      </p>
                      <p className="mb-0">
                        <strong>Thanh toán:</strong>{" "}
                        {
                          getPaymentMethodInfo(selectedOrder.paymentMethod)
                            .label
                        }
                      </p>
                    </div>
                  </div>
                  {selectedOrder.note && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted">
                        <i className="bi bi-chat-left-text me-1"></i>
                        Ghi chú: {selectedOrder.note}
                      </small>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="card mb-3">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-box me-2"></i>
                    Sản phẩm
                  </h6>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center">SL</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        selectedOrder.orderItems ||
                        selectedOrder.items ||
                        []
                      ).map((item, index) => (
                        <tr key={item.id || index}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
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
                                width="40"
                                height="40"
                                className="rounded"
                                style={{ objectFit: "cover" }}
                              />
                              <span>{item.productName || item.name}</span>
                            </div>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">
                            {formatPrice(item.price)}
                          </td>
                          <td className="text-end fw-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>Tổng cộng:</strong>
                        </td>
                        <td className="text-end">
                          <strong className="text-success fs-5">
                            {formatPrice(selectedOrder.totalAmount)}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Quick Status Update */}
              <div className="card">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Cập nhật trạng thái
                  </h6>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    {Object.entries(ORDER_STATUSES).map(
                      ([key, { label, color, icon }]) => (
                        <Button
                          key={key}
                          variant={
                            selectedOrder.status === key
                              ? color
                              : `outline-${color}`
                          }
                          size="sm"
                          onClick={() =>
                            handleStatusChange(
                              selectedOrder.orderId || selectedOrder.id,
                              key
                            )
                          }
                          disabled={
                            selectedOrder.status === key || updatingStatus
                          }
                        >
                          <i className={`bi ${icon} me-1`}></i>
                          {label}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default AdminOrders;
