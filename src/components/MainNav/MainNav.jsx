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
  const [isSticky, setIsSticky] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const timeoutRef = useRef(null);
  const navRef = useRef(null);

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

  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const shouldStick = currentY > 120;

        setIsSticky(shouldStick);
        setNavVisible(shouldStick || currentY < 10);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const navClassName = [
    "main-nav",
    isSticky ? "main-nav--sticky" : "",
    navVisible ? "main-nav--visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
      const params = new URLSearchParams();

      if (target) {
        params.set("categoryId", target);
      }

      if (name) {
        params.set("categoryName", name);
      }

      const queryString = params.toString();
      const linkTarget = queryString ? `/san-pham?${queryString}` : "/san-pham";

      return (
        <Dropdown.Item
          key={cat?.categoryId || slug}
          as={NavLink}
          to={linkTarget}
        >
          {name}
        </Dropdown.Item>
      );
    });
  };

  return (
    <>
      {isSticky && (
        <div
          className="main-nav-placeholder"
          style={{ height: navHeight }}
          aria-hidden="true"
        />
      )}
      <div ref={navRef} className={navClassName}>
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
    </>
  );
}

export default MainNav;
