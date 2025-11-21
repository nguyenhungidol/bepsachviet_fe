const AdminUsers = () => (
  <section className="admin-section">
    <h2>Quản lý người dùng</h2>
    <p>
      Theo dõi tài khoản khách hàng, phân quyền nội bộ và khóa/mở khóa truy cập.
      Khi kết nối API, khu vực này sẽ hỗ trợ tìm kiếm, lọc và cập nhật trạng
      thái người dùng.
    </p>
    <div className="admin-empty-state">
      <p>Chưa có dữ liệu người dùng để hiển thị.</p>
      <button type="button" className="btn btn-outline-secondary btn-sm mt-2">
        Làm mới danh sách
      </button>
    </div>
  </section>
);

export default AdminUsers;
