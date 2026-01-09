import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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

// Rich Text Editor Component for Product Description
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertTag = (tagStart, tagEnd = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    const newText = before + tagStart + selectedText + tagEnd + after;
    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start + tagStart.length + selectedText.length + tagEnd.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = value.substring(0, start);
    const after = value.substring(start);

    const newText = before + text + after;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatActions = [
    {
      icon: "bi-type-bold",
      title: "In đậm (Ctrl+B)",
      action: () => insertTag("<strong>", "</strong>"),
    },
    {
      icon: "bi-type-italic",
      title: "In nghiêng (Ctrl+I)",
      action: () => insertTag("<em>", "</em>"),
    },
    {
      icon: "bi-type-underline",
      title: "Gạch chân",
      action: () => insertTag("<u>", "</u>"),
    },
    { type: "divider" },
    {
      icon: "bi-type-h3",
      title: "Tiêu đề H3",
      action: () => insertTag("<h3>", "</h3>"),
    },
    {
      icon: "bi-type-h4",
      title: "Tiêu đề H4",
      action: () => insertTag("<h4>", "</h4>"),
    },
    { type: "divider" },
    {
      icon: "bi-list-ul",
      title: "Danh sách",
      action: () => insertTag("<ul>\n  <li>", "</li>\n</ul>"),
    },
    {
      icon: "bi-list-ol",
      title: "Danh sách số",
      action: () => insertTag("<ol>\n  <li>", "</li>\n</ol>"),
    },
    {
      icon: "bi-text-paragraph",
      title: "Đoạn văn",
      action: () => insertTag("<p>", "</p>"),
    },
    { type: "divider" },
    {
      icon: "bi-link-45deg",
      title: "Chèn liên kết",
      action: () => {
        const url = prompt("Nhập URL:");
        if (url) {
          const textarea = textareaRef.current;
          const selectedText =
            value.substring(textarea.selectionStart, textarea.selectionEnd) ||
            "Nhấn vào đây";
          insertTag(`<a href="${url}" target="_blank">`, "</a>");
        }
      },
    },
    {
      icon: "bi-image",
      title: "Chèn ảnh",
      action: () => {
        const url = prompt("Nhập URL ảnh:");
        if (url) {
          insertAtCursor(
            `<img src="${url}" alt="Mô tả ảnh" style="max-width: 100%; height: auto;" />`
          );
        }
      },
    },
    { type: "divider" },
    {
      icon: "bi-blockquote-left",
      title: "Trích dẫn",
      action: () => insertTag("<blockquote>", "</blockquote>"),
    },
    {
      icon: "bi-hr",
      title: "Đường kẻ ngang",
      action: () => insertAtCursor("\n<hr />\n"),
    },
  ];

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        insertTag("<strong>", "</strong>");
      } else if (e.key === "i") {
        e.preventDefault();
        insertTag("<em>", "</em>");
      }
    }
  };

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar d-flex flex-wrap gap-1 p-2 bg-light border rounded-top">
        {formatActions.map((action, index) =>
          action.type === "divider" ? (
            <div
              key={index}
              className="vr mx-1"
              style={{ height: "24px" }}
            ></div>
          ) : (
            <button
              key={index}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              title={action.title}
              onClick={action.action}
              style={{ padding: "4px 8px" }}
            >
              <i className={`bi ${action.icon}`}></i>
            </button>
          )
        )}
        <div className="ms-auto">
          <button
            type="button"
            className={`btn btn-sm ${
              showPreview ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setShowPreview(!showPreview)}
            title="Xem trước"
          >
            <i className="bi bi-eye me-1"></i>
            {showPreview ? "Ẩn xem trước" : "Xem trước"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        className="form-control rounded-0 rounded-bottom"
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          fontFamily: "monospace",
          fontSize: "14px",
          borderTop: "none",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      />

      {/* Preview */}
      {showPreview && (
        <div className="mt-3">
          <div className="d-flex align-items-center mb-2">
            <h6 className="mb-0">
              <i className="bi bi-eye me-2"></i>
              Xem trước mô tả
            </h6>
          </div>
          <div
            className="border rounded p-3 bg-white"
            style={{
              minHeight: "150px",
              maxHeight: "300px",
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{
              __html: value || "<em class='text-muted'>Chưa có mô tả</em>",
            }}
          />
        </div>
      )}

      {/* Quick tips */}
      <div className="form-text mt-2">
        <strong>Mẹo:</strong> Sử dụng tiêu đề, danh sách và đoạn văn để mô tả
        sản phẩm rõ ràng hơn. Thêm ảnh minh họa nếu cần.
      </div>
    </div>
  );
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
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering products
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizedProducts = useMemo(
    () => (Array.isArray(products) ? products : products?.content || []),
    [products]
  );

  // Filter products based on active status and search term
  const filteredProducts = useMemo(() => {
    let filtered = normalizedProducts;

    // Filter by active status
    if (!showInactive) {
      // Check both 'active' and 'isActive' for compatibility
      filtered = filtered.filter(
        (p) => p.active !== false && p.isActive !== false
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const productId = (p.productId || p.id || "").toString().toLowerCase();
        const description = (p.description || "").toLowerCase();
        return (
          name.includes(searchLower) ||
          productId.includes(searchLower) ||
          description.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [normalizedProducts, showInactive, searchTerm]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [showInactive, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                  <label className="form-label">Mô tả sản phẩm</label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(newValue) =>
                      setForm((prev) => ({ ...prev, description: newValue }))
                    }
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
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
          {/* Search and filter controls */}
          <div className="mb-3">
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tên, mã sản phẩm hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm("")}
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-6 d-flex align-items-center gap-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showInactiveProductsList"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="showInactiveProductsList"
                  >
                    Hiển thị sản phẩm đã ẩn
                  </label>
                </div>
                <small className="text-muted">
                  ({currentProducts.length > 0 ? startIndex + 1 : 0}-
                  {Math.min(endIndex, filteredProducts.length)} /{" "}
                  {filteredProducts.length} sản phẩm)
                </small>
              </div>
            </div>
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
            <>
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
                    {currentProducts.map((product) => {
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
                        product.imageSrc ||
                        product.imageUrl ||
                        product.thumbnail;
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
                                <p className="mb-0 fw-semibold">
                                  {product.name}
                                </p>
                                <small
                                  className="text-muted d-block"
                                  style={{
                                    maxWidth: 220,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {product.description ? (
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: product.description
                                          .replace(/<[^>]*>/g, " ")
                                          .substring(0, 100),
                                      }}
                                    />
                                  ) : (
                                    "Không có mô tả"
                                  )}
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
                            <div
                              className="btn-group btn-group-sm"
                              role="group"
                            >
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
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    « Trước
                  </button>

                  <div className="d-flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              className={`btn btn-sm ${
                                currentPage === pageNum
                                  ? "btn-primary"
                                  : "btn-outline-secondary"
                              }`}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau »
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminProducts;
