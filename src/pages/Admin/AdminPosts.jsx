import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  createAdminPost,
  deleteAdminPost,
  fetchAdminPosts,
  fetchAdminCategories,
  updateAdminPost,
} from "../../services/adminService";
import { uploadFile } from "../../services/fileService";
import { toast } from "react-toastify";

const initialPostForm = {
  title: "",
  shortDescription: "",
  content: "",
  thumbnailUrl: "",
  author: "",
  categoryId: "",
  status: "DRAFT",
  isFeatured: false,
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp", badge: "bg-secondary" },
  { value: "PUBLISHED", label: "Đã xuất bản", badge: "bg-success" },
];

const getStatusInfo = (status) => {
  return (
    STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0]
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// Rich Text Editor Component
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
      icon: "bi-type-h1",
      title: "Tiêu đề H2",
      action: () => insertTag("<h2>", "</h2>"),
    },
    {
      icon: "bi-type-h2",
      title: "Tiêu đề H3",
      action: () => insertTag("<h3>", "</h3>"),
    },
    {
      icon: "bi-type-h3",
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
    {
      icon: "bi-code-slash",
      title: "Mã code",
      action: () => insertTag("<code>", "</code>"),
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
        rows={12}
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
              Xem trước nội dung
            </h6>
          </div>
          <div
            className="border rounded p-3 bg-white"
            style={{
              minHeight: "200px",
              maxHeight: "400px",
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{
              __html: value || "<em class='text-muted'>Chưa có nội dung</em>",
            }}
          />
        </div>
      )}

      {/* Quick tips */}
      <div className="form-text mt-2">
        <strong>Mẹo SEO:</strong> Sử dụng tiêu đề H2, H3 để phân chia nội dung.
        Thêm mô tả alt cho ảnh. Đoạn văn ngắn gọn, dễ đọc. Sử dụng danh sách để
        liệt kê thông tin.
      </div>
    </div>
  );
};

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState(initialPostForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState({});
  const [uploading, setUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const normalizedPosts = useMemo(
    () => (Array.isArray(posts) ? posts : posts?.content || []),
    [posts]
  );

  const normalizedCategories = useMemo(
    () => (Array.isArray(categories) ? categories : categories?.content || []),
    [categories]
  );

  const activeCategories = useMemo(
    () => normalizedCategories.filter((category) => category.active !== false),
    [normalizedCategories]
  );

  const filteredPosts = useMemo(() => {
    if (filterStatus === "ALL") return normalizedPosts;
    return normalizedPosts.filter((post) => post.status === filterStatus);
  }, [normalizedPosts, filterStatus]);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await fetchAdminPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      toast.error(err.message || "Không thể tải bài viết.");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [loadPosts, loadCategories]);

  const resetForm = () => {
    setForm(initialPostForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      title: form.title?.trim(),
      shortDescription: form.shortDescription?.trim() || undefined,
      content: form.content?.trim() || undefined,
      thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
      author: form.author?.trim() || undefined,
      categoryId: form.categoryId || undefined,
      status: form.status || "DRAFT",
      isFeatured: form.isFeatured || false,
    };

    try {
      if (!payload.title) {
        toast.warning("Vui lòng nhập tiêu đề bài viết.");
        setSubmitting(false);
        return;
      }

      if (!payload.categoryId) {
        toast.warning("Vui lòng chọn danh mục.");
        setSubmitting(false);
        return;
      }

      if (editingId) {
        await updateAdminPost(editingId, payload);
        toast.success("Đã cập nhật bài viết.");
      } else {
        await createAdminPost(payload);
        toast.success("Đã thêm bài viết mới.");
      }

      resetForm();
      await loadPosts();
    } catch (err) {
      console.error("Failed to submit post", err);
      toast.error(err.message || "Không thể lưu bài viết.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    const postId = post.postId || post.id;
    setEditingId(postId);
    setForm({
      title: post.title || "",
      shortDescription: post.shortDescription || "",
      content: post.content || "",
      thumbnailUrl: post.thumbnailUrl || "",
      author: post.author || "",
      categoryId: post.categoryId || "",
      status: post.status || "DRAFT",
      isFeatured: Boolean(post.isFeatured),
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (postId) => {
    if (!postId) return;
    const confirmed = window.confirm("Bạn có chắc muốn xóa bài viết này?");
    if (!confirmed) return;

    setDeletingIds((prev) => ({ ...prev, [postId]: true }));

    try {
      await deleteAdminPost(postId);
      await loadPosts();
      if (editingId === postId) {
        resetForm();
      }
      toast.success("Đã xóa bài viết.");
    } catch (err) {
      console.error("Failed to delete post", err);
      toast.error(err.message || "Không thể xóa bài viết.");
    } finally {
      setDeletingIds((prev) => {
        const next = { ...prev };
        delete next[postId];
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
      const thumbnailUrl = await uploadFile(file);
      setForm((prev) => ({ ...prev, thumbnailUrl }));
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

  const handleQuickStatusChange = async (post, newStatus) => {
    const postId = post.postId || post.id;
    try {
      await updateAdminPost(postId, { ...post, status: newStatus });
      toast.success("Đã cập nhật trạng thái.");
      await loadPosts();
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error(err.message || "Không thể cập nhật trạng thái.");
    }
  };

  return (
    <section className="admin-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Quản lý bài viết</h2>
          <p className="mb-0 text-muted">
            Tạo mới, chỉnh sửa và quản lý các bài viết tin tức.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadPosts}
        >
          Làm mới
        </button>
      </div>

      <div className="row g-4">
        {/* Form Section */}
        <div className="col-12 col-xl-5">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                {editingId ? "Cập nhật bài viết" : "Thêm bài viết mới"}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Tiêu đề <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Nhập tiêu đề bài viết"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tác giả</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.author}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        author: event.target.value,
                      }))
                    }
                    placeholder="Tên tác giả"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Danh mục <span className="text-danger">*</span>
                  </label>
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
                      Không có danh mục đang hiển thị.
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Mô tả ngắn</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.shortDescription}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        shortDescription: event.target.value,
                      }))
                    }
                    placeholder="Mô tả ngắn gọn về bài viết (hiển thị trong danh sách)"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nội dung bài viết</label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(newContent) =>
                      setForm((prev) => ({
                        ...prev,
                        content: newContent,
                      }))
                    }
                    placeholder="Nhập nội dung bài viết. Sử dụng các nút trên thanh công cụ để định dạng."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tải ảnh đại diện</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <div className="form-text">
                    {uploading
                      ? "Đang tải ảnh lên..."
                      : "Chọn ảnh từ máy tính hoặc nhập URL bên dưới."}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Hoặc dùng URL ảnh</label>
                  <input
                    type="url"
                    className="form-control"
                    value={form.thumbnailUrl}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        thumbnailUrl: event.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.thumbnailUrl && (
                    <div className="mt-2">
                      <img
                        src={form.thumbnailUrl}
                        alt="Preview"
                        style={{
                          maxHeight: 100,
                          maxWidth: "100%",
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 d-flex align-items-end">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isFeaturedCheck"
                        checked={form.isFeatured}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            isFeatured: event.target.checked,
                          }))
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="isFeaturedCheck"
                      >
                        Bài viết nổi bật
                      </label>
                    </div>
                  </div>
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

        {/* Posts List */}
        <div className="col-12 col-xl-7">
          {/* Filter */}
          <div className="mb-3 d-flex align-items-center gap-2">
            <span className="text-muted">Lọc theo:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả ({normalizedPosts.length})</option>
              {STATUS_OPTIONS.map((opt) => {
                const count = normalizedPosts.filter(
                  (p) => p.status === opt.value
                ).length;
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {loadingPosts ? (
            <p>Đang tải danh sách bài viết...</p>
          ) : filteredPosts.length === 0 ? (
            <div className="admin-empty-state">
              <p>
                {filterStatus === "ALL"
                  ? "Chưa có bài viết nào."
                  : `Không có bài viết nào với trạng thái "${
                      getStatusInfo(filterStatus).label
                    }".`}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="bg-light">
                  <tr>
                    {/* Thay width 40% bằng min-width để đảm bảo không bị quá nhỏ trên mobile */}
                    <th style={{ minWidth: "300px" }}>Bài viết</th>

                    {/* Thêm text-nowrap để không bị xuống dòng */}
                    <th className="text-nowrap">Tác giả</th>
                    <th className="text-nowrap">Trạng thái</th>
                    <th className="text-nowrap">Ngày tạo</th>
                    <th className="text-end text-nowrap">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const postId = post.postId || post.id;
                    const statusInfo = getStatusInfo(post.status);

                    return (
                      <tr key={postId}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {/* Phần ảnh thumbnail giữ nguyên */}
                            {post.thumbnailUrl ? (
                              <img
                                src={post.thumbnailUrl}
                                alt={post.title}
                                width="60"
                                height="40"
                                className="rounded flex-shrink-0" // flex-shrink-0 để ảnh không bị méo
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: 60, height: 40 }}
                              >
                                <small className="text-muted">No img</small>
                              </div>
                            )}

                            {/* Phần tiêu đề và mô tả */}
                            <div style={{ minWidth: 0 }}>
                              {" "}
                              {/* minWidth 0 giúp text-truncate hoạt động trong flex */}
                              <p className="mb-0 fw-semibold text-truncate">
                                {post.title}
                                {post.isFeatured && (
                                  <span
                                    className="badge bg-warning text-dark ms-2"
                                    title="Nổi bật"
                                  >
                                    ⭐
                                  </span>
                                )}
                              </p>
                              <small className="text-muted text-truncate d-block">
                                {post.shortDescription || "Không có mô tả"}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* Thêm text-nowrap cho các cột nội dung ngắn */}
                        <td className="text-nowrap">
                          <small className="fw-medium">
                            {post.author || "Ẩn danh"}
                          </small>
                        </td>

                        <td className="text-nowrap">
                          <div className="dropdown">
                            <button
                              className={`badge ${statusInfo.badge} border-0 dropdown-toggle`}
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              {statusInfo.label}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-sm">
                              {STATUS_OPTIONS.map((opt) => (
                                <li key={opt.value}>
                                  <button
                                    className={`dropdown-item ${
                                      post.status === opt.value ? "active" : ""
                                    }`}
                                    type="button"
                                    onClick={() =>
                                      handleQuickStatusChange(post, opt.value)
                                    }
                                  >
                                    {opt.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>

                        <td className="text-nowrap">
                          <small>{formatDate(post.createdAt)}</small>
                        </td>

                        <td className="text-end text-nowrap">
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(post)}
                            >
                              <i className="bi bi-pencil"></i> Sửa
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              disabled={Boolean(deletingIds[postId])}
                              onClick={() => handleDelete(postId)}
                            >
                              {deletingIds[postId] ? (
                                "..."
                              ) : (
                                <span>
                                  <i className="bi bi-trash"></i> Xóa
                                </span>
                              )}
                            </button>
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

export default AdminPosts;
