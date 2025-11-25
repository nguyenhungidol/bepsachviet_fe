import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, NavLink, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import "./News.css";
import Sidebar from "../Home/Sidebar/Sidebar";
import { fetchProducts } from "../../services/productService";
import LikeProduct from "../../components/LikeProduct/LikeProduct";
import { fetchFeaturedPosts, fetchPosts } from "../../services/postService";

const FeaturedNewsItem = ({ post }) => (
  <Link
    to={`/tin-tuc/${post.slug}`}
    className="featured-news-item d-flex align-items-center mb-3 text-decoration-none"
  >
    <img
      src={post.thumbnailUrl}
      alt={post.title}
      className="featured-news-img me-3"
    />
    <p className="featured-news-title mb-0">{post.title}</p>
  </Link>
);

const ArticleCard = ({ post }) => (
  <div className="article-card d-flex mb-4 p-3 border rounded shadow-sm">
    <img
      src={post.thumbnailUrl}
      alt={post.title}
      className="article-img me-4 flex-shrink-0"
    />
    <div className="article-content">
      <h3 className="article-title">
        <Link to={`/tin-tuc/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="article-meta text-muted">
        {post.author} •{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("vi-VN")
          : ""}
      </p>
      <p className="article-excerpt">{post.shortDescription}</p>
      <Link to={`/tin-tuc/${post.slug}`} className="btn-read-more">
        Đọc tiếp...
      </Link>
    </div>
  </div>
);

function News() {
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get("search") || "").trim();

  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const [postsPage, setPostsPage] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
  });
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const [loadingPosts, setLoadingPosts] = useState(true);

  const loadSuggestedProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setSuggestedProducts(data.slice(0, 5));
    } catch (error) {
      console.error("Lỗi tải sản phẩm gợi ý bên trang tin tức:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await fetchPosts({
        page,
        size: pageSize,
        search: searchTerm || undefined,
      });
      setPostsPage(data);
    } catch (error) {
      console.error("Failed to load posts", error);
      toast.error(error.message || "Không thể tải danh sách bài viết.");
    } finally {
      setLoadingPosts(false);
    }
  }, [page, searchTerm]);

  const loadFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      const data = await fetchFeaturedPosts({ limit: 5 });
      setFeaturedPosts(data);
    } catch (error) {
      console.error("Failed to load featured posts", error);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestedProducts();
  }, [loadSuggestedProducts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Reset page when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const totalPages = Math.max(postsPage.totalPages || 1, 1);

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  const paginationItems = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index);
  }, [totalPages]);

  return (
    <div className="news-page bg-light">
      <div className="page-header-top bg-gray-100 py-3 mb-4">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ&nbsp;
            </NavLink>{" "}
            /&nbsp;{" "}
            {searchTerm ? (
              <>
                <NavLink
                  to="/tin-tuc"
                  className="text-muted text-decoration-none"
                >
                  Tin tức
                </NavLink>
                <span>&nbsp;/&nbsp;</span>
                <span className="fw-bold">
                  Kết quả tìm kiếm cho "{searchTerm}"
                </span>
              </>
            ) : (
              <span className="fw-bold">Tin tức</span>
            )}
          </div>
        </Container>
      </div>

      <Container className="main-content-area pb-5">
        <Row className="g-4 align-items-start">
          <Col xs={12} lg={3}>
            <Sidebar />

            <div className="sidebar-section mb-4 bg-white shadow-sm rounded mt-4">
              <h4 className="sidebar-heading bg-success text-white p-3 rounded-top">
                TIN NỔI BẬT
              </h4>
              <div className="p-3">
                {loadingFeatured && <p>Đang tải...</p>}
                {!loadingFeatured && featuredPosts.length === 0 && (
                  <p className="text-muted">Chưa có bài viết nổi bật.</p>
                )}
                {featuredPosts.map((post) => (
                  <FeaturedNewsItem key={post.id} post={post} />
                ))}
              </div>
            </div>

            <div className="sidebar-section mb-4 bg-white shadow-sm rounded">
              <LikeProduct
                featuredProducts={suggestedProducts}
                loading={loadingProducts}
              />
            </div>
          </Col>

          <Col xs={12} lg={9}>
            <div className="article-list">
              {loadingPosts && <p>Đang tải bài viết...</p>}
              {!loadingPosts && postsPage.content.length === 0 && (
                <p>Chưa có bài viết nào.</p>
              )}
              {postsPage.content.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>

            <div className="d-flex justify-content-center mt-5">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                    >
                      Trước
                    </button>
                  </li>
                  {paginationItems.map((index) => (
                    <li
                      key={index}
                      className={`page-item ${page === index ? "active" : ""}`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => handlePageChange(index)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      page >= totalPages - 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default News;
