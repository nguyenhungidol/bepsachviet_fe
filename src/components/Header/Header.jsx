// src/components/Header.jsx
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

function Header() {
  return (
    <>
      {/* 1. Thanh liên hệ trên cùng */}
      <div className="header-top border-bottom">
        <Container className="py-2">
          <div className="d-flex justify-content-between">
            <div className="d-flex gap-4">
              <span className="text-success">
                📞 Hotline: 086839655 | 0963538357
              </span>
              <span className="text-success">
                📍 91 Tam Khương, nhà số 2, P. Khương Thượng, Q. Đống Đa, HN.
              </span>
            </div>
            <div>
              <a href="#" className="text-decoration-none text-secondary">
                Đăng nhập
              </a>{" "}
              /{" "}
              <a href="#" className="text-decoration-none text-secondary">
                Đăng ký
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Thanh thông tin nổi bật (Top Bar Info) */}
      <Container className="my-3">
        <Row className="align-items-center">
          {/* Logo */}
          <Col md={3}>
            {/* Giả định Logo là text hoặc sử dụng ảnh placeholder */}
            <div className="d-flex align-items-center">
              <span className="fs-1 text-success">🌱</span>
              <div className="ms-2">
                <span
                  className="d-block fw-bold"
                  style={{ fontSize: "20px", color: "#1A8700" }}
                >
                  BẾP SẠCH VIỆT
                </span>
              </div>
            </div>
          </Col>
          {/* Các mục thông tin */}
          <Col md={7} className="d-flex justify-content-around">
            <div className="d-flex align-items-center gap-2">
              <span className="text-primary fs-3">🚛</span>
              <div className="small">
                <span className="d-block fw-bold">Miễn phí vận chuyển</span>
                <span className="text-muted">Bán kính 5km khi mua từ 5kg</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-warning fs-3">📧</span>
              <div className="small">
                <span className="d-block fw-bold">Hỗ trợ 24/7</span>
                <span className="text-muted">
                  Hotline: 086839655 | 0963538357
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-danger fs-3">⏰</span>
              <div className="small">
                <span className="d-block fw-bold">Giờ làm việc</span>
                <span className="text-muted">T2 - T7 Giờ hành chính</span>
              </div>
            </div>
          </Col>
          {/* Giỏ hàng */}
          <Col md={2} className="text-end">
            <Button variant="warning" className="fw-bold">
              🛒 Giỏ hàng
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Header;
