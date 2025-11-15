import { useState, useRef } from "react";
import { Container, Dropdown } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./MainNav.css";
import SearchBar from "./SearchBar/SearchBar";

function MainNav() {
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 300); // 300ms delay trước khi ẩn
  };

  const isProductPage = window.location.pathname.startsWith("/san-pham");

  return (
    <div className="main-nav">
      <Container fluid>
        <div className="nav-content d-flex align-items-center justify-content-between">
          <div className="nav-left d-flex align-items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-item  ${isActive ? "active" : ""}`
              }
            >
              TRANG CHỦ
            </NavLink>

            <Dropdown
              show={showDropdown}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="nav-dropdown"
            >
              <Dropdown.Toggle
                className={`nav-item nav-item-dropdown ${
                  isProductPage ? "active" : ""
                }`}
              >
                <NavLink
                  to="/san-pham"
                  className={({ isActive }) =>
                    `nav-item  ${isActive ? "active" : ""}`
                  }
                >
                  SẢN PHẨM
                </NavLink>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={NavLink} to="/san-pham/tu-vit">
                  Sản phẩm tủ vịt
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/san-pham/tu-ga">
                  Sản phẩm tủ gà
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/san-pham/tu-heo">
                  Sản phẩm tủ heo
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/san-pham/tu-ngan">
                  Sản phẩm tủ ngán
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/san-pham/tu-ca">
                  Sản phẩm tủ cá
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <NavLink
              to="/tin-tuc"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              TIN TỨC
            </NavLink>

            <NavLink
              to="/gioi-thieu"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              GIỚI THIỆU
            </NavLink>

            <NavLink
              to="/tuyen-dai-ly"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              TUYỂN ĐẠI LÝ
            </NavLink>

            <NavLink
              to="/lien-he"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              LIÊN HỆ
            </NavLink>
          </div>

          <div className="nav-right">
            <SearchBar />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default MainNav;
