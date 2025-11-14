// Đảm bảo bạn có file AboutUsContent.css để định dạng
import "./AboutUsContent.css";

function AboutUsContent() {
  return (
    <div className="about-us-content-section p-4 my-3 bg-white rounded shadow-sm">
      {/* SỨ MỆNH */}
      <div className="mission-section mb-5">
        <h2 className="content-heading">SỨ MỆNH:</h2>
        <ul>
          <li>
            Sứ mệnh của **BẾP SẠCH VIỆT** là trở thành nhịp cầu kết nối văn hóa
            ẩm thực giữa các vùng miền và người tiêu dùng. Thương hiệu không chỉ
            muốn mang đến những món ăn ngon mà còn lan tỏa những giá trị tinh
            túy của ẩm thực Việt Nam, giúp mọi người tiêu dùng, dù ở bất cứ đâu,
            đều có thể trải nghiệm trọn vẹn hương vị quê hương.
          </li>
          <li>
            Với **BẾP SẠCH VIỆT**, mỗi bữa ăn không chỉ là thời gian thưởng thức
            món ngon mà còn là cơ hội để gắn kết gia đình, chia sẻ yêu thương và
            trân trọng những giá trị truyền thống. Trong tương lai, **BẾP SẠCH
            VIỆT** sẽ không ngừng nỗ lực để tiếp tục sứ mệnh này, mở rộng thêm
            các dòng sản phẩm đặc sản vùng miền, mang đến sự lựa chọn phong phú
            và tiện lợi cho người tiêu dùng.
          </li>
        </ul>
      </div>

      {/* GIÁ TRỊ CỐT LÕI */}
      <div className="core-values-section">
        <h2 className="content-heading">GIÁ TRỊ CỐT LÕI:</h2>
        <ol>
          <li>**Chất lượng và an toàn thực phẩm**</li>
          <li>**Tôn vinh giá trị truyền thống**</li>
          <li>**Tiện lợi và thân thiện với người tiêu dùng**</li>
          <li>**Bền vững và có trách nhiệm**</li>
        </ol>
      </div>

      {/* FOOTER TEXT */}
      <div className="footer-text mt-4 pt-3 border-top">
        <p className="slogan-text">
          **BẾP SẠCH VIỆT** – Mang hương vị vùng miền đến bếp nhà bạn.
        </p>
      </div>
    </div>
  );
}

export default AboutUsContent;
