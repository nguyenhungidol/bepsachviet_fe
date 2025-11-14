import React, { useState } from "react";
import {
  Container,
  Form,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "./MainNav.css";

function MainNav() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="main-nav">
      <Container fluid>
        <div className="nav-content d-flex align-items-center justify-content-between">
          <div className="nav-left d-flex align-items-center">
            <Link to="/" className="nav-item nav-item-home">
              TRANG CHỦ
            </Link>

            <Dropdown
              show={showDropdown}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
              className="nav-dropdown"
            >
              <Link to="/san-pham" className="nav-item">
                <Dropdown.Toggle className="nav-item nav-item-dropdown">
                  SẢN PHẨM
                </Dropdown.Toggle>
              </Link>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/san-pham/tu-vit">
                  Sản phẩm tủ vịt
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/san-pham/tu-ga">
                  Sản phẩm tủ gà
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/san-pham/tu-heo">
                  Sản phẩm tủ heo
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/san-pham/tu-ngan">
                  Sản phẩm tủ ngán
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/san-pham/tu-ca">
                  Sản phẩm tủ cá
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Link to="/tin-tuc" className="nav-item">
              TIN TỨC
            </Link>

            <Link to="/gioi-thieu" className="nav-item">
              GIỚI THIỆU
            </Link>

            <Link to="/tuyen-dai-ly" className="nav-item">
              TUYỂN ĐẠI LÝ
            </Link>

            <Link to="/lien-he" className="nav-item">
              LIÊN HỆ
            </Link>
          </div>

          <div className="nav-right">
            <Form className="search-form">
              <InputGroup>
                <FormControl
                  placeholder="Tìm kiếm..."
                  className="search-input"
                />
                <button className="search-btn" type="submit">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
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
