import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminUsers,
  lockAdminUser,
  unlockAdminUser,
} from "../../services/adminService";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockingIds, setLockingIds] = useState({});
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockTarget, setLockTarget] = useState(null);
  const [lockReason, setLockReason] = useState("");

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

  const openLockModal = (user) => {
    setLockTarget(user);
    setLockReason("");
    setShowLockModal(true);
  };

  const closeLockModal = () => {
    setShowLockModal(false);
    setLockTarget(null);
    setLockReason("");
  };

  const handleLock = async () => {
    if (!lockTarget) return;
    const userId = lockTarget.userId || lockTarget.id || lockTarget.email;

    setLockingIds((prev) => ({ ...prev, [userId]: true }));
    closeLockModal();

    try {
      await lockAdminUser(userId, lockReason);
      await loadUsers();
      toast.success("Khóa tài khoản thành công.");
    } catch (err) {
      console.error("Failed to lock user", err);
      toast.error(err.message || "Không thể khóa tài khoản.");
    } finally {
      setLockingIds((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  const handleUnlock = async (userId) => {
    if (!userId) return;
    const confirmed = window.confirm("Bạn có chắc muốn mở khóa tài khoản này?");
    if (!confirmed) return;

    setLockingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await unlockAdminUser(userId);
      await loadUsers();
      toast.success("Mở khóa tài khoản thành công.");
    } catch (err) {
      console.error("Failed to unlock user", err);
      toast.error(err.message || "Không thể mở khóa tài khoản.");
    } finally {
      setLockingIds((prev) => {
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
            Xem danh sách tài khoản và quản lý trạng thái người dùng.
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
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rowId = user.userId || user.id || user.email;
                const isLocked =
                  user.locked || user.isLocked || user.status === "LOCKED";
                return (
                  <tr key={rowId}>
                    <td>{user.email}</td>
                    <td>{user.name || user.fullName || "(Chưa cập nhật)"}</td>
                    <td>
                      {user.role || user.roles?.join(", ") || "ROLE_USER"}
                    </td>
                    <td>
                      {isLocked ? (
                        <span className="badge bg-danger">Đã khóa</span>
                      ) : (
                        <span className="badge bg-success">Hoạt động</span>
                      )}
                    </td>
                    <td>
                      {isLocked ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success me-2"
                          disabled={Boolean(lockingIds[rowId])}
                          onClick={() => handleUnlock(rowId)}
                        >
                          {lockingIds[rowId] ? "Đang xử lý..." : "Mở khóa"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning"
                          disabled={Boolean(lockingIds[rowId])}
                          onClick={() => openLockModal(user)}
                        >
                          {lockingIds[rowId] ? "Đang xử lý..." : "Khóa"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lock User Modal */}
      {showLockModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeLockModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Khóa tài khoản</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeLockModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Bạn đang khóa tài khoản: <strong>{lockTarget?.email}</strong>
                </p>
                <div className="mb-3">
                  <label htmlFor="lockReason" className="form-label">
                    Lý do khóa (tùy chọn)
                  </label>
                  <textarea
                    id="lockReason"
                    className="form-control"
                    rows="3"
                    placeholder="Nhập lý do khóa tài khoản..."
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeLockModal}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleLock}
                >
                  Xác nhận khóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminUsers;
