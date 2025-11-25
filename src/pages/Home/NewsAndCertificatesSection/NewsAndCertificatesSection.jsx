import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchPosts } from "../../../services/postService";
import "./NewsAndCertificatesSection.css"; // Đảm bảo tạo file CSS này

// Component con cho một thẻ Tin tức
const NewsCard = ({ post }) => (
  <div className="news-card">
    <div className="news-image-container">
      <Link to={`/tin-tuc/${post.slug}`}>
        <img src={post.thumbnailUrl} alt={post.title} className="news-image" />
      </Link>
    </div>
    <div className="news-content p-3">
      <h4 className="news-title">
        <Link to={`/tin-tuc/${post.slug}`}>{post.title}</Link>
      </h4>
      <p className="news-description">{post.shortDescription}</p>
      <Link to={`/tin-tuc/${post.slug}`} className="btn-readmore">
        Chi tiết
      </Link>
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
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLatestPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPosts({ page: 0, size: 3 });
      setLatestPosts(data.content || []);
    } catch (error) {
      console.error("Failed to load latest posts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatestPosts();
  }, [loadLatestPosts]);

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
          {loading && (
            <Col xs={12} className="text-center">
              <p>Đang tải tin tức...</p>
            </Col>
          )}
          {!loading && latestPosts.length === 0 && (
            <Col xs={12} className="text-center">
              <p className="text-muted">Chưa có bài viết nào.</p>
            </Col>
          )}
          {latestPosts.map((post) => (
            <Col xs={12} md={4} key={post.id}>
              <NewsCard post={post} />
            </Col>
          ))}
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
