import React, { useState } from 'react';
import { Carousel } from 'react-bootstrap';
import './Banner.css';

function Banner() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <div className="banner-wrapper">
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        interval={4000}
        pause="hover"
      >
        <Carousel.Item>
          <div className="banner-slide banner-slide-1">
            <div className="banner-content">
              <div className="qr-section">
                <div className="qr-text">
                  <h3>TIỆN LỢI VÀ ĐƯỢC TÍCH ĐIỂM KHI</h3>
                  <h3 className="text-success">ĐẶT HÀNG QUA ZALO MINIAPP</h3>
                </div>
                <div className="qr-code">
                  <div className="qr-placeholder">
                    <svg width="150" height="150" viewBox="0 0 150 150">
                      <rect width="150" height="150" fill="white"/>
                      <text x="75" y="75" textAnchor="middle" fontSize="12" fill="#666">QR CODE</text>
                    </svg>
                  </div>
                </div>
                <div className="contact-info">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#28a745" className="me-2">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span className="contact-numbers">0868839655 | 0963538357</span>
                </div>
              </div>
              <div className="product-showcase">
                <div className="showcase-text">NẾM CỦI</div>
              </div>
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div className="banner-slide banner-slide-2">
            <div className="banner-content">
              <h2 className="banner-title">Sản phẩm chất lượng cao</h2>
              <p className="banner-desc">Nguồn gốc rõ ràng, an toàn cho sức khỏe</p>
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <div className="banner-slide banner-slide-3">
            <div className="banner-content">
              <h2 className="banner-title">Giao hàng nhanh chóng</h2>
              <p className="banner-desc">Miễn phí vận chuyển trong bán kính 5km</p>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export default Banner;
