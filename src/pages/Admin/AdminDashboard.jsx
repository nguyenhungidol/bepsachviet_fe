const AdminDashboard = () => (
  <div className="admin-dashboard">
    <section className="admin-section">
      <h2>Tổng quan hoạt động</h2>
      <p>
        Đây là nơi bạn có thể quan sát nhanh hiệu suất bán hàng, trạng thái đơn
        hàng và mức tồn kho. Các chỉ số sẽ được kết nối với API quản trị sau khi
        backend sẵn sàng.
      </p>
      <div className="admin-metrics">
        <div className="admin-metric-card">
          <p className="admin-metric-label">Sản phẩm đang bán</p>
          <p className="admin-metric-value">128</p>
        </div>
        <div className="admin-metric-card">
          <p className="admin-metric-label">Đơn hàng hôm nay</p>
          <p className="admin-metric-value">32</p>
        </div>
        <div className="admin-metric-card">
          <p className="admin-metric-label">Doanh thu tuần</p>
          <p className="admin-metric-value">245.000.000 ₫</p>
        </div>
      </div>
    </section>
  </div>
);

export default AdminDashboard;
