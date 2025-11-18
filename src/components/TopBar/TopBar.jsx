import { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./TopBar.css";
import {
  AUTH_STATE_EVENT,
  clearAuthData,
  getStoredUser,
} from "../../services/userService";

function TopBar() {
  const [userInfo, setUserInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const syncUserInfo = () => {
    setUserInfo(getStoredUser());
    setMenuOpen(false);
  };

  useEffect(() => {
    syncUserInfo();
  }, [location]);

  useEffect(() => {
    const handleStorage = () => syncUserInfo();
    const handleAuthEvent = () => syncUserInfo();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_STATE_EVENT, handleAuthEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_STATE_EVENT, handleAuthEvent);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    clearAuthData();
    setUserInfo(null);
    setMenuOpen(false);
    navigate("/dang-nhap");
  };

  const displayName = userInfo?.name || userInfo?.email;

  return (
    <div className="top-bar">
      <Container
        fluid
        className="d-flex justify-content-between align-items-center"
      >
        <div className="top-bar-left d-flex align-items-center gap-4">
          <div className="hotline-info">
            <i className="bi bi-telephone-fill"></i>
            <span className="ms-2">Hotline: 0868839655 | 0963538357</span>
          </div>
          <div className="address-info">
            <i className="bi bi-geo-alt-fill"></i>
            <span className="ms-2">
              91 Tam Khương, nhà số 2, P. Khương thượng, Q. Đống đa, HN.
            </span>
          </div>
        </div>
        <div className="top-bar-right">
          {userInfo ? (
            <div className="top-bar-user" ref={menuRef}>
              <button
                type="button"
                className="user-toggle"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <i className="bi bi-person-circle"></i>
                <span className="user-name">{displayName || "Tài khoản"}</span>
                <i className="bi bi-chevron-down"></i>
              </button>

              {menuOpen && (
                <div className="user-menu">
                  <div className="user-info">
                    <div className="user-info-name">{userInfo.name}</div>
                    <div className="user-info-email">{userInfo.email}</div>
                  </div>
                  <button
                    type="button"
                    className="user-menu-item"
                    onClick={() => navigate("/tai-khoan")}
                  >
                    Thông tin tài khoản
                  </button>
                  <button
                    type="button"
                    className="user-menu-item logout"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/dang-nhap" className="text-white text-decoration-none">
                Đăng nhập
              </a>
              <span className="mx-2">/</span>
              <a href="/dang-ky" className="text-white text-decoration-none">
                Đăng ký
              </a>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

export default TopBar;
