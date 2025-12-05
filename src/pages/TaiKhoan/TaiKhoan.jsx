import "./TaiKhoan.css";
import {
  AUTH_STATE_EVENT,
  getStoredUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateStoredUser,
} from "../../services/userService";

import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const TaiKhoan = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Edit profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const loadUserProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      setUserInfo(profile);
      updateStoredUser(profile);
    } catch (error) {
      console.warn("Failed to load profile from API, using stored data", error);
      setUserInfo(getStoredUser());
    }
  }, []);

  const syncUser = useCallback(() => {
    const stored = getStoredUser();
    setUserInfo(stored);
    if (stored) {
      loadUserProfile();
    }
    setLoading(false);
  }, [loadUserProfile]);

  useEffect(() => {
    syncUser();
    const handleAuthChange = () => syncUser();
    window.addEventListener(AUTH_STATE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_STATE_EVENT, handleAuthChange);
  }, [syncUser]);

  useEffect(() => {
    if (!loading && !userInfo) {
      navigate("/dang-nhap", { replace: true, state: { from: "/tai-khoan" } });
    }
  }, [loading, userInfo, navigate]);

  // Open edit modal
  const handleEditProfile = () => {
    setProfileForm({
      name: userInfo?.name || "",
      phoneNumber: userInfo?.phoneNumber || userInfo?.phone || "",
      address: userInfo?.address || "",
    });
    setProfileErrors({});
    setShowEditModal(true);
  };

  // Submit profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!profileForm.name.trim()) {
      errors.name = "Vui lòng nhập họ tên";
    }

    if (
      profileForm.phoneNumber &&
      !/^[0-9]{10,11}$/.test(profileForm.phoneNumber)
    ) {
      errors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUserProfile({
        name: profileForm.name.trim(),
        phoneNumber: profileForm.phoneNumber.trim() || undefined,
        address: profileForm.address.trim() || undefined,
      });

      // Update local storage and state
      updateStoredUser(updated);
      setUserInfo((prev) => ({ ...prev, ...updated }));
      setShowEditModal(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(
        error.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open password modal
  const handleChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    setShowPasswordModal(true);
  };

  // Submit password change
  const handleSavePassword = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)
    ) {
      errors.newPassword = "Mật khẩu phải chứa chữ hoa, chữ thường và số";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setShowPasswordModal(false);
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      console.error("Change password error:", error);
      if (
        error.message?.includes("incorrect") ||
        error.message?.includes("sai")
      ) {
        setPasswordErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
      } else {
        toast.error(
          error.message || "Không thể đổi mật khẩu. Vui lòng thử lại."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
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
                <span className="info-label">Số điện thoại</span>
                <span className="info-value">
                  {userInfo.phoneNumber || userInfo.phone || "Chưa cập nhật"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa chỉ</span>
                <span className="info-value">
                  {userInfo.address || "Chưa cập nhật"}
                </span>
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
                <Button
                  variant="outline-primary"
                  onClick={() => navigate("/don-hang-cua-toi")}
                >
                  <i className="bi bi-bag-check me-1"></i>
                  Đơn hàng của tôi
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

      {/* Edit Profile Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật hồ sơ</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProfile}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ và tên"
                value={profileForm.name}
                onChange={(e) => {
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }));
                  setProfileErrors((prev) => ({ ...prev, name: "" }));
                }}
                isInvalid={!!profileErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {profileErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Nhập số điện thoại"
                value={profileForm.phoneNumber}
                onChange={(e) => {
                  setProfileForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }));
                  setProfileErrors((prev) => ({ ...prev, phoneNumber: "" }));
                }}
                isInvalid={!!profileErrors.phoneNumber}
              />
              <Form.Control.Feedback type="invalid">
                {profileErrors.phoneNumber}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Nhập địa chỉ"
                value={profileForm.address}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="success" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSavePassword}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu hiện tại *</Form.Label>
              <div className="password-field">
                <Form.Control
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }));
                    setPasswordErrors((prev) => ({
                      ...prev,
                      currentPassword: "",
                    }));
                  }}
                  isInvalid={!!passwordErrors.currentPassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  <i
                    className={`bi ${
                      showPasswords.current ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <div className="invalid-feedback d-block">
                  {passwordErrors.currentPassword}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới *</Form.Label>
              <div className="password-field">
                <Form.Control
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }));
                    setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  isInvalid={!!passwordErrors.newPassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  <i
                    className={`bi ${
                      showPasswords.new ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {passwordErrors.newPassword && (
                <div className="invalid-feedback d-block">
                  {passwordErrors.newPassword}
                </div>
              )}
              <Form.Text className="text-muted">
                Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và
                số.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới *</Form.Label>
              <div className="password-field">
                <Form.Control
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }));
                    setPasswordErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                  }}
                  isInvalid={!!passwordErrors.confirmPassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  <i
                    className={`bi ${
                      showPasswords.confirm ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <div className="invalid-feedback d-block">
                  {passwordErrors.confirmPassword}
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Hủy
            </Button>
            <Button variant="success" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Đang lưu...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default TaiKhoan;
