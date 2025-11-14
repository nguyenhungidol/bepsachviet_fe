import React, { useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import "./ProductSection.css"; // Đảm bảo tạo file CSS này

// Component con giả lập cho một thẻ sản phẩm
const ProductCard = ({ imageSrc, name, rating, price }) => (
  <div className="product-card">
    <div className="product-image-container">
      <img src={imageSrc} alt={name} className="product-image" />
    </div>
    <div className="product-info">
      <p className="product-name">{name}</p>
      {rating && (
        <div className="product-rating">
          {/* Giả lập icon OCOP và sao. Bạn nên dùng ảnh thật hoặc component rating */}
          <div className="ocop-logo">OCOP</div>
          <div className="stars">{rating}</div>
        </div>
      )}
      <p className="product-price">**GIÁ BÁN: LIÊN HỆ**</p>
    </div>
  </div>
);

function ProductSection() {
  const [key, setKey] = useState("banchay"); // State để quản lý tab đang hoạt động

  return (
    <div className="product-section mt-4">
      <Container fluid className="product-section-container">
        {/* Hàng 1: 3 Banners / Chứng nhận */}
        <Row className="g-3 mb-4 banner-row">
          <Col xs={12} md={4}>
            <div className="top-banner banner-gold">
              <p>Thương hiệu vàng nông nghiệp 2023</p>
              {/*  - Dùng icon nếu cần */}
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner banner-green">
              <p>CAM KẾT NGUỒN GỐC, XUẤT XỨ RÕ RÀNG OCOP</p>
              {/*  - Dùng ảnh thật */}
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner banner-orange">
              <p>KHÔNG HÀN THE, KHÔNG PHỤ GIA CẤM ISO 22000:2018</p>
              {/*  - Dùng ảnh thật */}
            </div>
          </Col>
        </Row>

        {/* Hàng 2: Đặc sản mới ngày (Dạng Sidebar) */}
        <Row className="g-3">
          {/* Cột 1: ĐẶC SẢN MỚI NGÀY (Cột bên trái) */}
          <Col xs={12} lg={3} className="sidebar-product-col mt-5">
            <h5 className="sidebar-product-heading">ĐẶC SẢN MỚI NGÀY</h5>
            {/* Thẻ sản phẩm mẫu đầu tiên */}
            <ProductCard
              imageSrc="/path/to/vit-u-xi-dau.png" // Thay thế bằng đường dẫn ảnh thật
              name="Đặc sản Vân Đình: Vịt ủ xì dầu"
              rating="⭐⭐⭐"
              price="LIÊN HỆ"
            />
          </Col>

          {/* Cột 2: Danh sách Sản phẩm bán chạy & Sản phẩm mới (Cột bên phải) */}
          <Col xs={12} lg={9} className="main-product-list-col">
            <Tabs
              id="product-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3 product-tabs-nav"
            >
              <Tab eventKey="banchay" title="Sản phẩm bán chạy">
                <Row className="g-4 product-grid">
                  {/* Sản phẩm 1: Đặc sản Vân Đình */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/dac-san-van-dinh-thuy-manh.png"
                      name="Đặc sản Vân Đình: Chả Thúy Mạnh"
                      rating="⭐⭐⭐⭐"
                      price="LIÊN HỆ"
                    />
                  </Col>

                  {/* Sản phẩm 2: Tai heo ủ xì dầu */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/tai-heo-u-xi-dau.png"
                      name="Tai heo ủ xì dầu"
                      price="LIÊN HỆ"
                    />
                  </Col>

                  {/* Sản phẩm 3: Chân giò giả cầy */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/chan-gio-gia-cay.png"
                      name="Chân giò giả cầy"
                      price="LIÊN HỆ"
                    />
                  </Col>
                  {/* Sản phẩm 4: Nem Phùng */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/nem-phung.png"
                      name="Nem Phùng"
                      price="LIÊN HỆ"
                    />
                  </Col>

                  {/* Thêm các thẻ sản phẩm khác ở đây */}
                  {/* ... */}
                </Row>
                <Row className="g-4 product-grid">
                  {/* Sản phẩm 4: Nem Phùng */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/nem-phung.png"
                      name="Nem Phùng"
                      price="LIÊN HỆ"
                    />
                  </Col>
                  {/* Sản phẩm 5: Bánh chưng gù Hà Giang */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/banh-chung-gu-ha-giang.png"
                      name="Bánh chưng gù Hà Giang"
                      price="LIÊN HỆ"
                    />
                  </Col>
                  {/* Sản phẩm 6: Chả ram tôm đất Bình Định */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/cha-ram-tom-dat-binh-dinh.png"
                      name="Chả ram tôm đất Bình Định"
                      price="LIÊN HỆ"
                    />
                  </Col>
                  {/* Sản phẩm 7: Trà hoa vàng Ba Chẽ */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/tra-hoa-vang-ba-che.png"
                      name="Trà hoa vàng Ba Chẽ"
                      price="LIÊN HỆ"
                    />
                  </Col>
                  {/* Sản phẩm 8: Bánh gai Tứ Trụ */}
                  <Col xs={12} sm={6} md={4} lg={3}>
                    <ProductCard
                      imageSrc="/path/to/banh-gai-tu-tru.png"
                      name="Bánh gai Tứ Trụ"
                      price="LIÊN HỆ"
                    />
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="sanmoi" title="Sản phẩm mới">
                {/* Nội dung cho tab Sản phẩm mới */}
                <p>Nội dung Sản phẩm mới sẽ được thêm tại đây...</p>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProductSection;
