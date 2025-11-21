const AdminCategories = () => (
  <section className="admin-section">
    <h2>Quản lý danh mục</h2>
    <p>
      Thêm mới, chỉnh sửa hoặc ẩn các danh mục sản phẩm. Liên kết API sẽ được
      ghép nối trong bước tiếp theo; hiện tại đây là giao diện nền tảng để xây
      dựng các bảng dữ liệu và biểu mẫu.
    </p>
    <div className="admin-empty-state">
      <p>Chưa có danh mục nào được tải.</p>
      <button type="button" className="btn btn-success btn-sm mt-2">
        + Thêm danh mục
      </button>
    </div>
  </section>
);

export default AdminCategories;
