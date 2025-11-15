import "./Product.css";

// Dữ liệu giả lập
const categories = [
  "Sản phẩm từ vịt",
  "Sản phẩm từ gà",
  "Sản phẩm từ heo",
  "Sản phẩm từ ngan",
  "Sản phẩm từ cá",
  "Hải sản",
  "Các loại hạt",
  "Các loại nước",
  "Thực phẩm khác",
];

const featuredProducts = [
  { name: "Chả ốc ống nứa", price: "0 ₫", img: "placeholder_img_1" },
  {
    name: "Chả tôm - Bếp Sạch Việt",
    price: "Liên hệ",
    img: "placeholder_img_2",
  },
  { name: "Ruốc tôm", price: "Liên hệ", img: "placeholder_img_3" },
];

const products = [
  {
    id: 1,
    name: "Đặc sản Vân Đình: Vịt ủ xì dầu",
    price: "LIÊN HỆ",
    ocop: 3,
    img: "placeholder_vit_1",
  },
  {
    id: 2,
    name: "Đặc sản Vân Đình Vịt ủ xì dầu (Thủy Mạnh)",
    price: "LIÊN HỆ",
    ocop: 4,
    img: "placeholder_vit_2",
  },
  {
    id: 3,
    name: "Tai heo ủ xì dầu",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "placeholder_tai_heo",
  },
  {
    id: 4,
    name: "Chân giò giả cầy",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "placeholder_chan_gio",
  },
  {
    id: 5,
    name: "Đặc sản chả chân vịt",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "placeholder_cha_chan_vit",
  },
  {
    id: 6,
    name: "Đặc sản chả sụn",
    price: "LIÊN HỆ",
    ocop: 0,
    img: "placeholder_cha_sun",
  },
];

// Component Sản phẩm
const ProductCard = ({ product }) => (
  <div className="product-card">
    <div className="product-image-wrapper">
      {/*  */}
      <img
        src={`https://via.placeholder.com/250x250?text=${product.name.replace(
          / /g,
          "+"
        )}`}
        alt={product.name}
      />
    </div>
    <h3 className="product-title">{product.name}</h3>

    {product.ocop > 0 && (
      <div className="ocop-rating">
        {"★".repeat(product.ocop)}
        {"☆".repeat(5 - product.ocop)}
      </div>
    )}

    <p className="product-price">{product.price}</p>
    <a href="#" className="product-link">
      GIÁ BÁN: {product.price}
    </a>
  </div>
);

// Component chính
const Product = () => {
  return (
    <div className="store-page">
      <div className="store-header">
        <h1 className="page-title">CỬA HÀNG</h1>
        <div className="sort-filter-area">
          <span>Hiển thị 1–12 trong 50 kết quả</span>
          <select className="sort-dropdown">
            <option>Mới nhất</option>
            <option>Giá: Thấp đến Cao</option>
            <option>Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>

      <div className="store-layout">
        {/* Sidebar */}
        <div className="sidebar">
          {/* Danh mục sản phẩm */}
          <div className="sidebar-section">
            <h2 className="sidebar-heading green-bg">DANH MỤC SẢN PHẨM</h2>
            <ul className="category-list">
              {categories.map((cat, index) => (
                <li key={index} className="category-item">
                  <a href="#">{cat}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Lọc sản phẩm */}
          <div className="sidebar-section">
            <h2 className="sidebar-heading dark-green-bg">LỌC SẢN PHẨM</h2>
            <div className="price-filter-content">
              {/* Giả lập thanh trượt giá */}
              <div className="price-slider"></div>
              <p>
                Giá: <span>0 ₫</span> — <span>175.000 ₫</span>
              </p>
              <button className="filter-button">LỌC</button>
            </div>
          </div>

          {/* Có thể bạn thích */}
          <div className="sidebar-section">
            <h2 className="sidebar-heading green-bg">CÓ THỂ BẠN THÍCH</h2>
            <ul className="featured-list">
              {featuredProducts.map((p, index) => (
                <li key={index} className="featured-item">
                  <img
                    src={`https://via.placeholder.com/60x60?text=${p.img}`}
                    alt={p.name}
                    className="featured-image"
                  />
                  <div className="featured-details">
                    <p className="featured-name">{p.name}</p>
                    <p className="featured-price">{p.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Vùng sản phẩm chính */}
        <div className="main-content">
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
