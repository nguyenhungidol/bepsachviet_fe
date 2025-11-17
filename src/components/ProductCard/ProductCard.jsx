import "./ProductCard.css";
const ProductCard = ({
  imageSrc,
  name,
  price = "LIÊN HỆ",
  ocUrl, // Sử dụng 1 link duy nhất cho cả logo OCOP và rating
}) => (
  <div className="product-card">
    <div className="product-image-container">
      <img src={imageSrc} alt={name} className="product-image" />
    </div>
    <div className="product-info">
      <p className="product-name">{name}</p>
      {ocUrl && (
        <div className="product-rating">
          <img src={ocUrl} alt="OCOP Rating" className="rating-image" />
        </div>
      )}
      <p className="product-price">GIÁ BÁN: {price}</p>
    </div>
  </div>
);

export default ProductCard;
