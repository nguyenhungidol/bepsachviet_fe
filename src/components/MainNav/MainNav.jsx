import React, { useState } from "react";
import { Container, Form, InputGroup, FormControl, Dropdown } from "react-bootstrap";
import './MainNav.css';

function MainNav() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="main-nav">
      <Container fluid>
        <div className="nav-content d-flex align-items-center justify-content-between">
          <div className="nav-left d-flex align-items-center">
            <a href="/" className="nav-item nav-item-home active">
              TRANG CHỦ
            </a>

            <Dropdown
              show={showDropdown}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
              className="nav-dropdown"
            >
              <Dropdown.Toggle as="a" className="nav-item nav-item-dropdown">
                SẢN PHẨM
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#san-pham-tu-vit">Sản phẩm tủ vịt</Dropdown.Item>
                <Dropdown.Item href="#san-pham-tu-ga">Sản phẩm tủ gà</Dropdown.Item>
                <Dropdown.Item href="#san-pham-tu-heo">Sản phẩm tủ heo</Dropdown.Item>
                <Dropdown.Item href="#san-pham-tu-ngan">Sản phẩm tủ ngán</Dropdown.Item>
                <Dropdown.Item href="#san-pham-tu-ca">Sản phẩm tủ cá</Dropdown.Item>
                <Dropdown.Item href="#hai-san">Hải sản</Dropdown.Item>
                <Dropdown.Item href="#cac-loai-hat">Các loại hạt</Dropdown.Item>
                <Dropdown.Item href="#cac-loai-ruou">Các loại rượu</Dropdown.Item>
                <Dropdown.Item href="#thuc-pham-khac">Thực phẩm khác</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <a href="/tin-tuc" className="nav-item">
              TIN TỨC
            </a>
            <a href="/gioi-thieu" className="nav-item">
              GIỚI THIỆU
            </a>
            <a href="/tuyen-dai-ly" className="nav-item">
              TUYỂN ĐẠI LÝ
            </a>
            <a href="/lien-he" className="nav-item">
              LIÊN HỆ
            </a>
          </div>

          <div className="nav-right">
            <Form className="search-form">
              <InputGroup>
                <FormControl
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="search-input"
                />
                <button className="search-btn" type="submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
              </InputGroup>
            </Form>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default MainNav;
