import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, NavLink, useSearchParams, useNavigate } from "react-router-dom";

import "./Search.css";
import Sidebar from "../Home/Sidebar/Sidebar";
import ProductCard from "../../components/ProductCard/ProductCard";
import LikeProduct from "../../components/LikeProduct/LikeProduct";
import { fetchProducts } from "../../services/productService";
import { fetchPosts } from "../../services/postService";

// Article card for search results
const SearchArticleCard = ({ post }) => (
  <div className="search-article-card">
    <Link to={`/tin-tuc/${post.slug}`}>
      <img src={post.thumbnailUrl} alt={post.title} />
    </Link>
    <div className="card-body">
      <h5 className="card-title">
        <Link to={`/tin-tuc/${post.slug}`}>{post.title}</Link>
      </h5>
      <p className="card-text">{post.shortDescription}</p>
      <span className="card-meta">
        {post.author} •{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("vi-VN")
          : ""}
      </span>
    </div>
  </div>
);

function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchTerm = (searchParams.get("q") || "").trim();

  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  const loading = loadingProducts || loadingPosts;

  // Search products
  const searchProducts = useCallback(async () => {
    if (!searchTerm) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    try {
      const allProducts = await fetchProducts({ search: searchTerm });
      const normalizedTerm = searchTerm.toLowerCase();

      // Filter products that match the search term
      const filtered = allProducts.filter((item) => {
        const name = item?.name?.toLowerCase?.() || "";
        const description = item?.description?.toLowerCase?.() || "";
        return (
          name.includes(normalizedTerm) || description.includes(normalizedTerm)
        );
      });

      setProducts(filtered);
    } catch (error) {
      console.error("Failed to search products", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [searchTerm]);

  // Search posts - only match by title
  const searchPosts = useCallback(async () => {
    if (!searchTerm) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    try {
      const result = await fetchPosts({ search: searchTerm, size: 20 });
      const normalizedTerm = searchTerm.toLowerCase();

      // Filter posts that match the search term in title only
      const filtered = (result.content || []).filter((item) => {
        const title = item?.title?.toLowerCase?.() || "";
        return title.includes(normalizedTerm);
      });

      setPosts(filtered);
    } catch (error) {
      console.error("Failed to search posts", error);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [searchTerm]);

  // Load suggested products
  const loadSuggested = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setSuggestedProducts(data.slice(0, 5));
    } catch (error) {
      console.error("Failed to load suggested products", error);
    }
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      navigate("/", { replace: true });
      return;
    }
    searchProducts();
    searchPosts();
  }, [searchTerm, searchProducts, searchPosts, navigate]);

  useEffect(() => {
    loadSuggested();
  }, [loadSuggested]);

  // Redirect logic after loading completes
  useEffect(() => {
    if (loading || !searchTerm) return;

    const hasProducts = products.length > 0;
    const hasPosts = posts.length > 0;

    // If only posts, redirect to news page with search
    if (!hasProducts && hasPosts) {
      navigate(`/tin-tuc?search=${encodeURIComponent(searchTerm)}`, {
        replace: true,
      });
      return;
    }

    // If only products, redirect to product page with search
    if (hasProducts && !hasPosts) {
      navigate(`/san-pham?search=${encodeURIComponent(searchTerm)}`, {
        replace: true,
      });
      return;
    }
  }, [loading, products, posts, searchTerm, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="search-results-page bg-light">
        <div className="page-header-top bg-gray-100 py-3 mb-4">
          <Container>
            <nav className="breadcrumb text-sm text-muted mb-0">
              <NavLink to="/" className="text-muted text-decoration-none">
                Trang chủ
              </NavLink>
              <span className="mx-2">/</span>
              <span className="fw-bold">Tìm kiếm</span>
            </nav>
          </Container>
        </div>
        <Container className="pb-5">
          <div className="search-loading">
            <div className="spinner"></div>
            <p>Đang tìm kiếm "{searchTerm}"...</p>
          </div>
        </Container>
      </div>
    );
  }

  const hasProducts = products.length > 0;
  const hasPosts = posts.length > 0;
  const hasResults = hasProducts || hasPosts;

  return (
    <div className="search-results-page bg-light">
      <div className="page-header-top bg-gray-100 py-3 mb-4">
        <Container>
          <nav className="breadcrumb text-sm text-muted mb-0">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ
            </NavLink>
            <span className="mx-2">/</span>
            <span className="fw-bold">Kết quả tìm kiếm cho "{searchTerm}"</span>
          </nav>
        </Container>
      </div>

      <Container className="main-content-area pb-5">
        <Row className="g-4 align-items-start">
          {/* Sidebar */}
          <Col xs={12} lg={3}>
            <Sidebar />

            <div className="sidebar-section mb-4 bg-white shadow-sm rounded mt-4">
              <LikeProduct
                featuredProducts={suggestedProducts}
                loading={false}
              />
            </div>
          </Col>

          {/* Main Content */}
          <Col xs={12} lg={9}>
            <div className="search-results-header">
              <h2>Kết quả tìm kiếm</h2>
              <p className="search-summary">
                Tìm thấy{" "}
                <span className="search-term">{products.length} sản phẩm</span>{" "}
                và <span className="search-term">{posts.length} bài viết</span>{" "}
                cho từ khóa "<span className="search-term">{searchTerm}</span>"
              </p>
            </div>

            {!hasResults && (
              <div className="search-empty-state">
                <h4>Không tìm thấy kết quả</h4>
                <p>
                  Không có sản phẩm hoặc bài viết nào phù hợp với từ khóa "
                  {searchTerm}"
                </p>
                <Link to="/" className="btn btn-success">
                  Quay về trang chủ
                </Link>
              </div>
            )}

            {/* Products Section */}
            {hasProducts && (
              <div className="results-section">
                <div className="results-section-header">
                  <h3>Sản phẩm</h3>
                  <div className="d-flex align-items-center gap-3">
                    <span className="results-count">
                      {products.length} sản phẩm
                    </span>
                    <Link
                      to={`/san-pham?search=${encodeURIComponent(searchTerm)}`}
                      className="view-all-link"
                    >
                      Xem tất cả →
                    </Link>
                  </div>
                </div>
                <div className="search-product-grid">
                  {products.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {hasPosts && (
              <div className="results-section">
                <div className="results-section-header">
                  <h3>Bài viết</h3>
                  <div className="d-flex align-items-center gap-3">
                    <span className="results-count">
                      {posts.length} bài viết
                    </span>
                    <Link
                      to={`/tin-tuc?search=${encodeURIComponent(searchTerm)}`}
                      className="view-all-link"
                    >
                      Xem tất cả →
                    </Link>
                  </div>
                </div>
                <div className="search-article-list">
                  {posts.slice(0, 5).map((post) => (
                    <SearchArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Search;
