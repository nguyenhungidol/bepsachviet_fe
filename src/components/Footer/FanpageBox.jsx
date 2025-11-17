// FanpageBox.jsx
import { useEffect } from "react";

function FanpageBox() {
  useEffect(() => {
    // Thêm setTimeout để đảm bảo DOM đã sẵn sàng trước khi parse
    setTimeout(() => {
      if (window.FB) {
        window.FB.XFBML.parse();
      }
    }, 100); // Đợi 0.1 giây
  }, []);

  return (
    <div className="footer-fanpage-box-wrapper">
      {" "}
      {/* Thêm một wrapper bên ngoài để dễ dàng CSS */}
      <div
        className="fb-page"
        data-href="https://www.facebook.com/BepsachvietOfficial/"
        data-width="350"
        data-height="300" // Giảm chiều cao để chỉ hiển thị phần đầu
        data-small-header="false" // Dùng header nhỏ gọn hơn nếu muốn
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="false" // Ẩn ảnh bạn bè đã like nếu không cần
      ></div>
    </div>
  );
}

export default FanpageBox;
