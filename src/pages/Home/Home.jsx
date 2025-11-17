import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./Sidebar/Sidebar";
import Banner from "./Banner/Banner";
import "./Home.css";
import AboutUsContent from "./AboutUsContent/AboutUsContent";
import ProductSection from "./ProductSection/ProductSection";
import NewsAndCertificatesSection from "./NewsAndCertificatesSection/NewsAndCertificatesSection";

function Home() {
  return (
    <div className="home-page">
      <Container fluid className="home-container">
        <Row className="g-3 align-items-start">
          <Col xs={12} lg={3} className="sidebar-col">
            <Sidebar />
          </Col>

          <Col xs={12} lg={9} className="banner-col">
            <Banner />
          </Col>
          <Col xs={12}>
            <AboutUsContent />
          </Col>
          <Col xs={12}>
            <ProductSection />
          </Col>
          <Col xs={12}>
            <NewsAndCertificatesSection />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
