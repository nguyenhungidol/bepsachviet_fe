import "./Introduce.css"; // Quan trọng: Import file CSS vào đây
import { Container } from "react-bootstrap";

const Introduce = () => {
  return (
    <div className="introduce-page">
      <div className="page-header-top bg-gray-100 py-3">
        <Container>
          <div className="breadcrumb text-sm text-muted">
            Trang chủ » <span className="text-primary"> Giới thiệu</span>
          </div>
        </Container>
      </div>
      <div className="content-container">
        {/* Cột Trái: Ảnh "About us" */}
        <div className="left-column">
          <div className="about-us-block">
            <div className="about-us-title">About us</div>
            {/*  */}
          </div>
        </div>

        {/* Cột Phải: Nội dung */}
        <div className="right-column">
          {/* VỀ CHÚNG TÔI */}
          <h2 className="content-heading top-heading">VỀ CHÚNG TÔI:</h2>
          <p>
            BẾP SẠCH VIỆT ra đời từ tình yêu và niềm đam mê đối với ẩm thực
            truyền thống của các vùng miền Việt Nam. Được thành lập bởi những
            người con đất Việt, thương hiệu mang theo sứ mệnh kết nối mọi người
            với tinh hoa ẩm thực quê hương. Ý tưởng bắt nguồn từ mong muốn đem
            đến cho người tiêu dùng không chỉ những món đặc sản phong phú, mà
            còn là sự tiện lợi, an toàn trong từng bữa ăn hàng ngày.
          </p>

          {/* CHÚNG TÔI */}
          <h2 className="content-heading">CHÚNG TÔI:</h2>
          <p>
            Những thành viên sáng lập của BẾP SẠCH VIỆT từng đi khắp các vùng
            miền, từ Tây Bắc hùng vĩ đến miền Tây sông nước, để khám phá và
            tuyển chọn những nguyên liệu đặc trưng. Trong hành trình ấy, chúng
            tôi nhận ra rằng mọi dân tộc đều có những món ăn độc đáo, mang hương
            vị đặc biệt mà không phải ai cũng có cơ hội được thưởng thức. Chính
            vì vậy, BẾP SẠCH VIỆT ra đời với mong muốn đưa hương vị đặc sản của
            mọi miền đến gần hơn với bữa cơm của mỗi gia đình, đồng thời mang
            đến sự tiện lợi và an toàn thực phẩm.
          </p>

          {/* GIÁ TRỊ CỐT LÕI */}
          <h2 className="content-heading">GIÁ TRỊ CỐT LÕI:</h2>
          <div>
            <p className="core-value-item">
              1. Chất lượng và an toàn thực phẩm
            </p>
            <p>
              BẾP SẠCH VIỆT cam kết mang đến những sản phẩm đạt tiêu chuẩn chất
              lượng và an toàn thực phẩm. Mọi nguyên liệu đều được lựa chọn kỹ
              lưỡng từ các nguồn cung ứng đáng tin cậy, qua quá trình sơ chế và
              chế biến sạch sẽ, giữ trọn vẹn hương vị tự nhiên của sản phẩm.
            </p>

            <p className="core-value-item">2. Tôn vinh giá trị truyền thống</p>
            <p>
              Thương hiệu không chỉ là cầu nối giữa người tiêu dùng và các món
              đặc sản, mà còn là đại sứ văn hóa ẩm thực của từng vùng miền. Mỗi
              món ăn của BẾP SẠCH VIỆT đều mang trong mình câu chuyện về văn
              hóa, con người và tinh thần của vùng đất nơi món ăn ra đời.
            </p>
            <p className="core-value-item">
              3. Tiện lợi và thân thiện với người tiêu dùng
            </p>
            <p>
              Sản phẩm của BẾP SẠCH VIỆT được chế biến sẵn hoặc sơ chế, giúp
              người dùng tiết kiệm thời gian nấu nướng mà vẫn có thể thưởng thức
              những món ăn đặc sản như chính tay mình làm. Thương hiệu đặt mục
              tiêu mang đến trải nghiệm ẩm thực tiện lợi nhưng không đánh mất đi
              giá trị nguyên bản của món ăn.
            </p>
            <p className="core-value-item">4. Bền vững và có trách nhiệm:</p>
            <p>
              BẾP SẠCH VIỆT hiểu rằng thành công không chỉ đến từ việc kinh
              doanh hiệu quả, mà còn từ việc bảo vệ môi trường và đóng góp cho
              cộng đồng. Vì thế, thương hiệu luôn chú trọng vào việc sử dụng các
              nguyên liệu bền vững và phát triển các mô hình kinh doanh có trách
              nhiệm với xã hội.
            </p>
          </div>
          <h2 className="content-heading">SỨ MỆNH:</h2>
          <div>
            <ul>
              <li>
                Sứ mệnh của BẾP SẠCH VIỆT là trở thành nhịp cầu kết nối văn hóa
                ẩm thực giữa các vùng miền và người tiêu dùng. Thương hiệu không
                chỉ muốn mang đến những món ăn ngon mà còn lan tỏa những giá trị
                tinh túy của ẩm thực Việt Nam, giúp mỗi người tiêu dùng, dù ở
                bất cứ đâu, đều có thể trải nghiệm trọn vẹn hương vị quê hương.{" "}
              </li>
              <li>
                Với BẾP SẠCH VIỆT , mỗi bữa ăn không chỉ là thời gian thưởng
                thức món ngon mà còn là cơ hội để gắn kết gia đình, chia sẻ yêu
                thương và trân trọng những giá trị truyền thống. Trong tương
                lai, BẾP SẠCH VIỆT sẽ không ngừng nỗ lực để tiếp tục sứ mệnh
                này, mở rộng thêm các dòng sản phẩm đặc sản vùng miền, mang đến
                sự lựa chọn phong phú và tiện lợi cho người tiêu dùng.{" "}
              </li>
            </ul>
            <span className="slogan-text">
              {" "}
              BẾP SẠCH VIỆT – Mang hương vị vùng miền đến bếp nhà bạn.{" "}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduce;
