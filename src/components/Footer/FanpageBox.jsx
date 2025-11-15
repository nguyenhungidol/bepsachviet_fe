// FanpageBox.jsx
import { useEffect } from "react";

function FanpageBox() {
  useEffect(() => {
    // Khi component mount, gọi parse để Facebook render plugin
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="footer-fanpage-box-wrapper">
      {" "}
      {/* Thêm một wrapper bên ngoài để dễ dàng CSS */}
      <div
        className="fb-page"
        data-href="https://www.facebook.com/BepsachvietOfficial/"
        // data-tabs="timeline" // Bỏ thuộc tính này đi
        data-width="350"
        data-height="150" // Giảm chiều cao để chỉ hiển thị phần đầu
        data-small-header="true" // Dùng header nhỏ gọn hơn nếu muốn
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="false" // Ẩn ảnh bạn bè đã like nếu không cần
      ></div>
    </div>
  );
}

export default FanpageBox;
