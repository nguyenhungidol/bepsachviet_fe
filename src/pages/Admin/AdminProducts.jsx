import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
} from "../../services/adminService";
import { uploadFile } from "../../services/fileService";
import { toast } from "react-toastify";

// OCOP badge URLs by star rating
const OCOP_BADGES = {
  3: "https://bepsachviet-s3-doan.s3.ap-southeast-2.amazonaws.com/bcc29f19-0342-464f-9b0a-e3a1453c1e1d.png",
  4: "https://bepsachviet-s3-doan.s3.ap-southeast-2.amazonaws.com/c9515ec7-8533-4122-bd00-00fada3b3470.png",
  5: "https://bepsachviet-s3-doan.s3.ap-southeast-2.amazonaws.com/74feba58-d75a-4084-b0c5-fe2c57ff3bcf.jpg",
};

// Helper to detect OCOP stars from URL
const getOcopStarsFromUrl = (url) => {
  if (!url) return "";
  for (const [stars, badgeUrl] of Object.entries(OCOP_BADGES)) {
    if (url === badgeUrl) return stars;
  }
  return "";
};

const initialProductForm = {
  productId: "",
  name: "",
  price: "",
  stockQuantity: "",
  description: "",
  categoryId: "",
  imageSrc: "",
  ocopStars: "", // "", "3", "4", or "5"
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState(initialProductForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState({});
  const [restoringIds, setRestoringIds] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showInactive, setShowInactive] = useState(false); // Filter for inactive products

  const normalizedProducts = useMemo(
    () => (Array.isArray(products) ? products : products?.content || []),
    [products]
  );

  // Filter products based on active status
  const filteredProducts = useMemo(() => {
    if (showInactive) {
      return normalizedProducts; // Show all products
    }
    // Check both 'active' and 'isActive' for compatibility
    return normalizedProducts.filter(
      (p) => p.active !== false && p.isActive !== false
    );
  }, [normalizedProducts, showInactive]);

  const normalizedCategories = useMemo(
    () => (Array.isArray(categories) ? categories : categories?.content || []),
    [categories]
  );
  const activeCategories = useMemo(
    () => normalizedCategories.filter((category) => category.active !== false),
    [normalizedCategories]
  );

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error(err.message || "Không thể tải sản phẩm.");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      // Không ghi đè lỗi sản phẩm nếu có; chỉ log tiếng Việt nhẹ.
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  const resetForm = () => {
    setForm(initialProductForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const parsedPrice = Number(form.price);
    const parsedStock = Number(form.stockQuantity);
    const payload = {
      productId: form.productId?.trim() || undefined,
      name: form.name?.trim(),
      description: form.description?.trim() || undefined,
      price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      stockQuantity:
        Number.isFinite(parsedStock) && parsedStock >= 0
          ? parsedStock
          : undefined,
      categoryId: form.categoryId || undefined,
      imageSrc: form.imageSrc?.trim() || undefined,
      ocUrl: form.ocopStars ? OCOP_BADGES[form.ocopStars] : undefined,
      // Send both field names for compatibility - backend will use whichever it recognizes
      isActive: true,
      active: true,
    };

    try {
      if (!payload.name) {
        toast.warning("Vui lòng nhập tên sản phẩm.");
        setSubmitting(false);
        return;
      }
      if (!payload.categoryId) {
        toast.warning("Vui lòng chọn danh mục.");
        setSubmitting(false);
        return;
      }
      if (payload.price === undefined || payload.price < 0) {
        toast.warning("Giá sản phẩm không hợp lệ.");
        setSubmitting(false);
        return;
      }

      if (editingId) {
        await updateAdminProduct(editingId, payload);
        toast.success("Đã cập nhật sản phẩm.");
      } else {
        await createAdminProduct(payload);
        toast.success("Đã thêm sản phẩm mới.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error("Failed to submit product", err);
      toast.error(err.message || "Không thể lưu sản phẩm.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    const productId = product.productId || product.id;
    setEditingId(productId);
    setForm({
      productId: product.productId || "",
      name: product.name || "",
      price: product.price?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "",
      description: product.description || "",
      categoryId:
        product.categoryId ||
        product.category?.id ||
        product.category?.categoryId ||
        "",
      imageSrc: product.imageSrc || product.imageUrl || product.thumbnail || "",
      ocopStars: getOcopStarsFromUrl(product.ocUrl),
    });
  };

  const handleDelete = async (productId) => {
    if (!productId) return;
    const confirmed = window.confirm(
      "Bạn có chắc muốn ẩn sản phẩm này? Sản phẩm sẽ không hiển thị với khách hàng nhưng vẫn được lưu trong hệ thống."
    );
    if (!confirmed) return;

    // Find the product to get its data for the API call
    const product = normalizedProducts.find(
      (p) => (p.productId || p.id) === productId
    );
    if (!product) {
      toast.error("Không tìm thấy sản phẩm.");
      return;
    }

    setDeletingIds((prev) => ({ ...prev, [productId]: true }));

    try {
      // Pass product data for backend validation
      await deleteAdminProduct(productId, {
        productId: product.productId || product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        categoryId: product.categoryId || product.category?.id,
        imageSrc: product.imageSrc || product.imageUrl,
        stockQuantity: product.stockQuantity,
      });
      toast.success("Đã ẩn sản phẩm thành công!");
      await loadProducts();
      if (editingId === productId) {
        resetForm();
      }
    } catch (err) {
      console.error("Failed to deactivate product", err);
      toast.error(err.message || "Không thể ẩn sản phẩm.");
    } finally {
      setDeletingIds((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const handleRestore = async (productId) => {
    if (!productId) return;
    const confirmed = window.confirm(
      "Bạn có chắc muốn khôi phục sản phẩm này?"
    );
    if (!confirmed) return;

    // Find the product to get its data for the API call
    const product = normalizedProducts.find(
      (p) => (p.productId || p.id) === productId
    );
    if (!product) {
      toast.error("Không tìm thấy sản phẩm.");
      return;
    }

    setRestoringIds((prev) => ({ ...prev, [productId]: true }));

    try {
      // Pass product data for backend validation
      await restoreAdminProduct(productId, {
        productId: product.productId || product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        categoryId: product.categoryId || product.category?.id,
        imageSrc: product.imageSrc || product.imageUrl,
        stockQuantity: product.stockQuantity,
      });
      toast.success("Đã khôi phục sản phẩm thành công!");
      await loadProducts();
    } catch (err) {
      console.error("Failed to restore product", err);
      toast.error(err.message || "Không thể khôi phục sản phẩm.");
    } finally {
      setRestoringIds((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const handleFileUpload = async (event) => {
    const inputEl = event.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageSrc = await uploadFile(file);
      setForm((prev) => ({ ...prev, imageSrc }));
      toast.success("Đã tải ảnh lên thành công.");
    } catch (err) {
      console.error("Failed to upload image", err);
      toast.error(err.message || "Không thể tải ảnh lên.");
    } finally {
      setUploading(false);
      if (inputEl) {
        inputEl.value = "";
      }
    }
  };

  return (
    <section className="admin-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Quản lý sản phẩm</h2>
          <p className="mb-0 text-muted">
            Tạo mới, chỉnh sửa chi tiết và cập nhật tình trạng hàng hóa.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="showInactiveProducts"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showInactiveProducts">
              Hiển thị sản phẩm đã ẩn
            </label>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={loadProducts}
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Mã sản phẩm</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.productId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        productId: event.target.value,
                      }))
                    }
                    placeholder="Ví dụ: SP001, COMBO-01"
                  />
                  <div className="form-text">
                    Mã sản phẩm dùng để tra cứu nhanh. Để trống nếu tự động tạo.
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tên sản phẩm</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Ví dụ: Combo sữa hạt"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Giá bán (VND)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Số lượng tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.stockQuantity}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        stockQuantity: event.target.value,
                      }))
                    }
                    placeholder="Để trống nếu không quản lý tồn kho"
                  />
                  <div className="form-text">
                    Nhập 0 nếu hết hàng, để trống nếu không áp dụng.
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Danh mục</label>
                  <select
                    className="form-select"
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryId: event.target.value,
                      }))
                    }
                    disabled={
                      loadingCategories || activeCategories.length === 0
                    }
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {activeCategories.map((category) => {
                      const categoryId = category.categoryId || category.id;
                      return (
                        <option key={categoryId} value={categoryId}>
                          {category.name}
                        </option>
                      );
                    })}
                  </select>
                  {activeCategories.length === 0 && !loadingCategories && (
                    <div className="form-text text-danger">
                      Không có danh mục đang hiển thị. Hãy bật "Hiển thị danh
                      mục" trong trang Quản lý danh mục.
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Tải ảnh sản phẩm</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <div className="form-text">
                    {uploading
                      ? "Đang tải ảnh lên S3..."
                      : "Chọn ảnh từ máy tính hoặc nhập URL thủ công bên dưới."}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Hoặc dùng URL ảnh</label>
                  <input
                    type="url"
                    className="form-control"
                    value={form.imageSrc}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        imageSrc: event.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Chứng nhận OCOP</label>
                  <select
                    className="form-select"
                    value={form.ocopStars}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        ocopStars: event.target.value,
                      }))
                    }
                  >
                    <option value="">Không có OCOP</option>
                    <option value="3">OCOP 3 sao ⭐⭐⭐</option>
                    <option value="4">OCOP 4 sao ⭐⭐⭐⭐</option>
                    <option value="5">OCOP 5 sao ⭐⭐⭐⭐⭐</option>
                  </select>
                  <div className="form-text">
                    Chọn mức sao OCOP nếu sản phẩm đạt chứng nhận.
                  </div>
                  {form.ocopStars && (
                    <div className="mt-2">
                      <img
                        src={OCOP_BADGES[form.ocopStars]}
                        alt={`OCOP ${form.ocopStars} sao`}
                        style={{ maxHeight: 50 }}
                      />
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Mô tả ngắn gọn"
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Đang lưu..."
                      : editingId
                      ? "Lưu thay đổi"
                      : "Thêm mới"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          {/* Filter toggle for inactive products */}
          <div className="mb-3 d-flex align-items-center gap-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="showInactiveProducts"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="showInactiveProducts"
              >
                Hiển thị sản phẩm đã ẩn
              </label>
            </div>
            <small className="text-muted">
              ({filteredProducts.length} / {normalizedProducts.length} sản phẩm)
            </small>
          </div>

          {loadingProducts ? (
            <p>Đang tải danh sách sản phẩm...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-empty-state">
              <p>
                {showInactive
                  ? "Chưa có sản phẩm nào."
                  : "Không có sản phẩm đang bán."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const productId = product.productId || product.id;
                    const categoryMatch = normalizedCategories.find(
                      (category) =>
                        (category.categoryId || category.id) ===
                        (product.categoryId || product.category?.id)
                    );
                    const categoryName =
                      product.category?.name || categoryMatch?.name || "—";
                    const categoryInactive = categoryMatch?.active === false;
                    // Check both 'active' and 'isActive' for compatibility with backend
                    const isActive =
                      typeof product.isActive === "boolean"
                        ? product.isActive
                        : typeof product.active === "boolean"
                        ? product.active
                        : product.status
                        ? product.status.toUpperCase() === "ACTIVE"
                        : true;
                    const productImage =
                      product.imageSrc || product.imageUrl || product.thumbnail;
                    return (
                      <tr key={productId}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={product.name}
                                width="48"
                                height="48"
                                className="rounded"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="bg-light rounded"
                                style={{ width: 48, height: 48 }}
                              />
                            )}
                            <div>
                              <p className="mb-0 fw-semibold">{product.name}</p>
                              <small
                                className="text-muted text-truncate d-block"
                                style={{ maxWidth: 220 }}
                              >
                                {product.description || "Không có mô tả"}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {categoryName}
                          {categoryInactive && (
                            <span className="badge bg-warning text-dark ms-2">
                              Đã ẩn
                            </span>
                          )}
                        </td>
                        <td>{product.price?.toLocaleString("vi-VN")} ₫</td>
                        <td>
                          {product.stockQuantity === null ||
                          product.stockQuantity === undefined ? (
                            <span className="text-muted">—</span>
                          ) : product.stockQuantity > 0 ? (
                            <span className="text-success fw-semibold">
                              {product.stockQuantity}
                            </span>
                          ) : (
                            <span className="badge bg-danger">Hết hàng</span>
                          )}
                        </td>
                        <td>
                          {isActive ? (
                            <span className="badge bg-success">Đang bán</span>
                          ) : (
                            <span className="badge bg-secondary">
                              Ngưng bán
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(product)}
                            >
                              Sửa
                            </button>
                            {isActive ? (
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                disabled={Boolean(deletingIds[productId])}
                                onClick={() => handleDelete(productId)}
                                title="Ẩn sản phẩm"
                              >
                                {deletingIds[productId] ? "Đang ẩn..." : "Ẩn"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                disabled={Boolean(restoringIds[productId])}
                                onClick={() => handleRestore(productId)}
                                title="Khôi phục sản phẩm"
                              >
                                {restoringIds[productId]
                                  ? "Đang khôi phục..."
                                  : "Khôi phục"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminProducts;
