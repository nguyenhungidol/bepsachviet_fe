import { useState, useEffect, useRef } from "react";
import { Container, Dropdown } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./MainNav.css";
import SearchBar from "./SearchBar/SearchBar";
import { fetchActiveCategories } from "../../services/categoryService";

function MainNav() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");
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
    }, 200); // 300ms delay trước khi ẩn
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const activeCategories = await fetchActiveCategories({
          signal: controller.signal,
        });
        setCategories(activeCategories);
        setCategoryError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch categories failed:", error);
          setCategoryError("Không tải được danh mục");
          setCategories([]);
        }
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
    return () => controller.abort();
  }, []);

  const renderDropdownItems = () => {
    if (loadingCategories) {
      return (
        <Dropdown.Item disabled className="text-muted">
          Đang tải danh mục...
        </Dropdown.Item>
      );
    }

    if (categoryError) {
      return (
        <Dropdown.Item disabled className="text-danger">
          {categoryError}
        </Dropdown.Item>
      );
    }

    if (!categories.length) {
      return (
        <Dropdown.Item disabled className="text-muted">
          Chưa có danh mục
        </Dropdown.Item>
      );
    }

    return categories.map((cat) => {
      const name = cat?.name || "Danh mục";
      const slug = (cat?.name || "san-pham").toLowerCase().replace(/\s+/g, "-");
      const target = cat?.categoryId ? cat.categoryId : slug;

      return (
        <Dropdown.Item
          key={cat?.categoryId || slug}
          as={NavLink}
          to={`/san-pham/${target}`}
        >
          {name}
        </Dropdown.Item>
      );
    });
  };

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
              <Dropdown.Toggle>
                <NavLink
                  to="/san-pham"
                  className={({ isActive }) =>
                    `nav-item  ${isActive ? "active" : ""}`
                  }
                >
                  SẢN PHẨM
                </NavLink>
              </Dropdown.Toggle>

              <Dropdown.Menu>{renderDropdownItems()}</Dropdown.Menu>
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
