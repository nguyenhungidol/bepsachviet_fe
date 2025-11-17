import { Container, Row, Col } from "react-bootstrap";
import "./NewsAndCertificatesSection.css"; // Đảm bảo tạo file CSS này

// Component con giả lập cho một thẻ Tin tức
const NewsCard = ({ imageSrc, title, description, link }) => (
  <div className="news-card">
    <div className="news-image-container">
      <img src={imageSrc} alt={title} className="news-image" />
    </div>
    <div className="news-content p-3">
      <h4 className="news-title">{title}</h4>
      <p className="news-description">{description}</p>
      <a href={link} className="btn-readmore">
        Chi tiết
      </a>
    </div>
  </div>
);

// Component con giả lập cho một Logo Chứng nhận
const CertificateLogo = ({ imageSrc, altText }) => (
  <Col xs={4} md={2} className="logo-col p-1 p-md-2">
    <div className="certificate-logo">
      <img src={imageSrc} alt={altText} className="img-fluid" />
    </div>
  </Col>
);

function NewsAndCertificatesSection() {
  return (
    <div className="news-and-certificates-section mt-5">
      <Container>
        {/* Phần 1: Tin Tức Cập Nhật */}
        <div className="text-center mb-4">
          <h2 className="section-title">TIN CẬP NHẬT</h2>
          <p className="section-subtitle">
            Tin tức từ bếp sạch Việt cập nhật mới nhất mỗi ngày cho bạn
          </p>
        </div>

        <Row className="g-4 news-grid mb-5">
          {/* Bài 1: Gà ủ muối */}
          <Col xs={12} md={4}>
            <NewsCard
              imageSrc="/Thiet-ke-chua-co-ten-1400x788.jpg"
              title="Tại Sao Nên Mua Gà Ủ Muối Tại Bếp Sạch Việt?"
              description="Trong những năm gần đây, gà ủ muối trở thành món ăn được nhiều người yêu thích nhờ..."
              link="/tin-tuc/ga-u-muoi"
            />
          </Col>

          {/* Bài 2: Chả vịt */}
          <Col xs={12} md={4}>
            <NewsCard
              imageSrc="/koreacandyyogurtkoreacandyyogurt-1-768x543.png"
              title="5 lý do tại sao Bạn Nên Chọn Mua Chả Vịt Từ Bếp Sạch Việt?"
              description="Trong vô vàn lựa chọn thực phẩm mỗi ngày, điều mà ai cũng mong muốn chính là bữa ăn vừa ngon..."
              link="/tin-tuc/cha-vit"
            />
          </Col>

          {/* Bài 3: Hạt và trái cây sấy */}
          <Col xs={12} md={4}>
            <NewsCard
              imageSrc="/ga-u-muoi-bep-sach-viet-768x576.webp"
              title="Ăn Uống Lành Mạnh Với Hạt Và Trái Cây Sấy – Bí Quyết Dinh Dưỡng Từ Bếp Sạch Việt"
              description="Các loại hạt và trái cây sấy khô không chỉ là món ăn vặt thơm ngon mà còn mang đến nguồn..."
              link="/tin-tuc/hat-trai-cay-say"
            />
          </Col>
        </Row>
      </Container>

      {/* Phần 2: Logo Chứng Nhận */}
      <Row className="flex-nowrap me-5">
        <CertificateLogo
          imageSrc="/photo_2023-11-23_17-45-43-510x532.jpg"
          altText="ISO 22000:2018"
        />

        {/* Logo 2: Đặc Sản Mộc Vịt Vân Đình */}
        <CertificateLogo
          imageSrc="/MOCVIT_LETTER.png"
          altText="Đặc Sản Mộc Vịt Vân Đình"
        />

        {/* Logo 3: OCOP */}
        <CertificateLogo imageSrc="/OCOCP.png" altText="OCOP" />

        {/* Logo 4: Đặc Sản Vân Đình */}
        <CertificateLogo
          imageSrc="/text1084-5.png"
          altText="Đặc Sản Vân Đình"
        />

        {/* Logo 5: HACCP */}
        <CertificateLogo imageSrc="/Badges-HACCP-510x510.png" altText="HACCP" />

        {/* Logo 6: Đặc Sản Chả Vịt Vân Đình */}
        <CertificateLogo
          imageSrc="/text1085-6-1400x407.png"
          altText="Đặc Sản Chả Vịt Vân Đình"
        />
      </Row>
    </div>
  );
}

export default NewsAndCertificatesSection;
