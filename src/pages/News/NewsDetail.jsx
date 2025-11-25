import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, NavLink, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

import "./NewsDetail.css";
import Sidebar from "../Home/Sidebar/Sidebar";
import LikeProduct from "../../components/LikeProduct/LikeProduct";
import { fetchProducts } from "../../services/productService";
import { fetchPostBySlug, fetchRelatedPosts } from "../../services/postService";

// Share button icons (inline SVGs for simplicity)
const FacebookIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </svg>
);

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="article-skeleton">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-meta"></div>
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
  </div>
);

// Share buttons component
const ShareButtons = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết!");
    } catch {
      toast.error("Không thể sao chép liên kết.");
    }
  };

  return (
    <div className="share-section">
      <h5>Chia sẻ bài viết:</h5>
      <div className="share-buttons">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn facebook"
        >
          <FacebookIcon /> Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn twitter"
        >
          <TwitterIcon /> Twitter
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn linkedin"
        >
          <LinkedInIcon /> LinkedIn
        </a>
        <button
          type="button"
          className="share-btn copy-link"
          onClick={handleCopyLink}
        >
          <CopyIcon /> Sao chép liên kết
        </button>
      </div>
    </div>
  );
};

// Related post card component
const RelatedPostCard = ({ post }) => (
  <div className="related-post-card">
    <Link to={`/tin-tuc/${post.slug}`}>
      <img src={post.thumbnailUrl} alt={post.title} />
    </Link>
    <div className="card-body">
      <h5 className="card-title">
        <Link to={`/tin-tuc/${post.slug}`}>{post.title}</Link>
      </h5>
      <p className="card-text text-muted">
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("vi-VN")
          : ""}
      </p>
    </div>
  </div>
);

// Facebook comments component
const FacebookComments = ({ url }) => {
  useEffect(() => {
    // Reload FB SDK when URL changes
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [url]);

  return (
    <div className="comment-section">
      <h4>Bình luận</h4>
      <div
        className="fb-comments"
        data-href="https://dantri.com.vn" // Use a default URL or replace with actual when available in deployment
        data-width="100%"
        data-numposts="5"
        data-colorscheme="light"
      ></div>
    </div>
  );
};

function NewsDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const loadPost = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPostBySlug(slug);
      setPost(data);
    } catch (error) {
      console.error("Failed to load post", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadRelated = useCallback(async () => {
    if (!post) return;
    setLoadingRelated(true);
    try {
      const data = await fetchRelatedPosts({
        slug: post.slug,
        categoryId: post.categoryId,
        limit: 3,
      });
      setRelatedPosts(data);
    } catch (error) {
      console.error("Failed to load related posts", error);
    } finally {
      setLoadingRelated(false);
    }
  }, [post]);

  const loadSuggestedProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setSuggestedProducts(data.slice(0, 5));
    } catch (error) {
      console.error("Lỗi tải sản phẩm gợi ý:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadPost();
    window.scrollTo(0, 0);
  }, [loadPost]);

  useEffect(() => {
    loadRelated();
  }, [loadRelated]);

  useEffect(() => {
    loadSuggestedProducts();
  }, [loadSuggestedProducts]);

  return (
    <div className="news-detail-page bg-light">
      {post && (
        <Helmet>
          <title>{post.title} - Bếp Sạch Việt</title>
          <meta property="og:title" content={post.title} />
          <meta
            property="og:description"
            content={post.shortDescription || "Đặc sản gà ủ muối..."}
          />
          <meta property="og:image" content={post.thumbnailUrl} />
          <meta property="og:url" content={currentUrl} />
          <meta property="og:type" content="article" />
        </Helmet>
      )}
      <div className="page-header-top bg-gray-100 py-3 mb-4">
        <Container>
          <nav className="breadcrumb text-sm text-muted mb-0">
            <NavLink to="/" className="text-muted text-decoration-none">
              Trang chủ
            </NavLink>
            <span className="mx-2">/</span>
            <NavLink to="/tin-tuc" className="text-muted text-decoration-none">
              Tin tức
            </NavLink>
            <span className="mx-2">/</span>
            <span className="fw-bold">
              {loading ? "Đang tải..." : post?.title || "Bài viết"}
            </span>
          </nav>
        </Container>
      </div>

      <Container className="main-content-area pb-5">
        <Row className="g-4 align-items-start">
          {/* Sidebar */}
          <Col xs={12} lg={3} className="order-lg-1 order-2">
            <Sidebar />

            <div className="sidebar-section mb-4 bg-white shadow-sm rounded mt-4">
              <LikeProduct
                featuredProducts={suggestedProducts}
                loading={loadingProducts}
              />
            </div>
          </Col>

          {/* Main Content */}
          <Col xs={12} lg={9} className="order-lg-2 order-1">
            {loading && <LoadingSkeleton />}

            {!loading && !post && (
              <div className="text-center py-5">
                <h4 className="text-muted">Không tìm thấy bài viết</h4>
                <Link to="/tin-tuc" className="btn btn-success mt-3">
                  Quay lại trang tin tức
                </Link>
              </div>
            )}

            {!loading && post && (
              <article className="article-detail bg-white p-4 rounded shadow-sm">
                {/* Header */}
                <header className="article-header">
                  <h1>{post.title}</h1>
                  <div className="article-meta-detail">
                    <span className="author">{post.author}</span>
                    <span>•</span>
                    <span>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                    {post.categoryName && (
                      <>
                        <span>•</span>
                        <span className="text-success">
                          {post.categoryName}
                        </span>
                      </>
                    )}
                  </div>
                </header>

                {/* Thumbnail */}
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="article-thumbnail"
                />

                {/* Content */}
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share buttons */}
                <ShareButtons url={currentUrl} title={post.title} />

                {/* Related posts */}
                {!loadingRelated && relatedPosts.length > 0 && (
                  <div className="related-posts-section">
                    <h4>Bài viết liên quan</h4>
                    <Row className="g-3">
                      {relatedPosts.map((relPost) => (
                        <Col xs={12} sm={6} md={4} key={relPost.id}>
                          <RelatedPostCard post={relPost} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Facebook Comments */}
                <FacebookComments url={currentUrl} />
              </article>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default NewsDetail;
