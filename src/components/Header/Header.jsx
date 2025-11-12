import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import './Header.css';

function Header() {
  return (
    <div className="header-main bg-white py-3 border-bottom">
      <Container fluid>
        <Row className="align-items-center">
          {/* Logo */}
          <Col xs={12} md={3} lg={2} className="mb-3 mb-md-0">
            <div className="logo-wrapper d-flex align-items-center">
              <div className="logo-circle">
                <span className="logo-icon">🌱</span>
              </div>
              <div className="logo-text ms-2">
                <div className="logo-name">FKV</div>
                <div className="logo-subtitle">BẾP SẠCH VIỆT</div>
              </div>
            </div>
          </Col>

          {/* Service Icons */}
          <Col xs={12} md={7} lg={8}>
            <Row className="g-2">
              <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                <div className="service-item d-flex align-items-center">
                  <div className="service-icon shipping-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#FFE8CC"/>
                      <path d="M12 18H20V24H12V18Z M22 18H28L30 22V24H22V18Z M11 24C11 25.1 11.9 26 13 26C14.1 26 15 25.1 15 24M25 24C25 25.1 25.9 26 27 26C28.1 26 29 25.1 29 24" stroke="#FF8C00" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="service-text ms-2">
                    <div className="service-title">Miễn phí vận chuyển</div>
                    <div className="service-desc">Bán kính 5 km khi mua từ 5kg</div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                <div className="service-item d-flex align-items-center">
                  <div className="service-icon support-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#FFE0B2"/>
                      <path d="M20 12C16.13 12 13 15.13 13 19V24H17V19H15.5C15.5 16.24 17.74 14 20.5 14C23.26 14 25.5 16.24 25.5 19H24V24H28V19C28 15.13 24.87 12 21 12H20Z M18 26H22V28H18V26Z" fill="#FF6F00"/>
                    </svg>
                  </div>
                  <div className="service-text ms-2">
                    <div className="service-title">Hỗ trợ 24/7</div>
                    <div className="service-desc">Hotline: 0868839655 | 0963538357</div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={4}>
                <div className="service-item d-flex align-items-center">
                  <div className="service-icon time-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#FFCDD2"/>
                      <circle cx="20" cy="20" r="8" stroke="#E53935" strokeWidth="2"/>
                      <path d="M20 16V20L23 23" stroke="#E53935" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="service-text ms-2">
                    <div className="service-title">Giờ làm việc</div>
                    <div className="service-desc">T2 - T7 Giờ hành chính</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>

          {/* Cart Button */}
          <Col xs={12} md={2} className="text-end mt-3 mt-md-0">
            <Button className="cart-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white" className="me-2">
                <path d="M6 16C4.9 16 4.01 16.9 4.01 18C4.01 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16ZM0 0V2H2L5.6 9.59L4.25 12.04C4.09 12.32 4 12.65 4 13C4 14.1 4.9 15 6 15H18V13H6.42C6.28 13 6.17 12.89 6.17 12.75L6.2 12.63L7.1 11H14.55C15.3 11 15.96 10.59 16.3 9.97L19.88 3.48C19.96 3.34 20 3.17 20 3C20 2.45 19.55 2 19 2H4.21L3.27 0H0ZM16 16C14.9 16 14.01 16.9 14.01 18C14.01 19.1 14.9 20 16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16Z"/>
              </svg>
              Giỏ hàng
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Header;
