import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "../../services/adminService";
import { toast } from "react-toastify";

const initialFormState = { name: "", description: "", active: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState({});

  const normalizedCategories = useMemo(
    () => (Array.isArray(categories) ? categories : categories?.content || []),
    [categories]
  );

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      toast.error(err.message || "Không thể tải danh mục.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      name: form.name?.trim(),
      description: form.description?.trim() || undefined,
      active: Boolean(form.active),
    };

    try {
      if (!payload.name) {
        toast.warning("Vui lòng nhập tên danh mục.");
        setSubmitting(false);
        return;
      }

      if (editingId) {
        await updateAdminCategory(editingId, payload);
        toast.success("Đã cập nhật danh mục.");
      } else {
        await createAdminCategory(payload);
        toast.success("Đã thêm danh mục mới.");
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      console.error("Failed to submit category", err);
      toast.error(err.message || "Không thể lưu danh mục.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    const categoryId = category.categoryId || category.id;
    setEditingId(categoryId);
    setForm({
      name: category.name || "",
      description: category.description || "",
      active: category.active ?? true,
    });
  };

  const handleDelete = async (categoryId) => {
    if (!categoryId) return;
    const confirmed = window.confirm("Xác nhận xóa danh mục này?");
    if (!confirmed) return;

    setDeletingIds((prev) => ({ ...prev, [categoryId]: true }));
    try {
      await deleteAdminCategory(categoryId);
      toast.success("Đã xóa danh mục.");
      await loadCategories();
      if (editingId === categoryId) {
        resetForm();
      }
    } catch (err) {
      console.error("Failed to delete category", err);
      toast.error(err.message || "Không thể xóa danh mục.");
    } finally {
      setDeletingIds((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
    }
  };

  return (
    <section className="admin-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Quản lý danh mục</h2>
          <p className="mb-0 text-muted">
            Tạo mới, chỉnh sửa trạng thái và dọn dẹp các danh mục sản phẩm.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadCategories}
        >
          Làm mới
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                {editingId ? "Cập nhật danh mục" : "Thêm danh mục"}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tên danh mục</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Ví dụ: Sữa hạt"
                  />
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
                    placeholder="Tóm tắt nội dung danh mục"
                  />
                </div>
                <div className="form-check form-switch mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="category-active"
                    checked={form.active}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        active: event.target.checked,
                      }))
                    }
                  />
                  <label className="form-check-label" htmlFor="category-active">
                    Hiển thị danh mục
                  </label>
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

        <div className="col-12 col-lg-7">
          {loading ? (
            <p>Đang tải danh sách danh mục...</p>
          ) : normalizedCategories.length === 0 ? (
            <div className="admin-empty-state">
              <p>Chưa có danh mục nào.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedCategories.map((category) => {
                    const categoryId = category.categoryId || category.id;
                    return (
                      <tr key={categoryId}>
                        <td>{category.name}</td>
                        <td className="text-muted">
                          {category.description || "—"}
                        </td>
                        <td>
                          {category.active ? (
                            <span className="badge bg-success">
                              Đang hiển thị
                            </span>
                          ) : (
                            <span className="badge bg-secondary">Đã ẩn</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(category)}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              disabled={Boolean(deletingIds[categoryId])}
                              onClick={() => handleDelete(categoryId)}
                            >
                              {deletingIds[categoryId] ? "Đang xóa..." : "Xóa"}
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

export default AdminCategories;
