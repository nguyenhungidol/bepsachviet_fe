import { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../../services/userService";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success("Đã gửi email hướng dẫn đặt lại mật khẩu!");
    } catch (err) {
      console.error("Forgot password error:", err);
      const message =
        err.message || "Không thể gửi email. Vui lòng thử lại sau.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="page-header-top bg-gray-100 py-3">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ&nbsp;
            </NavLink>
            /&nbsp;
            <NavLink
              to="/dang-nhap"
              className="text-muted text-decoration-none"
            >
              Đăng nhập&nbsp;
            </NavLink>
            /&nbsp;
            <span className="fw-bold">Quên mật khẩu</span>
          </div>
        </Container>
      </div>

      <div className="forgot-password-container py-5">
        <Container>
          <div className="forgot-password-wrapper">
            <div className="forgot-password-box bg-white p-5 shadow rounded">
              <div className="text-center mb-4">
                <div className="forgot-icon mb-3">
                  <i className="bi bi-key-fill"></i>
                </div>
                <h1 className="forgot-title" style={{ color: "#198754" }}>
                  Quên mật khẩu?
                </h1>
                <p className="text-muted">
                  Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật
                  khẩu.
                </p>
              </div>

              {submitted ? (
                <div className="text-center">
                  <Alert variant="success">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến{" "}
                    <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
                  </Alert>
                  <p className="text-muted mt-3">
                    Không nhận được email?{" "}
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setSubmitted(false)}
                    >
                      Thử lại
                    </button>
                  </p>
                  <Link to="/dang-nhap" className="btn btn-success mt-3">
                    Quay lại đăng nhập
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  <Form.Group className="mb-4">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Nhập địa chỉ email của bạn"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="form-input"
                      autoComplete="email"
                      autoFocus
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="forgot-btn w-100 mb-3 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi yêu cầu"
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

export default ForgotPassword;
