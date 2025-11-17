import { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/v1.0/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          rememberMe: rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiSuccess("Đăng nhập thành công!");

        // Store token if provided
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        // Store user info if provided
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setApiError(data.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setApiError(
        "Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page ">
      <div className="page-header-top bg-gray-100 py-3 ">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            Trang chủ » <span className="text-primary">Đăng nhập</span>
          </div>
        </Container>
      </div>

      <div className="login-container py-5">
        <Container>
          <div className="login-wrapper">
            <div className="login-box bg-white p-5 shadow rounded">
              <h1
                className="login-title text-center mb-4"
                style={{ color: "#198754" }}
              >
                Đăng Nhập
              </h1>

              {/* Success Alert */}
              {apiSuccess && (
                <Alert variant="success" className="mb-3" role="alert">
                  {apiSuccess}
                </Alert>
              )}

              {/* Error Alert */}
              {apiError && (
                <Alert variant="danger" className="mb-3" role="alert">
                  {apiError}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-4">
                  <Form.Label className="form-label">
                    <span className="text-danger">Email*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    isInvalid={!!errors.email}
                    className="form-input"
                  />
                  {errors.email && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.email}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <span className="text-danger">Mật khẩu *</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: "" });
                    }}
                    isInvalid={!!errors.password}
                    className="form-input"
                  />
                  {errors.password && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.password}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label="Ghi nhớ tôi"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="remember-me"
                  />
                  <Link to="#" className="forgot-password-link">
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="login-btn w-100 mb-3 py-2"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="signup-text">
                    Chưa có tài khoản?{" "}
                    <Link to="/dang-ky" className="signup-link">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </form>

              {/* Social Login (Optional) */}
              <div className="social-login mt-4 pt-4 border-top">
                <p className="text-center text-muted mb-3">
                  Hoặc đăng nhập bằng
                </p>
                <div className="d-flex gap-3">
                  <Button className="social-btn facebook-btn flex-grow-1">
                    <i className="bi bi-facebook"></i> Facebook
                  </Button>
                  <Button className="social-btn google-btn flex-grow-1">
                    <i className="bi bi-google"></i> Google
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Login;
