import "./ProductCard.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x300?text=No+Image";

const ProductCard = ({ product, imageSrc, name, price, ocUrl }) => {
  const resolvedProduct = product || {};
  const displayImage =
    imageSrc ||
    resolvedProduct.imageSrc ||
    resolvedProduct.imageUrl ||
    FALLBACK_IMAGE;
  const displayName = name || resolvedProduct.name || "Sản phẩm";
  const priceLabel = price || resolvedProduct.priceLabel || "LIÊN HỆ";
  const ocopImage =
    ocUrl || resolvedProduct.ocUrl || resolvedProduct.ocopImageUrl || null;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={displayImage} alt={displayName} className="product-image" />
      </div>
      <div className="product-info">
        <p className="product-name">{displayName}</p>
        {ocopImage && (
          <div className="product-rating">
            <img src={ocopImage} alt="OCOP Rating" className="rating-image" />
          </div>
        )}
        <p className="product-price">GIÁ BÁN: {priceLabel}</p>
      </div>
    </div>
  );
};

export default ProductCard;
