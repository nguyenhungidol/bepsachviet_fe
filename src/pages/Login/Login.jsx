import { useEffect, useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

import "./Login.css";
import { loginUser, saveAuthData } from "../../services/userService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const MAX_RECENT_LOGINS = 5;
  const navigate = useNavigate();

  const persistRecentAccounts = (accounts) => {
    try {
      localStorage.setItem("bv_recent_accounts", JSON.stringify(accounts));
    } catch (error) {
      console.warn("Failed to persist recent accounts", error);
    }
  };
  const loadRecentAccounts = () => {
    try {
      const raw = localStorage.getItem("bv_recent_accounts");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Failed to load recent accounts", error);
      return [];
    }
  };

  useEffect(() => {
    setRecentAccounts(loadRecentAccounts());
  }, []);

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

  const rememberAccount = (account) => {
    if (!account?.email) return;
    setRecentAccounts((prev) => {
      const filtered = prev.filter(
        (item) => item.email.toLowerCase() !== account.email.toLowerCase()
      );
      const next = [
        {
          email: account.email,
          name: account.name || account.email,
          lastLoginAt: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, MAX_RECENT_LOGINS);
      persistRecentAccounts(next);
      return next;
    });
  };

  const handleUseRecentAccount = (value) => {
    if (!value) return;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: "" }));
    setApiError("");
    setShowEmailSuggestions(false);
  };

  const handleEmailFocus = () => {
    if (recentAccounts.length > 0) {
      setShowEmailSuggestions(true);
    }
  };

  const handleEmailBlur = () => {
    setTimeout(() => setShowEmailSuggestions(false), 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({
        email,
        password,
        rememberMe,
      });

      toast.success("Đăng nhập thành công!");

      const userPayload = data.user || {
        email: data.email || email,
        role: data.role || "ROLE_USER",
        name: data.name || data.email?.split("@")[0] || email,
      };

      saveAuthData({
        token: data.token,
        user: userPayload,
        remember: rememberMe,
      });

      rememberAccount(userPayload);

      const normalizedRole = (userPayload.role || "ROLE_USER").toUpperCase();
      const nextPath = normalizedRole === "ROLE_ADMIN" ? "/admin" : "/";

      setTimeout(() => {
        navigate(nextPath, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page ">
      <div className="page-header-top bg-gray-100 py-3 ">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ&nbsp;
            </NavLink>{" "}
            /&nbsp; <span className="fw-bold">Đăng nhập</span>
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

              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-4">
                  <Form.Label className="form-label">
                    <span>Email *</span>
                  </Form.Label>
                  <div className="email-field-wrapper">
                    <Form.Control
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onFocus={handleEmailFocus}
                      onBlur={handleEmailBlur}
                      onChange={(e) => {
                        const next = e.target.value;
                        setEmail(next);
                        if (errors.email) setErrors({ ...errors, email: "" });
                        if (
                          next.trim().length === 0 &&
                          recentAccounts.length > 0
                        ) {
                          setShowEmailSuggestions(true);
                        } else {
                          setShowEmailSuggestions(false);
                        }
                      }}
                      isInvalid={!!errors.email}
                      className="form-input"
                      autoComplete="username"
                    />
                    {showEmailSuggestions && recentAccounts.length > 0 && (
                      <div className="email-suggestions">
                        {recentAccounts.map((account) => (
                          <button
                            type="button"
                            key={account.email}
                            className="email-suggestion"
                            onMouseDown={() =>
                              handleUseRecentAccount(account.email)
                            }
                          >
                            <span className="email-suggestion__name">
                              {account.name || account.email}
                            </span>
                            <span className="email-suggestion__email">
                              {account.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.email}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <span>Mật khẩu *</span>
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
                    autoComplete="current-password"
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
                  <Link to="/quen-mat-khau" className="forgot-password-link">
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
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Login;
