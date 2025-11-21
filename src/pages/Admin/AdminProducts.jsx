const AdminProducts = () => (
  <section className="admin-section">
    <h2>Quản lý sản phẩm</h2>
    <p>
      Kiểm soát danh sách sản phẩm, cập nhật giá bán, tình trạng kho và nội dung
      mô tả. Bạn có thể nối API sản phẩm tại đây để hiển thị bảng dữ liệu và hỗ
      trợ thao tác CRUD.
    </p>
    <div className="admin-empty-state">
      <p>Danh sách sản phẩm sẽ hiển thị ở đây.</p>
      <button type="button" className="btn btn-outline-success btn-sm mt-2">
        + Thêm sản phẩm
      </button>
    </div>
  </section>
);

export default AdminProducts;
