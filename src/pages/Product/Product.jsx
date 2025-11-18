import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../Home/Sidebar/Sidebar";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import "./Product.css";

// Dữ liệu sản phẩm
const products = [
  {
    id: 1,
    name: "Đặc sản Vân Đình: Vịt ủ xì dầu",
    price: "LIÊN HỆ",
    ocop: 3,
    img: "/VIT-U-XI-DAU-1-280x280.png",
  },
  {
    id: 2,
    name: "Đặc sản Vân Đình Vịt ủ xì dầu (Thủy Mạnh)",
    price: "LIÊN HỆ",
    ocop: 4,
    img: "/chavit_small1-280x280.jpg",
  },
  {
    id: 3,
    name: "Tai heo ủ xì dầu",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "/409210980_288991037472774_886226677564611827_n-400x400.jpg",
  },
  {
    id: 4,
    name: "Chân giò giả cầy",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "/cach-nau-gio-heo-gia-cay-cho-ong-xa-lai-rai-cung-ban-be-202205251515466728-280x280.jpg",
  },
  {
    id: 5,
    name: "Đặc sản chả chân vịt",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "/spmoi1.png",
  },
  {
    id: 6,
    name: "Đặc sản chả sụn",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "/spmoi2.png",
  },
];

// Dữ liệu “Có thể bạn thích”
const featuredProducts = [
  { name: "Chả ốc ống nứa", price: "0 ₫", img: "/placeholder_img_1" },
  {
    name: "Chả tôm - Bếp Sạch Việt",
    price: "Liên hệ",
    img: "/placeholder_img_2",
  },
  { name: "Ruốc tôm", price: "Liên hệ", img: "/placeholder_img_3" },
];

function Store() {
  return (
    <div className="store-page bg-light">
      {/* Breadcrumb hoặc header nếu cần */}
      <div className="page-header-top bg-gray-100 py-3 mb-4">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            Trang chủ » <span className="text-primary">Cửa hàng</span>
          </div>
        </Container>
      </div>

      {/* MAIN CONTENT AREA */}
      <Container className="main-store-content pb-5">
        {/* Header hiển thị số lượng + sắp xếp */}
        <div className="store-header mb-4">
          <div className="sort-filter-area">
            <span className="display-info">Hiển thị 1–12 trong 50 kết quả</span>
            <select className="sort-dropdown">
              <option>Mới nhất</option>
              <option>Giá: Thấp đến Cao</option>
              <option>Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>
        <Row className="g-4 align-items-start">
          {/* SIDEBAR */}
          <Col xs={12} lg={3}>
            <Sidebar />

            {/* Lọc sản phẩm */}
            <div className="sidebar-section mt-4 bg-white shadow-sm rounded">
              <h4 className="sidebar-heading green-bg text-white p-3 rounded-top">
                LỌC SẢN PHẨM
              </h4>
              <div className="p-3 price-filter-content">
                <div className="price-slider"></div>
                <p>
                  Giá: <span>0 ₫</span> — <span>175.000 ₫</span>
                </p>
                <button className="filter-button">LỌC</button>
              </div>
            </div>

            {/* Có thể bạn thích */}
            <div className="sidebar-section mt-4 bg-white shadow-sm rounded">
              <h4 className="sidebar-heading green-bg text-white p-3 rounded-top">
                CÓ THỂ BẠN SẼ THÍCH
              </h4>
              <div className="p-3">
                {featuredProducts.map((p, idx) => (
                  <div key={idx} className="featured-item d-flex mb-3">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="featured-image me-2"
                    />
                    <div className="featured-details">
                      <p className="featured-name mb-1">{p.name}</p>
                      <p className="featured-price mb-0">{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* MAIN PRODUCT GRID */}
          <Col xs={12} lg={9}>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination giả lập */}
            <div className="d-flex justify-content-center mt-5">
              <nav>
                <ul className="pagination">
                  <li className="page-item disabled">
                    <a className="page-link" href="#">
                      Trước
                    </a>
                  </li>
                  <li className="page-item active">
                    <a className="page-link" href="#">
                      1
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      2
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      3
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      ...
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      Sau
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Store;
