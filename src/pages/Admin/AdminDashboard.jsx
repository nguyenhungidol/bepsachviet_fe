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
import { Line, Pie } from "react-chartjs-2";
import {
  fetchAdminProducts,
  fetchAdminUsers,
} from "../../services/adminService";
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

// Mock data generators (replace with real API later)
const generateRevenueData = (period) => {
  const labels =
    period === "week"
      ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      : period === "month"
      ? Array.from({ length: 30 }, (_, i) => `${i + 1}`)
      : [
          "T1",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
          "T8",
          "T9",
          "T10",
          "T11",
          "T12",
        ];

  const baseValue =
    period === "week" ? 15000000 : period === "month" ? 12000000 : 150000000;
  const variance =
    period === "week" ? 10000000 : period === "month" ? 8000000 : 80000000;

  return {
    labels,
    datasets: [
      {
        label: "Doanh thu",
        data: labels.map(() =>
          Math.floor(baseValue + Math.random() * variance)
        ),
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
};

const orderStatusData = {
  labels: ["Thành công", "Đang giao", "Đã hủy"],
  datasets: [
    {
      data: [65, 25, 10],
      backgroundColor: ["#10b981", "#3b82f6", "#ef4444"],
      borderColor: ["#fff", "#fff", "#fff"],
      borderWidth: 3,
      hoverOffset: 4,
    },
  ],
};

const mockTopProducts = [
  {
    id: 1,
    name: "Combo sữa hạt dinh dưỡng",
    category: "Sữa hạt",
    image: "https://via.placeholder.com/100",
    sold: 234,
    revenue: 35100000,
  },
  {
    id: 2,
    name: "Hạt điều rang muối",
    category: "Hạt dinh dưỡng",
    image: "https://via.placeholder.com/100",
    sold: 189,
    revenue: 28350000,
  },
  {
    id: 3,
    name: "Bột ngũ cốc organic",
    category: "Ngũ cốc",
    image: "https://via.placeholder.com/100",
    sold: 156,
    revenue: 23400000,
  },
  {
    id: 4,
    name: "Mật ong rừng nguyên chất",
    category: "Thực phẩm tự nhiên",
    image: "https://via.placeholder.com/100",
    sold: 142,
    revenue: 21300000,
  },
  {
    id: 5,
    name: "Trà hoa cúc premium",
    category: "Trà thảo mộc",
    image: "https://via.placeholder.com/100",
    sold: 128,
    revenue: 19200000,
  },
];

const mockActivities = [
  {
    id: 1,
    type: "order",
    text: "Đơn hàng mới <strong>#ĐH2024-1234</strong> từ khách hàng Nguyễn Văn A",
    time: "5 phút trước",
  },
  {
    id: 2,
    type: "customer",
    text: "Khách hàng mới <strong>Trần Thị B</strong> vừa đăng ký",
    time: "15 phút trước",
  },
  {
    id: 3,
    type: "product",
    text: "Sản phẩm <strong>Sữa hạt óc chó</strong> đã được cập nhật",
    time: "1 giờ trước",
  },
  {
    id: 4,
    type: "alert",
    text: "Sản phẩm <strong>Hạt macca</strong> sắp hết hàng (còn 5)",
    time: "2 giờ trước",
  },
  {
    id: 5,
    type: "order",
    text: "Đơn hàng <strong>#ĐH2024-1233</strong> đã giao thành công",
    time: "3 giờ trước",
  },
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newOrders: 0,
    newCustomers: 0,
    outOfStock: 0,
  });
  const [revenuePeriod, setRevenuePeriod] = useState("week");
  const [revenueData, setRevenueData] = useState(() =>
    generateRevenueData("week")
  );
  const [products, setProducts] = useState([]);

  // Load real data from API
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, usersData] = await Promise.all([
        fetchAdminProducts().catch(() => []),
        fetchAdminUsers().catch(() => []),
      ]);

      const normalizedProducts = Array.isArray(productsData)
        ? productsData
        : productsData?.content || [];
      const normalizedUsers = Array.isArray(usersData)
        ? usersData
        : usersData?.content || [];

      setProducts(normalizedProducts);

      // Calculate stats from real data + mock for missing data
      const outOfStockCount = normalizedProducts.filter(
        (p) => p.stock === 0 || p.quantity === 0 || p.outOfStock === true
      ).length;

      // Mock stats (replace with real API when available)
      setStats({
        totalRevenue: 485600000 + Math.floor(Math.random() * 50000000),
        newOrders: 32 + Math.floor(Math.random() * 20),
        newCustomers: normalizedUsers.length || 156,
        outOfStock: outOfStockCount || 3,
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

  // Update revenue chart when period changes
  useEffect(() => {
    setRevenueData(generateRevenueData(revenuePeriod));
  }, [revenuePeriod]);

  // Get top products from real data or use mock
  const topProducts = useMemo(() => {
    if (products.length > 0) {
      return products.slice(0, 5).map((p, index) => ({
        id: p.productId || p.id,
        name: p.name,
        category: p.category?.name || "Chưa phân loại",
        image: p.imageSrc || p.imageUrl || "https://via.placeholder.com/100",
        sold: Math.floor(200 - index * 30 + Math.random() * 20),
        revenue: Math.floor((200 - index * 30) * (p.price || 150000)),
      }));
    }
    return mockTopProducts;
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
            <p className="stat-change positive">
              <i className="bi bi-arrow-up"></i>
              <span>12.5% so với tháng trước</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="bi bi-bag-check"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Đơn hàng mới</p>
            <p className="stat-value">{stats.newOrders}</p>
            <p className="stat-change positive">
              <i className="bi bi-arrow-up"></i>
              <span>8.2% so với tuần trước</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Khách hàng mới</p>
            <p className="stat-value">{stats.newCustomers}</p>
            <p className="stat-change positive">
              <i className="bi bi-arrow-up"></i>
              <span>5.3% so với tháng trước</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Sản phẩm hết hàng</p>
            <p className="stat-value">{stats.outOfStock}</p>
            <p className="stat-change neutral">
              <i className="bi bi-dash"></i>
              <span>Cần nhập thêm hàng</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Biểu đồ doanh thu</h3>
            <div className="chart-period-selector">
              <button
                type="button"
                className={`chart-period-btn ${
                  revenuePeriod === "week" ? "active" : ""
                }`}
                onClick={() => setRevenuePeriod("week")}
              >
                Tuần
              </button>
              <button
                type="button"
                className={`chart-period-btn ${
                  revenuePeriod === "month" ? "active" : ""
                }`}
                onClick={() => setRevenuePeriod("month")}
              >
                Tháng
              </button>
              <button
                type="button"
                className={`chart-period-btn ${
                  revenuePeriod === "year" ? "active" : ""
                }`}
                onClick={() => setRevenuePeriod("year")}
              >
                Năm
              </button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={revenueData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Tỷ lệ đơn hàng</h3>
          </div>
          <div className="chart-container pie">
            <Pie data={orderStatusData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="top-products-section">
        {/* Top Products */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Sản phẩm bán chạy</h3>
            <a
              href="/admin/products"
              className="btn btn-sm btn-outline-primary"
            >
              Xem tất cả
            </a>
          </div>
          <ul className="product-rank-list">
            {topProducts.map((product, index) => (
              <li key={product.id} className="product-rank-item">
                <span
                  className={`rank-badge ${
                    index === 0
                      ? "rank-1"
                      : index === 1
                      ? "rank-2"
                      : index === 2
                      ? "rank-3"
                      : "rank-other"
                  }`}
                >
                  {index + 1}
                </span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-rank-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100?text=No+Image";
                  }}
                />
                <div className="product-rank-info">
                  <p className="product-rank-name">{product.name}</p>
                  <p className="product-rank-category">{product.category}</p>
                </div>
                <div className="product-rank-stats">
                  <p className="product-rank-sales">{product.sold} đã bán</p>
                  <p className="product-rank-revenue">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Hoạt động gần đây</h3>
          </div>
          <ul className="activity-list">
            {mockActivities.map((activity) => (
              <li key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  <i
                    className={`bi ${
                      activity.type === "order"
                        ? "bi-bag"
                        : activity.type === "customer"
                        ? "bi-person-plus"
                        : activity.type === "product"
                        ? "bi-box"
                        : "bi-exclamation-triangle"
                    }`}
                  ></i>
                </div>
                <div className="activity-content">
                  <p
                    className="activity-text"
                    dangerouslySetInnerHTML={{ __html: activity.text }}
                  />
                  <p className="activity-time">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
