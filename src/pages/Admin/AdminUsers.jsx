import { useCallback, useEffect, useState } from "react";
import { deleteAdminUser, fetchAdminUsers } from "../../services/adminService";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error("Failed to fetch admin users", err);
      toast.error(err.message || "Không thể tải danh sách người dùng.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (userId) => {
    if (!userId) return;
    const confirmed = window.confirm("Bạn có chắc muốn xóa người dùng này?");
    if (!confirmed) return;

    setDeletingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await deleteAdminUser(userId);
      await loadUsers();
      toast.success("Xóa người dùng thành công.");
    } catch (err) {
      console.error("Failed to delete user", err);
      toast.error(err.message || "Không thể xóa người dùng.");
    } finally {
      setDeletingIds((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  return (
    <section className="admin-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Quản lý người dùng</h2>
          <p className="mb-0 text-muted">
            Xem danh sách tài khoản và loại bỏ người dùng không còn hoạt động.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadUsers}
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <p>Đang tải danh sách người dùng...</p>
      ) : users.length === 0 ? (
        <div className="admin-empty-state">
          <p>Chưa có dữ liệu người dùng.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tên</th>
                <th>Vai trò</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rowId = user.userId || user.id || user.email;
                return (
                  <tr key={rowId}>
                    <td>{user.email}</td>
                    <td>{user.name || user.fullName || "(Chưa cập nhật)"}</td>
                    <td>
                      {user.role || user.roles?.join(", ") || "ROLE_USER"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        disabled={Boolean(deletingIds[rowId])}
                        onClick={() => handleDelete(rowId)}
                      >
                        {deletingIds[rowId] ? "Đang xóa..." : "Xóa"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminUsers;
