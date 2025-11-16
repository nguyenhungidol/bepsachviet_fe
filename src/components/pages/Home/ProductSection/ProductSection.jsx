import React, { useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import "./ProductSection.css"; // Đảm bảo tạo file CSS này

const ProductCard = ({
  imageSrc,
  name,
  rating,
  price = "LIÊN HỆ",
  ocUrl, // Sử dụng 1 link duy nhất cho cả logo OCOP và rating
}) => (
  <div className="product-card">
    <div className="product-image-container">
      <img src={imageSrc} alt={name} className="product-image" />
    </div>
    <div className="product-info">
      <p className="product-name">{name}</p>
      {ocUrl && (
        <div className="product-rating">
          <img src={ocUrl} alt="OCOP Rating" className="rating-image" />
        </div>
      )}
      <p className="product-price">GIÁ BÁN: {price}</p>
    </div>
  </div>
);

function ProductSection() {
  const [key, setKey] = useState("banchay"); // State để quản lý tab đang hoạt động

  return (
    <div className="product-section mt-2">
      <Container fluid className="product-section-container">
        {/* Hàng 1: 3 Banners / Chứng nhận */}
        <Row className="g-3 mb-4 banner-row">
          <Col xs={12} md={4}>
            <div className="top-banner ">
              <img
                src="/3-1.png"
                alt="Thương hiệu vàng nông nghiệp 2023"
                className="img-fluid"
              />
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner ">
              <img
                src="/Maroon-and-Yellow-Modern-Food-Promotion-Banner-Landscape.png"
                alt="Cam kết nguồn gốc OCOP"
                className="img-fluid"
              />
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner ">
              <img src="/2-1.png" alt="ISO 22000:2018" className="img-fluid" />
            </div>
          </Col>
        </Row>
        {/* Hàng 2: Đặc sản mới ngày (Dạng Sidebar) */}

        <div className="product-section-container ">
          {/* HÀNG 1: Tiêu đề và Tabs (như trong hình) */}
          <Row className="product-section-header align-items-center mb-3 mt-5">
            {/* Cột Tiêu đề */}
            <Col xs={12} md="auto">
              <h2 className="product-section-title">ĐẶC SẢN MỖI NGÀY</h2>
            </Col>

            {/* Cột Tabs (căn phải) */}
            <Col xs={12} md>
              <Tabs
                id="product-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="product-tabs-nav justify-content-start justify-content-md-end"
              >
                <Tab eventKey="banchay" title="Sản phẩm bán chạy" />
                <Tab eventKey="sanmoi" title="Sản phẩm mới" />
              </Tabs>
            </Col>
          </Row>

          <Row className="g-2 product-grid">
            {/* Sản phẩm 1: Vịt ủ xì dầu */}
            <Col xs={6} sm={3} lg>
              <ProductCard
                imageSrc="/VIT-U-XI-DAU-1-280x280.png"
                name="Đặc sản Vân Đình: Vịt ủ xì dầu"
                ocUrl="/ocop3.png"
                price="LIÊN HỆ"
              />
            </Col>

            {/* Sản phẩm 2: Chả Thúy Mạnh */}
            <Col xs={6} sm={3} lg>
              <ProductCard
                imageSrc="/chavit_small1-280x280.jpg"
                name="Đặc sản Vân Đình: Chả Thúy Mạnh"
                price="LIÊN HỆ"
                ocUrl="/ocop.png"
              />
            </Col>

            {/* Sản phẩm 3: Tai heo ủ xì dầu */}
            <Col xs={6} sm={3} lg>
              <ProductCard
                imageSrc="/409210980_288991037472774_886226677564611827_n-400x400.jpg"
                name="Tai heo ủ xì dầu"
                price="LIÊN HỆ"
              />
            </Col>

            {/* Sản phẩm 4: Chân giò giả cầy */}
            <Col xs={6} sm={3} lg>
              <ProductCard
                imageSrc="/cach-nau-gio-heo-gia-cay-cho-ong-xa-lai-rai-cung-ban-be-202205251515466728-280x280.jpg"
                name="Chân giò giả cầy"
                price="LIÊN HỆ"
              />
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default ProductSection;
