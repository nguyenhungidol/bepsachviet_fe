import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./TaiKhoan.css";
import { AUTH_STATE_EVENT, getStoredUser } from "../../services/userService";

const TaiKhoan = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const syncUser = () => {
    setUserInfo(getStoredUser());
    setLoading(false);
  };

  useEffect(() => {
    syncUser();
    const handleAuthChange = () => syncUser();
    window.addEventListener(AUTH_STATE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_STATE_EVENT, handleAuthChange);
  }, []);

  useEffect(() => {
    if (!loading && !userInfo) {
      navigate("/dang-nhap", { replace: true, state: { from: "/tai-khoan" } });
    }
  }, [loading, userInfo, navigate]);

  const handleEditProfile = () => {
    alert("Tính năng cập nhật hồ sơ sẽ sớm được triển khai.");
  };

  const handleChangePassword = () => {
    alert("Tính năng đổi mật khẩu sẽ sớm được triển khai.");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="account-loading">Đang tải thông tin tài khoản...</div>
      );
    }

    if (!userInfo) {
      return (
        <div className="account-empty">
          <p>Bạn chưa đăng nhập.</p>
          <Button variant="success" onClick={() => navigate("/dang-nhap")}>
            Đăng nhập
          </Button>
        </div>
      );
    }

    return (
      <Row className="g-4">
        <Col lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="avatar-circle">
                <span>{userInfo.name?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <h4 className="mt-3 mb-1">{userInfo.name || "Chưa cập nhật"}</h4>
              <p className="text-muted mb-2">{userInfo.email}</p>
              <Badge bg="success" pill>
                {userInfo.role || "ROLE_USER"}
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Thông tin cá nhân</h5>
            </Card.Header>
            <Card.Body>
              <div className="info-row">
                <span className="info-label">Họ và tên</span>
                <span className="info-value">
                  {userInfo.name || "Chưa cập nhật"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{userInfo.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Vai trò</span>
                <span className="info-value role">
                  {userInfo.role || "ROLE_USER"}
                </span>
              </div>

              <div className="d-flex gap-3 flex-wrap mt-4">
                <Button variant="success" onClick={handleEditProfile}>
                  Cập nhật hồ sơ
                </Button>
                <Button
                  variant="outline-success"
                  onClick={handleChangePassword}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="account-page">
      <div className="page-header-top bg-gray-100 py-3">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ&nbsp;
            </NavLink>{" "}
            /&nbsp; <span className="fw-bold">Tài khoản</span>
          </div>
        </Container>
      </div>

      <div className="account-container py-5">
        <Container>{renderContent()}</Container>
      </div>
    </div>
  );
};

export default TaiKhoan;
