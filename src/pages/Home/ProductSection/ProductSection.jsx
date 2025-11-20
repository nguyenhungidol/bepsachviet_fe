import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import "./ProductSection.css";
import ProductCard from "../../../components/ProductCard/ProductCard.jsx";
import { fetchProducts } from "../../../services/productService";

function ProductSection() {
  const [key, setKey] = useState("banchay");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProducts({ signal: controller.signal });
        setProducts(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Không thể tải danh sách sản phẩm.");
          console.error("Failed to fetch products", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    return () => controller.abort();
  }, []);

  const { bestSellers, newArrivals } = useMemo(() => {
    if (!products.length) {
      return { bestSellers: [], newArrivals: [] };
    }

    const best = products.filter((item) => item.isBestSeller);
    const newest = products.filter((item) => item.isNew);

    return {
      bestSellers: best.length ? best : products.slice(0, 4),
      newArrivals: newest.length ? newest : [...products].reverse().slice(0, 4),
    };
  }, [products]);

  const productsToShow = key === "banchay" ? bestSellers : newArrivals;

  return (
    <div className="product-section mt-2">
      <Container fluid className="product-section-container">
        {/* --- Banner --- */}
        <Row className="g-3 mb-4 banner-row">
          <Col xs={12} md={4}>
            <div className="top-banner">
              <img src="/3-1.png" alt="Banner 1" className="img-fluid" />
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner">
              <img
                src="/Maroon-and-Yellow-Modern-Food-Promotion-Banner-Landscape.png"
                alt="Banner 2"
                className="img-fluid"
              />
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="top-banner">
              <img src="/2-1.png" alt="Banner 3" className="img-fluid" />
            </div>
          </Col>
        </Row>

        {/* --- Tiêu đề + Tabs --- */}
        <Row className="product-section-header align-items-center mb-3 mt-5">
          <Col xs={12} md="auto">
            <h2 className="product-section-title">ĐẶC SẢN MỖI NGÀY</h2>
          </Col>

          <Col xs={12} md>
            <Tabs
              id="product-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="product-tabs-nav justify-content-start justify-content-md-end"
            >
              <Tab eventKey="banchay" title="Sản phẩm bán chạy" />
              <Tab eventKey="sanmoi" title="Sản phẩm mới" />
            </Tabs>
          </Col>
        </Row>

        {/* --- GRID sản phẩm (tự thay đổi theo Tab) --- */}
        {error && <p className="product-section-error">{error}</p>}
        {!error && (
          <>
            {loading && (
              <p className="product-section-status">Đang tải sản phẩm...</p>
            )}
            {!loading && !productsToShow.length && (
              <p className="product-section-status">
                Hiện chưa có sản phẩm để hiển thị.
              </p>
            )}
            <Row className="g-2 product-grid">
              {productsToShow.map((product) => (
                <Col key={product.id} xs={6} sm={3} lg>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default ProductSection;
