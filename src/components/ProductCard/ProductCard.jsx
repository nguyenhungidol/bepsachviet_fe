import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./ProductCard.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x300?text=No+Image";

const ProductCard = ({ product, imageSrc, name, price, ocUrl }) => {
  const { addItem } = useCart();
  const resolvedProduct = product || {};
  const preferredImage = useMemo(() => {
    return (
      imageSrc || resolvedProduct.imageSrc || resolvedProduct.imageUrl || null
    );
  }, [imageSrc, resolvedProduct.imageSrc, resolvedProduct.imageUrl]);
  const [displayImage, setDisplayImage] = useState(
    preferredImage || FALLBACK_IMAGE
  );

  useEffect(() => {
    setDisplayImage(preferredImage || FALLBACK_IMAGE);
  }, [preferredImage]);

  const handleImageError = () => {
    if (displayImage !== FALLBACK_IMAGE) {
      setDisplayImage(FALLBACK_IMAGE);
    }
  };

  const displayName = name || resolvedProduct.name || "Sản phẩm";
  const priceLabel = price || resolvedProduct.priceLabel || "LIÊN HỆ";
  const ocopImage =
    ocUrl || resolvedProduct.ocUrl || resolvedProduct.ocopImageUrl || null;
  const rawPrice = resolvedProduct.price;

  const productLink = `/san-pham/${
    resolvedProduct.productId || resolvedProduct.id || "unknown"
  }`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(resolvedProduct, 1);
  };

  return (
    <Link to={productLink} className="product-card-link">
      <div className="product-card">
        <div className="product-image-container">
          <img
            src={displayImage}
            alt={displayName}
            className="product-image"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            referrerPolicy="no-referrer"
          />
          {/* Add to cart button overlay */}
          {rawPrice > 0 && (
            <button
              type="button"
              className="btn-quick-add"
              onClick={handleAddToCart}
              title="Thêm vào giỏ hàng"
            >
              <i className="bi bi-cart-plus"></i>
            </button>
          )}
        </div>
        <div className="product-info">
          <p className="product-name">{displayName}</p>
          {ocopImage && (
            <div className="product-rating">
              <img src={ocopImage} alt="OCOP Rating" className="rating-image" />
            </div>
          )}
          <p className="product-price">
            <span className="price-label">Giá bán:</span>{" "}
            <span className="price-number">{priceLabel}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
