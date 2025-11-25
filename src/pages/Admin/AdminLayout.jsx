import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const adminNavItems = [
  { path: "/admin", label: "Dashboard", exact: true },
  { path: "/admin/categories", label: "Quản lý danh mục" },
  { path: "/admin/products", label: "Quản lý sản phẩm" },
  { path: "/admin/posts", label: "Quản lý bài viết" },
  { path: "/admin/users", label: "Quản lý người dùng" },
];

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">Bếp Sạch Việt</div>
        <nav className="admin-nav">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? "admin-nav__link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">BẢNG ĐIỀU KHIỂN</p>
            <h1 className="admin-header__title">Khu vực quản trị</h1>
          </div>
          <div className="admin-header__actions">
            <button
              type="button"
              className="admin-view-site"
              onClick={() => navigate("/")}
            >
              Xem website
            </button>
            <div className="admin-user-chip">
              <span className="admin-user-chip__name">
                {user?.name || user?.email || "Admin"}
              </span>
              <span className="admin-user-chip__role">{user?.role}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
