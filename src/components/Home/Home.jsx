// src/components/Home.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./Sidebar";

function Home() {
  // Để mô phỏng banner, ta dùng div với background-color và text/placeholder
  const bannerStyle = {
    height: "350px",
    backgroundColor: "#F7E7C8", // Màu nền gần giống trong ảnh
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <Container className="mt-4">
      <Row>
        {/* Cột 1: Sidebar Menu (3/12 cột) */}
        <Col md={3}>
          <Sidebar />
        </Col>

        {/* Cột 2: Main Banner (9/12 cột) */}
        <Col md={9}>
          <div style={bannerStyle}>
            {/* Nội dung mô phỏng Banner */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%)",
              }}
            ></div>

            <div style={{ position: "relative", zIndex: 10, padding: "20px" }}>
              <h1 className="text-danger fw-bold" style={{ fontSize: "40px" }}>
                Combo ĐẶC SẢN VỊT VÂN ĐÌNH
              </h1>
              <p className="text-success fw-bold">0868.839.655</p>

              <div className="mt-4">
                {/* Placeholder cho các sản phẩm và QR Code */}
                <div className="d-flex justify-content-around align-items-center">
                  <span className="text-muted">[Hình ảnh Mộc Vịt]</span>
                  <span className="text-muted">[Hình ảnh Chả Vịt]</span>
                  <span className="border p-2 bg-white">[Mã QR]</span>
                  <span className="text-muted">[Hình ảnh Vịt ủ sả]</span>
                  <span className="text-muted">[Hình ảnh Chả Vịt]</span>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Phần Sứ mệnh ở dưới cùng */}
      <div className="footer-mission">
        <div className="fw-bold">SỨ MỆNH:</div>
        <p className="text-muted">[Nội dung Sứ mệnh website]</p>
      </div>
    </Container>
  );
}

export default Home;
