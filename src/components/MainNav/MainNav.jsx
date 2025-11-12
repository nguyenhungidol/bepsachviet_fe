// src/components/MainNav.jsx
import React from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  InputGroup,
  Button,
  FormControl,
} from "react-bootstrap";

function MainNav() {
  return (
    <Navbar expand="lg" className="main-navbar" variant="dark">
      <Container>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home" className="fw-bold">
              TRANG CHỦ
            </Nav.Link>
            <Nav.Link href="#products" className="fw-bold">
              SẢN PHẨM
            </Nav.Link>
            <Nav.Link href="#news" className="fw-bold">
              TIN TỨC
            </Nav.Link>
            <Nav.Link href="#about" className="fw-bold">
              GIỚI THIỆU
            </Nav.Link>
            <Nav.Link href="#recruit" className="fw-bold">
              TUYỂN ĐẠI LÝ
            </Nav.Link>
            <Nav.Link href="#contact" className="fw-bold">
              LIÊN HỆ
            </Nav.Link>
          </Nav>
          {/* Ô Tìm kiếm */}
          <Form className="d-flex">
            <InputGroup>
              <FormControl
                type="search"
                placeholder="Tìm kiếm..."
                aria-label="Search"
                style={{ width: "180px" }}
              />
              <Button variant="light">
                <i className="bi bi-search">🔍</i>
              </Button>
            </InputGroup>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNav;
