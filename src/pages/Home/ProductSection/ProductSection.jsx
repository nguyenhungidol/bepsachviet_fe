import { useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import "./ProductSection.css";
import ProductCard from "../../../components/ProductCard/ProductCard.jsx";

function ProductSection() {
  const [key, setKey] = useState("banchay");

  // -------------------------
  // 1️⃣ Danh sách sản phẩm
  // -------------------------

  const bestSellers = [
    {
      imageSrc: "/VIT-U-XI-DAU-1-280x280.png",
      name: "Đặc sản Vân Đình: Vịt ủ xì dầu",
      ocUrl: "/ocop3.png",
      price: "LIÊN HỆ",
    },
    {
      imageSrc: "/chavit_small1-280x280.jpg",
      name: "Đặc sản Vân Đình: Chả Thúy Mạnh",
      ocUrl: "/ocop.png",
      price: "LIÊN HỆ",
    },
    {
      imageSrc: "/409210980_288991037472774_886226677564611827_n-400x400.jpg",
      name: "Tai heo ủ xì dầu",
      price: "LIÊN HỆ",
    },
    {
      imageSrc:
        "/cach-nau-gio-heo-gia-cay-cho-ong-xa-lai-rai-cung-ban-be-202205251515466728-280x280.jpg",
      name: "Chân giò giả cầy",
      price: "LIÊN HỆ",
    },
  ];

  const newProducts = [
    {
      imageSrc: "/spmoi1.png",
      name: "Đặc sản mới 1",
      ocUrl: "/ocop.png",
      price: "LIÊN HỆ",
    },
    {
      imageSrc: "/spmoi2.png",
      name: "Đặc sản mới 2",
      price: "LIÊN HỆ",
    },
    {
      imageSrc: "/spmoi3.png",
      name: "Đặc sản mới 3",
      price: "LIÊN HỆ",
    },
    {
      imageSrc: "/spmoi4.png",
      name: "Đặc sản mới 4",
      price: "LIÊN HỆ",
    },
  ];

  // Chọn danh sách dựa trên tab
  const productsToShow = key === "banchay" ? bestSellers : newProducts;

  return (
    <div className="product-section mt-2">
      <Container fluid className="product-section-container">
        {/* --- Banner --- */}
        <Row className="g-3 mb-4 banner-row">
          <Col xs={12} md={4}>
            <div className="top-banner">
              <img src="/3-1.png" alt="Banner 1" className="img-fluid" />
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner">
              <img
                src="/Maroon-and-Yellow-Modern-Food-Promotion-Banner-Landscape.png"
                alt="Banner 2"
                className="img-fluid"
              />
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner">
              <img src="/2-1.png" alt="Banner 3" className="img-fluid" />
            </div>
          </Col>
        </Row>

        {/* --- Tiêu đề + Tabs --- */}
        <Row className="product-section-header align-items-center mb-3 mt-5">
          <Col xs={12} md="auto">
            <h2 className="product-section-title">ĐẶC SẢN MỖI NGÀY</h2>
          </Col>

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

        {/* --- GRID sản phẩm (tự thay đổi theo Tab) --- */}
        <Row className="g-2 product-grid">
          {productsToShow.map((product, index) => (
            <Col key={index} xs={6} sm={3} lg>
              <ProductCard {...product} />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default ProductSection;
