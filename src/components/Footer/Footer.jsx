import { Container, Row, Col } from "react-bootstrap";
import "./Footer.css";
import { useState, useEffect } from "react";
import FanpageBox from "./FanpageBox";

function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Cuộn mượt
    });
  };

  useEffect(() => {
    // Lắng nghe sự kiện cuộn
    window.addEventListener("scroll", toggleVisibility);

    // Dọn dẹp sự kiện khi component bị hủy
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {/* Phần chính của Footer - Nền Xanh Đậm */}
      <footer className="footer-main-section">
        <Container>
          <Row>
            {/* Cột 1: LIÊN HỆ */}
            <Col md={3} sm={6} xs={12} className="footer-col">
              <h5 className="footer-heading">LIÊN HỆ</h5>
              <p className="footer-contact-text">
                Chúng tôi cung cấp cấp đặc các sản vùng miền
              </p>
              <ul className="footer-contact-list list-unstyled">
                <li>
                  {/* Sử dụng một biểu tượng Home/Map đơn giản, hoặc Font Awesome nếu có */}
                  <i className="bi bi-house-door-fill"></i> 91 Tam Khương, nhà
                  số 2, P. Khương thượng, Q. Đống Đa, HN.
                </li>
                <li>
                  {/* Biểu tượng Phone */}
                  <i className="bi bi-telephone-fill"></i> Hotline: 0888339655 |
                  0963538357
                </li>
                <li>
                  {/* Biểu tượng Email */}
                  <i className="bi bi-envelope-fill"></i> Email:
                  bepsachviet@gmail.com
                </li>
                <li>
                  {/* Biểu tượng Facebook */}
                  <i className="bi bi-facebook"></i> Facebook:
                  fb.com/bepsachvietOfficial
                </li>
              </ul>
            </Col>

            {/* Cột 2: DANH MỤC */}
            <Col md={3} sm={6} xs={12} className="footer-col">
              <h5 className="footer-heading">DANH MỤC</h5>
              <ul className="footer-link-list list-unstyled">
                <li>
                  <a href="/">TRANG CHỦ</a>
                </li>
                <li>
                  <a href="/san-pham">
                    SẢN PHẨM <i className="bi bi-chevron-down"></i>
                  </a>
                </li>
                <li>
                  <a href="/tin-tuc">TIN TỨC</a>
                </li>
                <li>
                  <a href="/gioi-thieu">GIỚI THIỆU</a>
                </li>
                <li>
                  <a href="/tuyen-dai-ly">TUYỂN ĐẠI LÝ</a>
                </li>
                <li>
                  <a href="/lien-he">LIÊN HỆ</a>
                </li>
              </ul>
            </Col>

            {/* Cột 3: HỖ TRỢ KHÁCH HÀNG */}
            <Col md={3} sm={6} xs={12} className="footer-col">
              <h5 className="footer-heading">HỖ TRỢ KHÁCH HÀNG</h5>
              <ul className="footer-link-list list-unstyled">
                <li>
                  <a href="/don-hang-cua-toi">ĐƠN HÀNG CỦA TÔI</a>
                </li>
                <li>
                  <a href="/tai-khoan">TÀI KHOẢN</a>
                </li>
                <li>
                  <a href="/lien-he">HỖ TRỢ & LIÊN HỆ</a>
                </li>
                <li>
                  <a href="/gioi-thieu">VỀ CHÚNG TÔI</a>
                </li>
                <li>
                  <a href="/tuyen-dai-ly">CHÍNH SÁCH ĐẠI LÝ</a>
                </li>
              </ul>
            </Col>

            {/* Cột 4: KẾT NỐI VỚI BẾP SẠCH VIỆT */}
            <Col md={3} sm={6} xs={12} className="footer-col">
              <h5 className="footer-heading">KẾT NỐI VỚI BẾP SẠCH VIỆT</h5>
              <div className="footer-fanpage-box">
                <FanpageBox />
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Phần bản quyền - Nền Xanh Lá Cây Đậm Hơn */}
      <div className="footer-copyright-section">
        <Container>
          <Row className="align-items-center">
            <p className="copyright-text">
              Copyright 2025 © Giao diện Bếp sạch Việt
            </p>
          </Row>
        </Container>
      </div>
      <a
        href="#top"
        onClick={scrollToTop}
        className={`btn-scroll-top ${isVisible ? "show" : ""}`}
        title="Cuộn lên đầu trang"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-arrow-up-short"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5"
          />
        </svg>
      </a>
    </>
  );
}

export default Footer;
