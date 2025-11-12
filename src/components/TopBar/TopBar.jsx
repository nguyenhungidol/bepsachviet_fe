import React from 'react';
import { Container } from 'react-bootstrap';
import './TopBar.css';

function TopBar() {
  return (
    <div className="top-bar">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <div className="top-bar-left d-flex align-items-center gap-4">
          <div className="hotline-info">
            <i className="bi bi-telephone-fill"></i>
            <span className="ms-2">Hotline: 0868839655 | 0963538357</span>
          </div>
          <div className="address-info">
            <i className="bi bi-geo-alt-fill"></i>
            <span className="ms-2">91 Tam Khương, nhà số 2, P. Khương thượng, Q. Đống đa, HN.</span>
          </div>
        </div>
        <div className="top-bar-right">
          <a href="/login" className="text-white text-decoration-none">
            Đăng nhập
          </a>
          <span className="mx-2">/</span>
          <a href="/register" className="text-white text-decoration-none">
            Đăng ký
          </a>
        </div>
      </Container>
    </div>
  );
}

export default TopBar;
