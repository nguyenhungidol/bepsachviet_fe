import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./News.css"; // File CSS cho trang Tin Tức

// Component con: Thẻ Bài viết nhỏ (Dùng cho Tin nổi bật)
const FeaturedNewsItem = ({ imageSrc, title, link }) => (
  <a
    href={link}
    className="featured-news-item d-flex align-items-center mb-3 text-decoration-none"
  >
    <img src={imageSrc} alt={title} className="featured-news-img me-3" />
    <p className="featured-news-title mb-0">{title}</p>
  </a>
);

// Component con: Thẻ Bài viết lớn (Dùng cho Danh sách chính)
const ArticleCard = ({ imageSrc, title, excerpt, link }) => (
  <div className="article-card d-flex mb-4 p-3 border rounded shadow-sm">
    <img
      src={imageSrc}
      alt={title}
      className="article-img me-4 flex-shrink-0"
    />
    <div className="article-content">
      <h3 className="article-title">{title}</h3>
      <p className="article-excerpt">{excerpt}</p>
      <a href={link} className="btn-read-more">
        Đọc tiếp...
      </a>
    </div>
  </div>
);

// Component con: Thẻ Sản phẩm liên quan (Dùng cho "Có thể bạn sẽ thích")
const RelatedProductCard = ({ imageSrc, name, rating, price, link }) => (
  <a
    href={link}
    className="related-product-card d-block text-decoration-none mb-3"
  >
    <div className="d-flex align-items-center">
      <img src={imageSrc} alt={name} className="related-product-img me-3" />
      <div className="related-product-info">
        <p className="related-product-name mb-1">{name}</p>
        <div className="related-product-rating text-warning mb-1">{rating}</div>
        <p className="related-product-price mb-0">{price}</p>
      </div>
    </div>
  </a>
);

function News() {
  return (
    <div className="news-page bg-light">
      {/* Breadcrumb và Header Top Bar (Giả lập) */}
      <div className="page-header-top bg-gray-100 py-3 mb-4">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            Trang chủ » <span className="text-primary">Tin tức</span>
          </div>
        </Container>
      </div>

      <Container className="main-content-area pb-5">
        <Row className="g-4">
          {/* Cột 1: SIDEBAR (lg=3) */}
          <Col xs={12} lg={3}>
            {/* 1. DANH MỤC SẢN PHẨM */}
            <div className="sidebar-section mb-4 bg-white shadow-sm rounded">
              <h4 className="sidebar-heading bg-success text-white p-3 rounded-top">
                DANH MỤC SẢN PHẨM
              </h4>
              <ul className="list-unstyled sidebar-list p-3">
                <li>
                  <a href="#vit">Sản phẩm tủ vịt</a>
                </li>
                <li>
                  <a href="#ga">Sản phẩm tủ gà</a>
                </li>
                <li>
                  <a href="#heo">Sản phẩm tủ heo</a>
                </li>
                <li>
                  <a href="#ngan">Sản phẩm tủ ngan</a>
                </li>
                <li>
                  <a href="#ca">Sản phẩm tủ cá</a>
                </li>
                <li>
                  <a href="#haisan">Hải sản</a>
                </li>
                <li>
                  <a href="#hat">Các loại hạt</a>
                </li>
                <li>
                  <a href="#ruou">Các loại rượu</a>
                </li>
                <li>
                  <a href="#khac">Thực phẩm khác</a>
                </li>
              </ul>
            </div>

            {/* 2. TIN NỔI BẬT */}
            <div className="sidebar-section mb-4 bg-white shadow-sm rounded">
              <h4 className="sidebar-heading bg-success text-white p-3 rounded-top">
                TIN NỔI BẬT
              </h4>
              <div className="p-3">
                <FeaturedNewsItem
                  imageSrc="/path/to/ga-u-muoi-thumb.png"
                  title="Tại Sao Nên Mua Gà Ủ Muối Tại Bếp Sạch Việt?"
                  link="/tin-tuc/ga-u-muoi"
                />
                <FeaturedNewsItem
                  imageSrc="/path/to/cha-vit-thumb.png"
                  title="5 lý do tại sao Nên Chọn Mua Chả Vịt Từ Bếp Sạch Việt"
                  link="/tin-tuc/cha-vit"
                />
                <FeaturedNewsItem
                  imageSrc="/path/to/hat-say-thumb.png"
                  title="Ăn Uống Lành Mạnh Với Hạt Và Trái Cây Sấy – Bí Quyết Dinh Dưỡng Từ Bếp Sạch Việt"
                  link="/tin-tuc/hat-say"
                />
                {/* Thêm các bài viết nổi bật khác */}
                <FeaturedNewsItem
                  imageSrc="/path/to/hanh-trinh-thumb.png"
                  title="Hành trình gìn giữ hương vị Việt cùng Bếp sạch Việt"
                  link="/tin-tuc/hanh-trinh-viet"
                />
                <FeaturedNewsItem
                  imageSrc="/path/to/cha-vit-vang-thumb.png"
                  title="“Chả vịt Thúy Mạnh” được tôn vinh Thương hiệu Vàng nông nghiệp Việt Nam 2023"
                  link="/tin-tuc/thuong-hieu-vang"
                />
              </div>
            </div>

            {/* 3. CÓ THỂ BẠN SẼ THÍCH (Sản phẩm liên quan) */}
            <div className="sidebar-section mb-4 bg-white shadow-sm rounded">
              <h4 className="sidebar-heading bg-success-dark text-white p-3 rounded-top">
                CÓ THỂ BẠN SẼ THÍCH
              </h4>
              <div className="p-3">
                <RelatedProductCard
                  imageSrc="/path/to/vit-u-xi-dau-thumb.png"
                  name="Đặc sản Vân Đình: Vịt ủ xì dầu"
                  rating="⭐⭐⭐"
                  price="0 đ"
                  link="/san-pham/vit-u-xi-dau"
                />
                <RelatedProductCard
                  imageSrc="/path/to/cha-vit-thuymanh-thumb.png"
                  name="Đặc sản Vân Đình: Chả vịt Thúy Mạnh"
                  rating="⭐⭐⭐⭐"
                  price="0 đ"
                  link="/san-pham/cha-vit-thuymanh"
                />
                <RelatedProductCard
                  imageSrc="/path/to/tai-heo-thumb.png"
                  name="Tai heo ủ xì dầu"
                  rating="⭐⭐"
                  price="0 đ"
                  link="/san-pham/tai-heo"
                />
              </div>
            </div>
          </Col>

          {/* Cột 2: NỘI DUNG CHÍNH (lg=9) */}
          <Col xs={12} lg={9}>
            {/* Danh sách Bài viết chính */}
            <div className="article-list">
              <ArticleCard
                imageSrc="/path/to/ga-u-muoi-large.png"
                title="Tại Sao Nên Mua Gà Ủ Muối Tại Bếp Sạch Việt?"
                excerpt="Trong những năm gần đây, gà ủ muối trở thành món ăn được nhiều người yêu thích nhờ hương vị đậm đà, thịt gà chắc ngọt, cùng..."
                link="/tin-tuc/ga-u-muoi"
              />

              <ArticleCard
                imageSrc="/path/to/cha-vit-large.png"
                title="5 lý do tại sao Bạn Nên Chọn Mua Chả Vịt Từ Bếp Sạch Việt?"
                excerpt="Trong vô vàn lựa chọn thực phẩm mỗi ngày, điều mà ai cũng mong muốn chính là bữa ăn vừa ngon miệng, vừa an toàn và giàu dinh dưỡng. Đó..."
                link="/tin-tuc/cha-vit"
              />

              <ArticleCard
                imageSrc="/path/to/mon-ngon-large.png"
                title="Hành trình gìn giữ hương vị Việt cùng Bếp sạch Việt"
                excerpt="Ẩm thực Việt Nam từ đâu đã được, ví như bản giao hưởng của sắc màu và hương vị. Từ bữa cơm quê mộc mạc đến những món ăn cung..."
                link="/tin-tuc/hanh-trinh-viet"
              />

              {/* Hàng 3 Cột Banner/Tin tức */}
              <Row className="g-3 mb-4">
                <Col md={4} xs={12}>
                  <div className="news-banner-card bg-orange-100 p-3 rounded shadow-sm text-center">
                    <h5 className="font-weight-bold">
                      Festival nông sản Hà nội lần 2 tại Ưng Hòa
                    </h5>
                    <p className="text-sm">
                      Chiều tối 19/07/2023, Festival nông sản Hà nội lần 2 tại
                      Ưng Hòa chính thức khai mạc. Gian hàng của Thúy Mạnh Food
                      vinh dự được bộ trưởng Bộ NN&PTNT...
                    </p>
                  </div>
                </Col>
                <Col md={4} xs={12}>
                  {/* Placeholder Banner */}
                  <div className="news-banner-card bg-green-100 p-3 rounded shadow-sm text-center">
                    <h5 className="font-weight-bold">
                      FESTIVAL NÔNG SẢN HÀ NỘI
                    </h5>
                  </div>
                </Col>
                <Col md={4} xs={12}>
                  {/* Placeholder Banner */}
                  <div className="news-banner-card bg-red-100 p-3 rounded shadow-sm text-center">
                    <h5 className="font-weight-bold">
                      FESTIVAL NÔNG SẢN HÀ NỘI
                    </h5>
                  </div>
                </Col>
              </Row>

              <ArticleCard
                imageSrc="/path/to/cha-chan-vit-large.png"
                title="Món mới: Chả chân vịt Thúy Mạnh"
                excerpt="MÓN MỚI! MÓN MỚI!! Chân vịt và các bộ phận khác của vịt đều là món ăn ngon khoái khẩu của nhiều người. Nếu chân vịt được chế biến..."
                link="/tin-tuc/cha-chan-vit"
              />

              <ArticleCard
                imageSrc="/path/to/moc-vit-large.png"
                title="Mộc vịt – một đặc sản của Vân Đình chưa nhiều người biết đến"
                excerpt="Bếp sạch Việt mới ra mắt mộc vịt Vân Đình – Một đặc sản khác của Vân Đình ít người biết đến. Mộc vịt có thể dùng để nấu với canh..."
                link="/tin-tuc/moc-vit"
              />

              <ArticleCard
                imageSrc="/path/to/vit-co-van-dinh-large.png"
                title="Vịt cỏ Vân Đình"
                excerpt="Vịt cỏ Vân Đình là giống vịt cỏ bản địa được chăn thả theo hình thức truyền thống trên các đồng chiêm của huyện Ứng Hòa, Vân Đình, Hà Nội..."
                link="/tin-tuc/vit-co-van-dinh"
              />
            </div>

            {/* Pagination (Giả lập) */}
            <div className="d-flex justify-content-center mt-5">
              {/* Dùng các lớp Bootstrap cho phân trang */}
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

export default News;
