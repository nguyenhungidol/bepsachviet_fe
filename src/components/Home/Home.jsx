import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../Sidebar/Sidebar";
import Banner from "../Banner/Banner";
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <Container fluid className="home-container">
        <Row className="g-3">
          <Col xs={12} lg={3} className="sidebar-col">
            <Sidebar />
          </Col>

          <Col xs={12} lg={9} className="banner-col">
            <Banner />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
