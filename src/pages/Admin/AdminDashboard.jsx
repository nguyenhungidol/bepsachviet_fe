import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  fetchAdminProducts,
  fetchAdminUsers,
  fetchAdminCategories,
} from "../../services/adminService";
import { fetchAdminOrders, ORDER_STATUSES } from "../../services/orderService";
import "./AdminDashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} tỷ`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} tr`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toLocaleString("vi-VN");
};

const formatFullCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Load real data from API
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, usersData, ordersData, categoriesData] =
        await Promise.all([
          fetchAdminProducts().catch(() => []),
          fetchAdminUsers().catch(() => []),
          fetchAdminOrders({ size: 100 }).catch(() => ({ content: [] })),
          fetchAdminCategories().catch(() => []),
        ]);

      const normalizedProducts = Array.isArray(productsData)
        ? productsData
        : productsData?.content || [];
      const normalizedUsers = Array.isArray(usersData)
        ? usersData
        : usersData?.content || [];
      const normalizedOrders = Array.isArray(ordersData)
        ? ordersData
        : ordersData?.content || [];
      const normalizedCategories = Array.isArray(categoriesData)
        ? categoriesData
        : categoriesData?.content || [];

      setProducts(normalizedProducts);
      setOrders(normalizedOrders);
      setCategories(normalizedCategories);
      setRecentOrders(normalizedOrders.slice(0, 5));

      // Calculate stats from real data
      const lowStockCount = normalizedProducts.filter(
        (p) =>
          (p.stockQuantity !== undefined && p.stockQuantity <= 5) ||
          p.stock === 0 ||
          p.quantity === 0 ||
          p.outOfStock === true
      ).length;

      // Calculate revenue from orders
      const totalRevenue = normalizedOrders.reduce((sum, order) => {
        if (order.status !== "CANCELED") {
          return sum + (order.totalAmount || order.total || 0);
        }
        return sum;
      }, 0);

      setStats({
        totalRevenue,
        totalOrders: normalizedOrders.length,
        totalCustomers: normalizedUsers.length,
        totalProducts: normalizedProducts.length,
        lowStockCount,
      });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Calculate order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts = {
      DELIVERED: 0,
      SHIPPING: 0,
      CONFIRMED: 0,
      PENDING: 0,
      CANCELED: 0,
    };

    orders.forEach((order) => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });

    const total = orders.length || 1;
    return {
      labels: ["Đã giao", "Đang giao", "Đã xác nhận", "Chờ xác nhận", "Đã hủy"],
      datasets: [
        {
          data: [
            Math.round((statusCounts.DELIVERED / total) * 100),
            Math.round((statusCounts.SHIPPING / total) * 100),
            Math.round((statusCounts.CONFIRMED / total) * 100),
            Math.round((statusCounts.PENDING / total) * 100),
            Math.round((statusCounts.CANCELED / total) * 100),
          ],
          backgroundColor: [
            "#10b981",
            "#3b82f6",
            "#06b6d4",
            "#f59e0b",
            "#ef4444",
          ],
          borderColor: ["#fff", "#fff", "#fff", "#fff", "#fff"],
          borderWidth: 3,
          hoverOffset: 4,
        },
      ],
    };
  }, [orders]);

  // Revenue by day (last 7 days)
  const revenueData = useMemo(() => {
    const days = [];
    const revenues = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split("T")[0];
      days.push(
        date.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" })
      );

      const dayRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return (
            orderDate.toISOString().split("T")[0] === dayKey &&
            order.status !== "CANCELED"
          );
        })
        .reduce(
          (sum, order) => sum + (order.totalAmount || order.total || 0),
          0
        );

      revenues.push(dayRevenue);
    }

    return {
      labels: days,
      datasets: [
        {
          label: "Doanh thu",
          data: revenues,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [orders]);

  // Products by category
  const categoryData = useMemo(() => {
    const categoryCounts = {};

    products.forEach((product) => {
      const catName =
        product.category?.name ||
        categories.find(
          (c) =>
            c.categoryId === product.categoryId || c.id === product.categoryId
        )?.name ||
        "Chưa phân loại";
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      labels: sortedCategories.map(([name]) => name),
      datasets: [
        {
          label: "Số sản phẩm",
          data: sortedCategories.map(([, count]) => count),
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
            "#ef4444",
            "#06b6d4",
          ],
          borderRadius: 6,
        },
      ],
    };
  }, [products, categories]);

  // Get low stock products
  const lowStockProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.stockQuantity !== undefined &&
          p.stockQuantity <= 10 &&
          p.stockQuantity >= 0
      )
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 5);
  }, [products]);

  // Chart options
  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${formatFullCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          callback: (value) => formatCurrency(value),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Tổng quan</h2>
          <p className="text-muted mb-0">
            Xin chào! Đây là tình hình kinh doanh hôm nay.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadDashboardData}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Tổng doanh thu</p>
            <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
            <p className="stat-change neutral">
              <i className="bi bi-graph-up"></i>
              <span>Từ tất cả đơn hàng</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="bi bi-bag-check"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Tổng đơn hàng</p>
            <p className="stat-value">{stats.totalOrders}</p>
            <p className="stat-change neutral">
              <i className="bi bi-box"></i>
              <span>Trong hệ thống</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Tổng khách hàng</p>
            <p className="stat-value">{stats.totalCustomers}</p>
            <p className="stat-change neutral">
              <i className="bi bi-person-check"></i>
              <span>Đã đăng ký</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Sản phẩm</p>
            <p className="stat-value">{stats.totalProducts}</p>
            <p className="stat-change warning">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{stats.lowStockCount} sắp hết hàng</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Doanh thu 7 ngày gần đây</h3>
          </div>
          <div className="chart-container">
            <Line data={revenueData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Trạng thái đơn hàng</h3>
          </div>
          <div className="chart-container pie">
            <Pie data={orderStatusData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Middle Section - Category Chart & Low Stock */}
      <div className="charts-grid mt-4">
        {/* Products by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Sản phẩm theo danh mục</h3>
          </div>
          <div className="chart-container">
            <Bar data={categoryData} options={barChartOptions} />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <i className="bi bi-exclamation-triangle text-warning me-2"></i>
              Sản phẩm sắp hết hàng
            </h3>
            <a
              href="/admin/products"
              className="btn btn-sm btn-outline-warning"
            >
              Quản lý kho
            </a>
          </div>
          <ul className="product-rank-list">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <li
                  key={product.productId || product.id}
                  className="product-rank-item"
                >
                  <img
                    src={
                      product.imageSrc ||
                      product.imageUrl ||
                      "https://via.placeholder.com/100"
                    }
                    alt={product.name}
                    className="product-rank-image"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/100?text=No+Image";
                    }}
                  />
                  <div className="product-rank-info">
                    <p className="product-rank-name">{product.name}</p>
                    <p className="product-rank-category">
                      {product.category?.name || "Chưa phân loại"}
                    </p>
                  </div>
                  <div className="product-rank-stats">
                    <span
                      className={`badge ${
                        product.stockQuantity === 0
                          ? "bg-danger"
                          : product.stockQuantity <= 5
                          ? "bg-warning"
                          : "bg-info"
                      }`}
                    >
                      Còn {product.stockQuantity}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center text-muted py-4">
                <i className="bi bi-check-circle text-success fs-4 d-block mb-2"></i>
                Tất cả sản phẩm đều còn hàng
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="top-products-section mt-4">
        {/* Recent Orders */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Đơn hàng gần đây</h3>
            <a href="/admin/orders" className="btn btn-sm btn-outline-primary">
              Xem tất cả
            </a>
          </div>
          <ul className="activity-list">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusInfo = ORDER_STATUSES[order.status] || {
                  label: order.status,
                  color: "secondary",
                  icon: "bi-question-circle",
                };
                return (
                  <li key={order.orderId || order.id} className="activity-item">
                    <div className={`activity-icon order`}>
                      <i className={`bi ${statusInfo.icon}`}></i>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>#{order.orderId || order.id}</strong> -{" "}
                        {order.deliveryName ||
                          order.customerName ||
                          "Khách hàng"}
                        <span
                          className={`badge bg-${statusInfo.color} ms-2`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {statusInfo.label}
                        </span>
                      </p>
                      <p className="activity-time">
                        {formatFullCurrency(
                          order.totalAmount || order.total || 0
                        )}{" "}
                        •{" "}
                        {formatRelativeTime(order.createdAt || order.orderDate)}
                      </p>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="text-center text-muted py-4">
                Chưa có đơn hàng nào
              </li>
            )}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Thao tác nhanh</h3>
          </div>
          <div className="quick-actions">
            <a href="/admin/products" className="quick-action-btn">
              <i className="bi bi-plus-circle"></i>
              <span>Thêm sản phẩm</span>
            </a>
            <a href="/admin/orders" className="quick-action-btn">
              <i className="bi bi-bag-check"></i>
              <span>Quản lý đơn hàng</span>
            </a>
            <a href="/admin/categories" className="quick-action-btn">
              <i className="bi bi-folder-plus"></i>
              <span>Quản lý danh mục</span>
            </a>
            <a href="/admin/users" className="quick-action-btn">
              <i className="bi bi-people"></i>
              <span>Quản lý người dùng</span>
            </a>
            <a href="/admin/posts" className="quick-action-btn">
              <i className="bi bi-newspaper"></i>
              <span>Quản lý bài viết</span>
            </a>
            <a href="/admin/marketing" className="quick-action-btn">
              <i className="bi bi-megaphone"></i>
              <span>Kế hoạch Marketing</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
