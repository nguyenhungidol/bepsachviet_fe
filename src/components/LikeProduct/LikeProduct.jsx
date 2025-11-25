import { Link } from "react-router-dom";

const LikeProduct = ({ featuredProducts, loading }) => {
  return (
    <>
      <h4 className="sidebar-heading green-bg text-white p-3 rounded-top">
        CÓ THỂ BẠN SẼ THÍCH
      </h4>
      <div className="p-3">
        {featuredProducts.length === 0 && !loading && (
          <p className="mb-0">Chưa có sản phẩm để gợi ý.</p>
        )}
        {featuredProducts.map((item) => (
          <Link
            key={item.id}
            to={`/san-pham/${item.productId || item.id}`}
            className="featured-item d-flex mb-3 text-decoration-none"
          >
            <img
              src={
                item.imageSrc ||
                item.imageUrl ||
                "https://via.placeholder.com/80x80?text=No+Image"
              }
              alt={item.name}
              className="featured-image me-2"
            />
            <div className="featured-details">
              <p className="featured-name mb-1">{item.name}</p>
              <p className="featured-price mb-0">
                {item.priceLabel || item.price || "LIÊN HỆ"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default LikeProduct;
