import "./RecruitAgents.css"; // Import file CSS
import { NavLink } from "react-router-dom";

const RecruitAgents = () => {
  return (
    <div className="recruit-agents-page">
      <div className="policy-container">
        {/* Khối chính sách đại lý */}
        <section className="main-policy-section">
          <h1 className="main-heading">CHÍNH SÁCH ĐẠI LÝ</h1>

          {/* Phần ảnh minh họa và text bên phải */}
          <div className="policy-intro-wrapper">
            {/* Ảnh minh họa - Dùng tag để gợi ý vị trí ảnh */}
            <div className="policy-image-block">
              {
                <img
                  src="/pexels-mikhail-nilov-8872470-1.jpg"
                  alt="Chính sách đại lý"
                  className="policy-main-image"
                />
              }
            </div>

            <div className="policy-intro-content">
              <p>
                BẾP SẠCH VIỆT là thương hiệu chuyên kinh doanh và phân phối các
                dòng thực phẩm đặc sản vùng miền cao cấp. Chúng tôi mong muốn
                được hợp tác với các đại lý trên 63 tỉnh thành. Hiện nay Bếp
                Sạch Việt vinh dự là nhà phân phối ĐỘC QUYỀN các thương hiệu đặc
                sản sau:
              </p>

              <ul className="product-list">
                <li>
                  Phân phối{" "}
                  <NavLink to="/" className="product-link">
                    <span
                      className="fw-bold text-uppercase "
                      style={{ color: "green" }}
                    >
                      Thực phẩm đông lạnh
                    </span>
                  </NavLink>
                </li>
                <li>Đặc sản Chả/Giò Vịt Vân Đình</li>
                <li>Đặc sản Mọc/Dồi Vịt Vân Đình</li>
                <li>Đặc sản Chân/Cánh Vịt Vân Đình</li>
                <li>Chả sụn</li>
                <li>Đặc sản Đình Vịt &amp; Sả ớt đậu</li>
                <li>Đặc sản Gà ủ muối</li>
                <li>Đặc sản Gà ủ xì dầu</li>
                <li>Tai heo ủ muối / ủ xì dầu</li>
                <li>Chân vịt rút xương ủ muối / ủ xì dầu</li>
                <li>
                  Các sản phẩm{" "}
                  <NavLink to="/" className="product-link">
                    <span
                      className="fw-bold text-uppercase "
                      style={{ color: "green" }}
                    >
                      Thực phẩm Đông lạnh khác (sắp ra mắt)
                    </span>
                  </NavLink>
                </li>
              </ul>

              <p className="commitment-text">
                Tôn chỉ phân phối của{" "}
                <NavLink to="/" className="product-link">
                  <span
                    className="fw-bold text-uppercase "
                    style={{ color: "green" }}
                  >
                    Bếp Sạch Việt
                  </span>
                </NavLink>{" "}
                như sau:
              </p>
              <ul className="benefit-list">
                <li>
                  Sẵn sàng chia sẻ lợi nhuận với các Đại lý, chia sẻ cơ hội,
                  chia sẻ lợi ích kinh doanh và đồng hành lâu dài, bền vững cùng
                  Đại lý.
                </li>
                <li>
                  Quan tâm, hỗ trợ Đại lý cũng như có những hợp tác nhằm nâng
                  cao tính mật thiết giữa Đại lý và Nhà phân phối.
                </li>
                <li>
                  Bảo vệ tối đa cho Đại lý trước những biến động của Thị trường.
                </li>
                <li>
                  Bảo vệ khách hàng cho Đại lý, đảm bảo tính công bằng trên toàn
                  bộ hệ thống phân phối.
                </li>
                <li>
                  Cùng Đại lý mở rộng thị trường và mở rộng kênh phân phối của
                  Đại lý.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Chính sách chiết khấu thưởng */}
        <section className="sub-policy-section">
          <h2 className="sub-heading">Chính sách chiết khấu thưởng</h2>
          <ul className="policy-detail-list">
            <li>
              Dựa theo doanh số cam kết hàng tháng, quý. Quý Đại lý sẽ được tham
              gia chương trình chiết khấu trên doanh số mua hàng dành riêng cho
              đại lý của Nhà phân phối.
            </li>
            <li>
              Khi đạt doanh số mua hàng cam kết, Quý đại lý sẽ được hưởng khoản
              chiết khấu theo tỷ lệ đã thỏa thuận từ đầu quý.
            </li>
            <li>
              Chính sách CHIẾT KHẤU này độc lập và được tiến hành song song, với
              các chương trình hỗ trợ khác mà Nhà phân phối cung cấp.
            </li>
          </ul>
        </section>

        {/* Chính sách bảo vệ giá */}
        <section className="sub-policy-section">
          <h2 className="sub-heading">Chính sách bảo vệ giá</h2>
          <ul className="policy-detail-list">
            <li>
              Căn cứ vào kết quả mua hàng và các cam kết hợp tác khác, Quý đại
              lý sẽ được hưởng chính sách giá dành cho đại lý tương ứng.
            </li>
            <li>
              Chính sách giá được xây dựng để đảm bảo tính cạnh tranh và lợi
              nhuận tối đa cho Quý đại lý trên thị trường.{" "}
            </li>
            <li>
              Trong trường hợp Nhà phân phối giảm giá bán quý đại lý được bảo vệ
              giá đối với những mặt hàng cùng loại theo đúng số lượng hàng. mã
              hàng nhập đang lưu kho của Đại lý. được xác minh trong vòng 15
              ngày kể từ ngày thông báo giảm giá.{" "}
            </li>
            <li>
              Trong trường hợp Nhà phân phối tăng giá Bán. Quý đại lý được thông
              báo trước tối thiểu trong vòng 30 tối đa 45 ngày để có chính sách
              nhập hàng cho phù hợp.{" "}
            </li>
          </ul>
          <h2 className="sub-heading">Bảo vệ khách hàng cho Đại lý</h2>
          <ul className="policy-detail-list">
            <li>
              Các đại lý được khuyến khích mở rộng thị trường để gia tăng lượng
              khách hàng và để trở thành các Đại lý lớn độc quyền phân phối tại
              các khu vực đã được quy hoạch trong hệ thống.
            </li>
            <li>
              Nhà phân phối sẽ yêu cầu khách hàng cấp mã nếu Mã khách hàng thuộc
              đại lý nào thì sẽ được nhà phân phối chuyển khách hàng về cho Đại
              lý đó.{" "}
            </li>
            <li>
              Trong trường hợp các khách hàng mua lẻ liên hệ trực tiếp với Nhà
              phân phối, sẽ được nhà phân phối giới thiệu về nơi Đại lý có khu
              vực nơi khách hàng cư trú.
            </li>
            <li>
              Nhà phân phối bảo vệ quyền phát triển tại địa điểm mới cho Đại lý
              trên toàn kênh phân phối tối đa không quá 3 tháng.
            </li>
          </ul>
          <h2 className="sub-heading">Hợp đồng nguyên tắc & Hỗ trợ công nợ</h2>
          <p>
            Sau khi hai bên ký Hợp đồng nguyên tắc, Quý đại lý sẽ được đưa vào
            danh sách ưu đãi của Nhà phân phối, được hưởng các chính sách dành
            cho đại lý của Nhà phân phối.
          </p>
          <ul className="policy-detail-list">
            <li>Công nợ mua hàng</li>
            <li>Quý đại lý thanh toán 100% trước khi giao hàng.</li>
            <li>
              Trong trường hợp Quý đại lý lập bảo lãnh ngân hàng thời hạn 1 năm
              với số tiền tùy thuộc vào nhu cầu kinh doanh và năng lực tài chính
              của đại lý. Trên cơ sở đó, Quý đại lý sẽ được hưởng hạn mức tín
              dụng từ 40% đến 70% với thời hạn công nợ tối đa là 15 ngày.
            </li>
          </ul>

          <h2 className="sub-heading">Chính sách Marketing phân phối</h2>
          <ul className="policy-detail-list">
            <li>Hỗ trợ về PR – Marketing</li>
            <li>
              Được hỗ trợ catalogue, tờ rơi, banner, … theo chương trình của Nhà
              phân phối.
            </li>
            <li>
              Thông tin về Quý đại lý được quảng cáo cùng nhà phân phối trên các
              phương tiện thông tin đại chúng và trang web của Nhà phân phối.
            </li>
            <li>
              Được tham gia tất cả các chương trình khuyến mãi thúc đẩy bán hàng
              của Nhà phân phối.
            </li>
            <li>
              Cập nhật thông tin về giá cả, hàng hóa, chính sách của hãng và các
              chương trình marketing.
            </li>

            <li>Hỗ trợ về kỹ thuật, giải pháp</li>
            <li>
              Hỗ trợ kỹ thuật qua điện thoại và trực tiếp tại chỗ khi có yêu
              cầu.
            </li>
            <li>
              Đào tạo huấn luyện theo chương trình, theo cấp Đại lý tương ứng
              với từng dòng sản phẩm, công nghệ và kiến thức bán hàng theo
              chương trình của{" "}
              <NavLink to="/" className="product-link">
                <span
                  className="fw-bold text-uppercase "
                  style={{ color: "green" }}
                >
                  Bếp Sạch Việt
                </span>
              </NavLink>{" "}
              khi có chương trình.
            </li>

            <li>Hỗ trợ về hàng hóa</li>
            <li>
              Đổi hàng: Trong vòng 7 ngày kể từ ngày xuất hóa đơn, Quý đại lý
              được đổi hàng mới nếu sản phẩm lỗi do Nhà sản xuất.
            </li>
            <li>
              Trả hàng: Trong vòng 7 ngày kể từ ngày xuất hóa đơn và ký biên bản
              bàn giao nếu hàng hóa, giá cả không đúng thỏa thuận.
            </li>
            <li>
              Vận chuyển: Đại lý chịu trách nhiệm về vận chuyển từ kho Nhà phân
              phối đến điểm giao nhận.
            </li>
          </ul>

          <h2 className="sub-heading">Điều kiện trở thành đại lý phân phối</h2>
          <ul className="policy-detail-list">
            <li>Có mặt bằng đủ điều kiện kinh doanh.</li>
            <li>Có kho lạnh hoặc tủ đông đảm bảo vệ sinh ATTT.</li>
            <li>
              Cam kết nhập đơn hàng & cam kết doanh số tháng-quý theo khu vực.
            </li>
            <li>
              Quản lý Khu vực đã đăng ký với Nhà phân phối và tự mở rộng thị
              trường.
            </li>
            <li>Đảm bảo doanh số bán hàng theo nhà phân phối đề ra.</li>
            <li>Xây dựng mạng lưới bán hàng chuyên nghiệp, lành mạnh.</li>
            <li>
              Mở chi nhánh mới được Nhà phân phối hỗ trợ và bảo vệ tối đa.
            </li>
            <li>
              Lập kế hoạch phát triển địa điểm mới và thông báo Nhà phân phối để
              được bảo vệ.
            </li>
            <li>Tự chủ động kế hoạch kinh doanh và phát triển khách hàng.</li>
            <li>
              Nếu không triển khai sau 2-3 tháng, Nhà phân phối sẽ chuyển giao
              quyền bảo vệ cho Đại lý kế tiếp.
            </li>
            <li>
              Nhà phân phối mở rộng mạng lưới sẽ thông báo tới các đại lý khu
              vực lân cận.
            </li>
            <li>
              Đại lý có quyền đăng ký đồng hành cùng Nhà phân phối khi mở rộng
              mạng lưới.
            </li>
            <li>
              Tuân theo nguyên tắc lựa chọn đầu tiên (first-come, first-served).
            </li>
            <li>
              Hỗ trợ Nhà phân phối khi có chương trình khuyến mãi, quảng cáo tại
              điểm kinh doanh.
            </li>
            <li>Không kinh doanh sản phẩm không rõ nguồn gốc xuất xứ.</li>
            <li>
              Đối với đại lý phân phối độc quyền, không kinh doanh sản phẩm
              tương tự thương hiệu khác.
            </li>
            <li>
              Mức giá cho khách hàng cuối đảm bảo tương đương giá bán lẻ đề
              nghị, không bán phá giá.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default RecruitAgents;
