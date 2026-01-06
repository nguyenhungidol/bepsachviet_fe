import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAdminProducts } from "../../services/adminService";
import "./AdminMarketingPost.css";
import { generateFacebookAds } from "../../services/facebookAdsRagService";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const FALLBACK_IMAGE = "https://via.placeholder.com/60x60?text=No+Image";

const PLATFORM_OPTIONS = [
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "TikTok", label: "TikTok" },
  { value: "Zalo", label: "Zalo" },
  { value: "Shopee", label: "Shopee" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp", tone: "draft" },
  { value: "SCHEDULED", label: "Đã lên lịch", tone: "scheduled" },
  { value: "PUBLISHED", label: "Đã đăng", tone: "published" },
];

const initialPostForm = {
  title: "",
  platform: "Facebook",
  caption: "",
  callToAction: "",
  hashtags: "",
  scheduledAt: "",
  status: "DRAFT",
  imageUrl: "",
  products: [],
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return "LIÊN HỆ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalizeHashtags = (value) => {
  if (!value) return [];
  return value
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => {
      const clean = tag.replace(/^#+/, "");
      return clean ? `#${clean}` : "";
    })
    .filter(Boolean);
};

const getStatusInfo = (status) =>
  STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];

const AdminMarketingPost = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postForm, setPostForm] = useState(initialPostForm);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await fetchAdminProducts();
      const normalizedProducts = Array.isArray(data)
        ? data
        : data?.content || [];
      setProducts(normalizedProducts);
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    const savedPosts = localStorage.getItem("marketingPosts");
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        console.error("Failed to parse saved posts", e);
      }
    }
  }, [loadProducts]);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("marketingPosts", JSON.stringify(posts));
    } else {
      localStorage.removeItem("marketingPosts");
    }
  }, [posts]);
  const getPrimaryProductForRag = (products = []) => {
    if (!Array.isArray(products) || products.length === 0) return null;

    // Ưu tiên sản phẩm đầu tiên (đơn giản, ổn định)
    return products[0];
  };

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const lowerQuery = query.toLowerCase().trim();
      const filtered = products.filter((product) => {
        const productId = (product.productId || product.id || "").toLowerCase();
        const productName = (product.name || "").toLowerCase();
        return (
          productId.includes(lowerQuery) || productName.includes(lowerQuery)
        );
      });
      setSearchResults(filtered.slice(0, 10));
      setShowSearchResults(true);
    },
    [products]
  );

  const addProductToPost = useCallback((product) => {
    setPostForm((prev) => {
      const exists = prev.products.some(
        (p) => (p.productId || p.id) === (product.productId || product.id)
      );
      if (exists) {
        toast.warning("Sản phẩm đã có trong bài đăng!");
        return prev;
      }
      return {
        ...prev,
        products: [...prev.products, product],
      };
    });
    setSearchQuery(product.name || "");
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  const removeProductFromPost = useCallback((productId) => {
    setPostForm((prev) => ({
      ...prev,
      products: prev.products.filter(
        (p) => (p.productId || p.id) !== productId
      ),
    }));
  }, []);

  const handleCreatePost = useCallback(async () => {
    setIsCreating(true);
    setIsEditing(false);

    const primaryProduct = getPrimaryProductForRag(postForm.products);

    if (!primaryProduct) {
      toast.warning("Vui lòng chọn sản phẩm từ danh sách trước khi tạo bài!");
      setIsCreating(false);
      return;
    }

    const productId = primaryProduct.productId || primaryProduct.id;
    const productName = primaryProduct.name;

    if (!productId || !productName) {
      toast.error("Sản phẩm không hợp lệ để sinh nội dung AI");
      setIsCreating(false);
      return;
    }

    try {
      toast.info("Đang sinh nội dung quảng cáo Facebook...");

      const aiResult = await generateFacebookAds({
        productId,
        productName,
        image: primaryProduct.imageSrc || "",
      });

      const aiContent =
        aiResult?.content || aiResult?.answer || aiResult?.text || "";

      const newPost = {
        id: Date.now().toString(),
        title: `Quảng cáo ${productName}`,
        platform: "Facebook",
        caption: aiContent,
        callToAction: "",
        hashtags: [],
        scheduledAt: "",
        status: "DRAFT",
        imageUrl: aiResult?.image || primaryProduct.imageSrc || "",
        products: [
          {
            productId: primaryProduct.productId || primaryProduct.id,
            name: primaryProduct.name,
            price: primaryProduct.price,
            imageSrc: primaryProduct.imageSrc,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPosts((prev) => [...prev, newPost]);
      setSelectedPost(newPost);
      setPostForm(initialPostForm);

      toast.success("Đã sinh nội dung quảng cáo Facebook!");
    } catch (err) {
      console.error(err);
      toast.error("Sinh nội dung quảng cáo thất bại!");
    } finally {
      setIsCreating(false);
    }
  }, [postForm.products]);

  const handleEditPost = useCallback((post) => {
    setIsEditing(true);
    setIsCreating(false);
    setSelectedPost(post);
    setPostForm({
      title: post.title || "",
      platform: post.platform || "Facebook",
      caption: post.caption || "",
      callToAction: post.callToAction || "",
      hashtags: (post.hashtags || []).join(" "),
      scheduledAt: post.scheduledAt || "",
      status: post.status || "DRAFT",
      imageUrl: post.imageUrl || "",
      products: post.products || [],
    });
  }, []);

  const handleViewPost = useCallback((post) => {
    setSelectedPost(post);
    setIsCreating(false);
    setIsEditing(false);
  }, []);

  const handleSavePost = useCallback(() => {
    if (!postForm.title.trim()) {
      toast.warning("Vui lòng nhập tiêu đề bài đăng!");
      return;
    }
    if (!postForm.caption.trim()) {
      toast.warning("Vui lòng nhập nội dung bài đăng!");
      return;
    }
    if (postForm.status === "SCHEDULED" && !postForm.scheduledAt) {
      toast.warning("Vui lòng chọn thời gian đăng!");
      return;
    }
    if (postForm.products.length === 0) {
      toast.warning("Vui lòng thêm ít nhất 1 sản phẩm vào bài đăng!");
      return;
    }

    const hashtags = normalizeHashtags(postForm.hashtags);

    const newPost = {
      id: isEditing && selectedPost ? selectedPost.id : Date.now().toString(),
      title: postForm.title.trim(),
      platform: postForm.platform,
      caption: postForm.caption.trim(),
      callToAction: postForm.callToAction.trim(),
      hashtags,
      scheduledAt: postForm.scheduledAt || "",
      status: postForm.status,
      imageUrl: postForm.imageUrl.trim(),
      products: postForm.products.map((p) => ({
        productId: p.productId || p.id,
        name: p.name,
        price: p.price,
        imageSrc: p.imageSrc,
      })),
      createdAt:
        isEditing && selectedPost
          ? selectedPost.createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing && selectedPost) {
      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPost.id ? newPost : p))
      );
      toast.success("Đã cập nhật bài đăng!");
    } else {
      setPosts((prev) => [...prev, newPost]);
      toast.success("Đã tạo bài đăng mới!");
    }

    setSelectedPost(newPost);
    setIsCreating(false);
    setIsEditing(false);
  }, [isEditing, postForm, selectedPost]);

  const handleDeletePost = useCallback(
    (postId) => {
      if (!window.confirm("Bạn có chắc muốn xóa bài đăng này?")) return;

      setPosts((prev) => {
        const updated = prev.filter((p) => p.id !== postId);
        if (updated.length > 0) {
          localStorage.setItem("marketingPosts", JSON.stringify(updated));
        } else {
          localStorage.removeItem("marketingPosts");
        }
        return updated;
      });

      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }

      toast.success("Đã xóa bài đăng!");
    },
    [selectedPost]
  );

  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setIsEditing(false);
    setPostForm(initialPostForm);
  }, []);

  const MAKE_WEBHOOK_URL =
    "https://hook.us2.make.com/5bgvs5uqfpnjet15h2fq8tlg4jiq7nyy";

  const handleTriggerMakePost = async () => {
    try {
      toast.info("Đang kích hoạt workflow đăng bài Facebook...");

      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
      });

      toast.success("Đã gửi lệnh đăng bài lên Facebook!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể kích hoạt Make workflow!");
    }
  };

  return (
    <div className="admin-marketing-post">
      <div className="marketing-post-header">
        <h2>Quản lý Bài đăng Marketing</h2>
      </div>

      <div className="marketing-post-content">
        {/* Left Panel - Post List & Search */}
        <div className="marketing-post-left">
          {/* Search Products */}
          <div className="product-search-section">
            <h4>Tìm kiếm sản phẩm</h4>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Nhập mã hoặc tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
              {loadingProducts && (
                <span className="search-loading">
                  <i className="bi bi-arrow-repeat spin"></i>
                </span>
              )}
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <div
                    key={product.productId || product.id}
                    className="search-result-item"
                    onClick={() => addProductToPost(product)}
                  >
                    <img
                      src={product.imageSrc || FALLBACK_IMAGE}
                      alt={product.name}
                      className="search-result-image"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="search-result-info">
                      <span className="search-result-name">{product.name}</span>
                      <span className="search-result-code">
                        Mã: {product.productId || product.id}
                      </span>
                    </div>
                    <span className="search-result-price">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="search-results">
                <div className="search-no-result">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              </div>
            )}
          </div>

          {/* Create Post Button */}
          <button
            type="button"
            className="btn-create-post"
            onClick={handleCreatePost}
            disabled={isCreating}
          >
            <i className="bi bi-plus-circle me-2"></i>
            {isCreating ? "Đang tạo..." : "Tạo bài đăng mới"}
          </button>

          {/* Post List */}
          <div className="post-list-section">
            <h4>Danh sách bài đăng ({posts.length})</h4>
            {posts.length === 0 ? (
              <div className="no-posts">
                <i className="bi bi-share"></i>
                <p>Chưa có bài đăng nào</p>
              </div>
            ) : (
              <div className="post-list">
                {posts.map((post) => {
                  const statusInfo = getStatusInfo(post.status);
                  return (
                    <div
                      key={post.id}
                      className={`post-list-item ${
                        selectedPost?.id === post.id ? "active" : ""
                      }`}
                      onClick={() => handleViewPost(post)}
                    >
                      <div className="post-list-item-info">
                        <span className="post-list-item-name">
                          {post.title}
                        </span>
                        <span className="post-list-item-meta">
                          {post.platform || "Facebook"} •{" "}
                          {formatDateTime(post.scheduledAt)}
                        </span>
                      </div>
                      <div className="post-list-item-meta-wrap">
                        <span
                          className={`post-status-badge ${statusInfo.tone}`}
                        >
                          {statusInfo.label}
                        </span>
                        <div className="post-list-item-actions">
                          <button
                            type="button"
                            className="btn-icon btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPost(post);
                            }}
                            title="Sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post.id);
                            }}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Post Details / Form */}
        <div className="marketing-post-right">
          {isCreating || isEditing ? (
            <div className="post-form">
              <h3>{isEditing ? "Chỉnh sửa bài đăng" : "Tạo bài đăng mới"}</h3>

              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="VD: Combo nồi chảo ưu đãi tháng 9"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kênh đăng</label>
                  <select
                    value={postForm.platform}
                    onChange={(e) =>
                      setPostForm((prev) => ({
                        ...prev,
                        platform: e.target.value,
                      }))
                    }
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={postForm.status}
                    onChange={(e) =>
                      setPostForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Thời gian đăng</label>
                <input
                  type="datetime-local"
                  value={postForm.scheduledAt}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      scheduledAt: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Nội dung bài đăng *</label>
                <textarea
                  value={postForm.caption}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      caption: e.target.value,
                    }))
                  }
                  placeholder="Viết nội dung bài đăng..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Lời kêu gọi hành động</label>
                <input
                  type="text"
                  value={postForm.callToAction}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      callToAction: e.target.value,
                    }))
                  }
                  placeholder="VD: Nhắn tin ngay để nhận ưu đãi!"
                />
              </div>

              <div className="form-group">
                <label>Hashtag</label>
                <input
                  type="text"
                  value={postForm.hashtags}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      hashtags: e.target.value,
                    }))
                  }
                  placeholder="#khuyenmai #bepdep #bepsachviet"
                />
              </div>

              <div className="form-group">
                <label>Ảnh minh họa</label>
                <input
                  type="url"
                  value={postForm.imageUrl}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
                {postForm.imageUrl && (
                  <div className="post-image-preview">
                    <img
                      src={postForm.imageUrl}
                      alt="Preview"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>
                  Sản phẩm trong bài đăng ({postForm.products.length})
                </label>
                {postForm.products.length === 0 ? (
                  <div className="no-products-selected">
                    <i className="bi bi-box-seam"></i>
                    <p>Sử dụng ô tìm kiếm bên trái để thêm sản phẩm</p>
                  </div>
                ) : (
                  <div className="selected-products">
                    {postForm.products.map((product) => (
                      <div
                        key={product.productId || product.id}
                        className="selected-product-item"
                      >
                        <img
                          src={product.imageSrc || FALLBACK_IMAGE}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="selected-product-info">
                          <span className="selected-product-name">
                            {product.name}
                          </span>
                          <span className="selected-product-price">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-remove-product"
                          onClick={() =>
                            removeProductFromPost(
                              product.productId || product.id
                            )
                          }
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSavePost}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  {isEditing ? "Cập nhật" : "Tạo bài đăng"}
                </button>
              </div>
            </div>
          ) : selectedPost ? (
            <div className="post-details">
              <div className="post-details-header">
                <div>
                  <h3>{selectedPost.title}</h3>
                  <div className="post-details-sub">
                    <span className="post-platform">
                      <i className="bi bi-broadcast-pin me-2"></i>
                      {selectedPost.platform || "Facebook"}
                    </span>
                    <span
                      className={`post-status-badge ${
                        getStatusInfo(selectedPost.status).tone
                      }`}
                    >
                      {getStatusInfo(selectedPost.status).label}
                    </span>
                  </div>
                </div>
                <div className="post-details-actions">
                  <button
                    type="button"
                    className="btn-edit-post"
                    onClick={() => handleEditPost(selectedPost)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Chỉnh sửa
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn-publish-facebook"
                onClick={handleTriggerMakePost}
              >
                <i className="bi bi-facebook me-2"></i>
                Đăng bài
              </button>

              {selectedPost.imageUrl && (
                <div className="post-image">
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
              )}

              {selectedPost.caption && (
                <div className="post-caption markdown-content">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {selectedPost.caption}
                  </ReactMarkdown>
                </div>
              )}

              {selectedPost.callToAction && (
                <div className="post-cta">
                  <strong>CTA:</strong> {selectedPost.callToAction}
                </div>
              )}

              {selectedPost.hashtags?.length > 0 && (
                <div className="post-hashtags">
                  {selectedPost.hashtags.map((tag, index) => (
                    <span key={`${tag}-${index}`} className="post-hashtag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="post-meta">
                <div className="post-meta-item">
                  <i className="bi bi-clock"></i>
                  <span>{formatDateTime(selectedPost.scheduledAt)}</span>
                </div>
                <div className="post-meta-item">
                  <i className="bi bi-box-seam"></i>
                  <span>{selectedPost.products?.length || 0} sản phẩm</span>
                </div>
              </div>

              <div className="post-products">
                <h4>Danh sách sản phẩm</h4>
                {selectedPost.products?.length === 0 ? (
                  <p className="text-muted">Không có sản phẩm nào</p>
                ) : (
                  <div className="post-products-grid">
                    {selectedPost.products?.map((product) => (
                      <div
                        key={product.productId || product.id}
                        className="post-product-card"
                      >
                        <img
                          src={product.imageSrc || FALLBACK_IMAGE}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="post-product-info">
                          <span className="post-product-name">
                            {product.name}
                          </span>
                          <span className="post-product-price">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="post-empty-state">
              <i className="bi bi-megaphone"></i>
              <h4>Chọn hoặc tạo bài đăng</h4>
              <p>
                Chọn một bài đăng từ danh sách bên trái hoặc tạo bài đăng mới để
                bắt đầu
              </p>
              <button
                type="button"
                className="btn-create-post-large"
                onClick={handleCreatePost}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Tạo bài đăng mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMarketingPost;
