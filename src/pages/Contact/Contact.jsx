import { Form, Button } from "react-bootstrap";
import "./Contact.css";
import { Container } from "react-bootstrap";

const ContactForm = () => (
  <div className="bg-white p-4 shadow rounded h-100">
    <h2 className="section-title mb-4">Gửi tin nhắn cho chúng tôi</h2>

    <Form className="space-y-3">
      <Form.Group className="mb-3">
        <span className="text-muted fw-bold">Họ và tên*</span>
        <Form.Control type="text" placeholder="Nguyễn Văn A" required />
      </Form.Group>

      <Form.Group className="mb-3">
        <span className="text-muted fw-bold">Email*</span>
        <Form.Control type="email" placeholder="exampler@gmail.com" required />
      </Form.Group>

      <Form.Group className="mb-3">
        <span className="text-muted fw-bold">Điện thoại*</span>
        <Form.Control type="tel" placeholder="0987654321" required />
      </Form.Group>

      <Form.Group className="mb-3">
        <span className="text-muted fw-bold">Nội dung*</span>
        <Form.Control
          as="textarea"
          rows={5}
          placeholder="Nhập nội dung liên hệ..."
          required
        />
      </Form.Group>

      <Button type="submit" className="contact-btn w-auto px-4">
        GỬI LIÊN HỆ
      </Button>
    </Form>
  </div>
);

// Thông tin liên hệ + Map
const ContactInfoAndMap = () => {
  const mapEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.896798083907!2d105.8171124749814!3d20.99893968940807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135add608d0e729%3A0x2ff2597401a7d656!2zOTEgVGFtIEtodcahbmcsIEtowrDGoW5nIFRoxrDGoW5nLCDEkOG7kW5nIMSQYSwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s";

  return (
    <div className="h-100">
      <div className="bg-white p-4 shadow rounded mb-4">
        <h2 className="section-title mb-3">Thông tin liên hệ</h2>

        <div className="mb-3">
          <h5 className="fw-bold">Địa chỉ liên hệ</h5>
          <p className="text-muted">
            Ngõ 91 Tam Khương, nhà số 2, Đống Đa, Hà Nội
          </p>
        </div>

        <div className="mb-3">
          <h5 className="fw-bold">Số điện thoại</h5>
          <p className="text-success fw-bold fs-5">
            0888 339 655 &nbsp; | &nbsp; 0963 538 357
          </p>
          <p className="text-muted">Thứ 2 – Chủ nhật: 9:00 – 18:00</p>
        </div>

        <div>
          <h5 className="fw-bold">Email</h5>
          <p className="text-success">bepsachviet@gmail.com</p>
        </div>
      </div>

      <div className="rounded shadow overflow-hidden border">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="340"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Bản đồ Bếp Sạch Việt"
        ></iframe>
      </div>
    </div>
  );
};

const ContactPage = () => (
  <div className="contact-page py-4 bg-light">
    <div className="page-header-top bg-gray-100 py-3">
      <Container>
        <div className="breadcrumb text-sm text-muted">
          Trang chủ » <span className="text-primary">Liên hệ</span>
        </div>
      </Container>
    </div>

    <div className="container">
      <div className="row g-4">
        <div className="col-lg-6">
          <ContactForm />
        </div>

        <div className="col-lg-6">
          <ContactInfoAndMap />
        </div>
      </div>
    </div>
  </div>
);

export default ContactPage;
