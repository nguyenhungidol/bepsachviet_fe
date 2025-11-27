import { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/userService";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Mật khẩu phải chứa chữ hoa, chữ thường và số";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await resetPassword(token, password);
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/dang-nhap", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Reset password error:", err);
      const message = "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      setErrors({ general: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="page-header-top bg-gray-100 py-3">
          <Container>
            <div className="breadcrumb text-sm text-muted">
              <NavLink to="/" className="text-muted text-decoration-none">
                Trang chủ&nbsp;
              </NavLink>
              /&nbsp;
              <span className="fw-bold">Đặt lại mật khẩu</span>
            </div>
          </Container>
        </div>

        <div className="reset-password-container py-5">
          <Container>
            <div className="reset-password-wrapper">
              <div className="reset-password-box bg-white p-5 shadow rounded text-center">
                <div className="error-icon mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <h2 className="text-danger mb-3">Liên kết không hợp lệ</h2>
                <p className="text-muted mb-4">
                  Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui
                  lòng yêu cầu liên kết mới.
                </p>
                <Link to="/quen-mat-khau" className="btn btn-success">
                  Yêu cầu liên kết mới
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="page-header-top bg-gray-100 py-3">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ&nbsp;
            </NavLink>
            /&nbsp;
            <span className="fw-bold">Đặt lại mật khẩu</span>
          </div>
        </Container>
      </div>

      <div className="reset-password-container py-5">
        <Container>
          <div className="reset-password-wrapper">
            <div className="reset-password-box bg-white p-5 shadow rounded">
              <div className="text-center mb-4">
                <div className="reset-icon mb-3">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h1 className="reset-title" style={{ color: "#198754" }}>
                  Đặt lại mật khẩu
                </h1>
                <p className="text-muted">
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>

              {success ? (
                <div className="text-center">
                  <Alert variant="success">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Mật khẩu đã được đặt lại thành công! Bạn sẽ được chuyển đến
                    trang đăng nhập...
                  </Alert>
                  <Link to="/dang-nhap" className="btn btn-success mt-3">
                    Đăng nhập ngay
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errors.general && (
                    <Alert variant="danger" className="mb-3">
                      {errors.general}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới *</Form.Label>
                    <div className="password-input-wrapper">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        isInvalid={!!errors.password}
                        className="form-input"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                    </div>
                    {errors.password && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.password}
                      </Form.Control.Feedback>
                    )}
                    <Form.Text className="text-muted">
                      Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ
                      thường và số.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Xác nhận mật khẩu *</Form.Label>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }}
                      isInvalid={!!errors.confirmPassword}
                      className="form-input"
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Button
                    type="submit"
                    className="reset-btn w-100 mb-3 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Đang xử lý...
                      </>
                    ) : (
                      "Đặt lại mật khẩu"
                    )}
                  </Button>

                  <div className="text-center">
                    <Link to="/dang-nhap" className="back-link">
                      <i className="bi bi-arrow-left me-2"></i>
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ResetPassword;
