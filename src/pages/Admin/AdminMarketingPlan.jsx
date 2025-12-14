import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAdminProducts } from "../../services/adminService";
import "./AdminMarketingPlan.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/60x60?text=No+Image";

// Format price helper
const formatPrice = (price) => {
  if (price === null || price === undefined) return "LIÊN HỆ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const AdminMarketingPlan = () => {
  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Marketing plan state
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    discountPercent: "",
    products: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load products for search
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
    // Load saved plans from localStorage (demo - in production use API)
    const savedPlans = localStorage.getItem("marketingPlans");
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch (e) {
        console.error("Failed to parse saved plans", e);
      }
    }
  }, [loadProducts]);

  // Save plans to localStorage whenever they change
  useEffect(() => {
    if (plans.length > 0) {
      localStorage.setItem("marketingPlans", JSON.stringify(plans));
    }
  }, [plans]);

  // Search products by code or name
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
      setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
      setShowSearchResults(true);
    },
    [products]
  );

  // Add product to plan
  const addProductToPlan = useCallback((product) => {
    setPlanForm((prev) => {
      // Check if already added
      const exists = prev.products.some(
        (p) => (p.productId || p.id) === (product.productId || product.id)
      );
      if (exists) {
        toast.warning("Sản phẩm đã có trong kế hoạch!");
        return prev;
      }
      return {
        ...prev,
        products: [...prev.products, product],
      };
    });
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  // Remove product from plan
  const removeProductFromPlan = useCallback((productId) => {
    setPlanForm((prev) => ({
      ...prev,
      products: prev.products.filter(
        (p) => (p.productId || p.id) !== productId
      ),
    }));
  }, []);

  // Create new plan
  const handleCreatePlan = useCallback(() => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedPlan(null);
    setPlanForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      discountPercent: "",
      products: [],
    });
  }, []);

  // Edit existing plan
  const handleEditPlan = useCallback((plan) => {
    setIsEditing(true);
    setIsCreating(false);
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name || "",
      description: plan.description || "",
      startDate: plan.startDate || "",
      endDate: plan.endDate || "",
      discountPercent: plan.discountPercent || "",
      products: plan.products || [],
    });
  }, []);

  // View plan details
  const handleViewPlan = useCallback((plan) => {
    setSelectedPlan(plan);
    setIsCreating(false);
    setIsEditing(false);
  }, []);

  // Save plan
  const handleSavePlan = useCallback(() => {
    if (!planForm.name.trim()) {
      toast.warning("Vui lòng nhập tên kế hoạch!");
      return;
    }
    if (planForm.products.length === 0) {
      toast.warning("Vui lòng thêm ít nhất 1 sản phẩm vào kế hoạch!");
      return;
    }

    const newPlan = {
      id: isEditing && selectedPlan ? selectedPlan.id : Date.now().toString(),
      name: planForm.name.trim(),
      description: planForm.description.trim(),
      startDate: planForm.startDate,
      endDate: planForm.endDate,
      discountPercent: planForm.discountPercent
        ? Number(planForm.discountPercent)
        : null,
      products: planForm.products.map((p) => ({
        productId: p.productId || p.id,
        name: p.name,
        price: p.price,
        imageSrc: p.imageSrc,
      })),
      createdAt:
        isEditing && selectedPlan
          ? selectedPlan.createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing && selectedPlan) {
      setPlans((prev) =>
        prev.map((p) => (p.id === selectedPlan.id ? newPlan : p))
      );
      toast.success("Đã cập nhật kế hoạch marketing!");
    } else {
      setPlans((prev) => [...prev, newPlan]);
      toast.success("Đã tạo kế hoạch marketing mới!");
    }

    setSelectedPlan(newPlan);
    setIsCreating(false);
    setIsEditing(false);
  }, [planForm, isEditing, selectedPlan]);

  // Delete plan
  const handleDeletePlan = useCallback(
    (planId) => {
      if (!window.confirm("Bạn có chắc muốn xóa kế hoạch này?")) return;

      setPlans((prev) => {
        const updated = prev.filter((p) => p.id !== planId);
        localStorage.setItem("marketingPlans", JSON.stringify(updated));
        return updated;
      });
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
      toast.success("Đã xóa kế hoạch!");
    },
    [selectedPlan]
  );

  // Cancel editing
  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setIsEditing(false);
    setPlanForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      discountPercent: "",
      products: [],
    });
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="admin-marketing-plan">
      <div className="marketing-plan-header">
        <h2>Quản lý Kế hoạch Marketing</h2>
      </div>

      <div className="marketing-plan-content">
        {/* Left Panel - Plan List & Search */}
        <div className="marketing-plan-left">
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
                onBlur={() =>
                  setTimeout(() => setShowSearchResults(false), 200)
                }
              />
              {loadingProducts && (
                <span className="search-loading">
                  <i className="bi bi-arrow-repeat spin"></i>
                </span>
              )}

              {/* Search Results Dropdown - inside wrapper for proper positioning */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((product) => (
                    <div
                      key={product.productId || product.id}
                      className="search-result-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addProductToPlan(product)}
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
                        <span className="search-result-name">
                          {product.name}
                        </span>
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

              {showSearchResults &&
                searchQuery &&
                searchResults.length === 0 && (
                  <div className="search-results">
                    <div className="search-no-result">
                      Không tìm thấy sản phẩm phù hợp
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Create Plan Button */}
          <button
            type="button"
            className="btn-create-plan"
            onClick={handleCreatePlan}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Tạo kế hoạch mới
          </button>

          {/* Plan List */}
          <div className="plan-list-section">
            <h4>Danh sách kế hoạch ({plans.length})</h4>
            {plans.length === 0 ? (
              <div className="no-plans">
                <i className="bi bi-calendar-x"></i>
                <p>Chưa có kế hoạch nào</p>
              </div>
            ) : (
              <div className="plan-list">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-list-item ${
                      selectedPlan?.id === plan.id ? "active" : ""
                    }`}
                    onClick={() => handleViewPlan(plan)}
                  >
                    <div className="plan-list-item-info">
                      <span className="plan-list-item-name">{plan.name}</span>
                      <span className="plan-list-item-meta">
                        {plan.products?.length || 0} sản phẩm •{" "}
                        {formatDate(plan.startDate)}
                      </span>
                    </div>
                    <div className="plan-list-item-actions">
                      <button
                        type="button"
                        className="btn-icon btn-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPlan(plan);
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
                          handleDeletePlan(plan.id);
                        }}
                        title="Xóa"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Plan Details / Form */}
        <div className="marketing-plan-right">
          {isCreating || isEditing ? (
            /* Plan Form */
            <div className="plan-form">
              <h3>{isEditing ? "Chỉnh sửa kế hoạch" : "Tạo kế hoạch mới"}</h3>

              <div className="form-group">
                <label>Tên kế hoạch *</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: Khuyến mãi Tết 2024"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) =>
                    setPlanForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả chi tiết kế hoạch..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={planForm.startDate}
                    onChange={(e) =>
                      setPlanForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={planForm.endDate}
                    onChange={(e) =>
                      setPlanForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Giảm giá (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={planForm.discountPercent}
                  onChange={(e) =>
                    setPlanForm((prev) => ({
                      ...prev,
                      discountPercent: e.target.value,
                    }))
                  }
                  placeholder="VD: 10"
                />
              </div>

              {/* Selected Products */}
              <div className="form-group">
                <label>
                  Sản phẩm trong kế hoạch ({planForm.products.length})
                </label>
                {planForm.products.length === 0 ? (
                  <div className="no-products-selected">
                    <i className="bi bi-box-seam"></i>
                    <p>Sử dụng ô tìm kiếm bên trái để thêm sản phẩm</p>
                  </div>
                ) : (
                  <div className="selected-products">
                    {planForm.products.map((product) => (
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
                            removeProductFromPlan(
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
                  onClick={handleSavePlan}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  {isEditing ? "Cập nhật" : "Tạo kế hoạch"}
                </button>
              </div>
            </div>
          ) : selectedPlan ? (
            /* Plan Details View */
            <div className="plan-details">
              <div className="plan-details-header">
                <h3>{selectedPlan.name}</h3>
                <div className="plan-details-actions">
                  <button
                    type="button"
                    className="btn-edit-plan"
                    onClick={() => handleEditPlan(selectedPlan)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              {selectedPlan.description && (
                <p className="plan-description">{selectedPlan.description}</p>
              )}

              <div className="plan-meta">
                <div className="plan-meta-item">
                  <i className="bi bi-calendar-event"></i>
                  <span>
                    {formatDate(selectedPlan.startDate)} -{" "}
                    {formatDate(selectedPlan.endDate)}
                  </span>
                </div>
                {selectedPlan.discountPercent && (
                  <div className="plan-meta-item discount">
                    <i className="bi bi-percent"></i>
                    <span>Giảm {selectedPlan.discountPercent}%</span>
                  </div>
                )}
                <div className="plan-meta-item">
                  <i className="bi bi-box-seam"></i>
                  <span>{selectedPlan.products?.length || 0} sản phẩm</span>
                </div>
              </div>

              <div className="plan-products">
                <h4>Danh sách sản phẩm</h4>
                {selectedPlan.products?.length === 0 ? (
                  <p className="text-muted">Không có sản phẩm nào</p>
                ) : (
                  <div className="plan-products-grid">
                    {selectedPlan.products?.map((product) => (
                      <div
                        key={product.productId || product.id}
                        className="plan-product-card"
                      >
                        <img
                          src={product.imageSrc || FALLBACK_IMAGE}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="plan-product-info">
                          <span className="plan-product-name">
                            {product.name}
                          </span>
                          <span className="plan-product-price">
                            {formatPrice(product.price)}
                            {selectedPlan.discountPercent && (
                              <span className="discounted-price">
                                {formatPrice(
                                  product.price *
                                    (1 - selectedPlan.discountPercent / 100)
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="plan-empty-state">
              <i className="bi bi-megaphone"></i>
              <h4>Chọn hoặc tạo kế hoạch</h4>
              <p>
                Chọn một kế hoạch từ danh sách bên trái hoặc tạo kế hoạch mới để
                bắt đầu
              </p>
              <button
                type="button"
                className="btn-create-plan-large"
                onClick={handleCreatePlan}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Tạo kế hoạch mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMarketingPlan;
