import React from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
  FaGem,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="text-white pt-10 pb-4"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <Container style={{ padding: 0 }}>
        <Row className="g-5 mb-10">
          {/* Cột 1: Identity - Tôn vinh thương hiệu */}
          <Col lg={4} md={12}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <FaGem className="text-gold" size={24} />
              <h3
                className="luxury-serif fw-bold mb-0"
                style={{ letterSpacing: "2px" }}
              >
                THE VAULT
              </h3>
            </div>
            <p
              className="text-  small mb-4 pr-lg-5"
              style={{ lineHeight: "1.8", letterSpacing: "0.5px" }}
            >
              Nơi hội tụ những giá trị sưu tầm đích thực. Chúng tôi không chỉ
              cung cấp thẻ bài, chúng tôi bảo tồn những mảnh ghép lịch sử của
              thế giới TCG với tiêu chuẩn kiểm định khắt khe nhất.
            </p>
            <div className="d-flex gap-4 mt-4">
              {[FaFacebookF, FaInstagram, FaYoutube, FaTiktok].map(
                (Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-  hover-gold transition-all"
                  >
                    <Icon size={16} />
                  </a>
                ),
              )}
            </div>
          </Col>

          {/* Cột 2: Curation - Danh mục chọn lọc */}
          <Col lg={2} md={4} sm={6}>
            <h6
              className="text-gold text-uppercase mb-4 fw-bold tracking-widest"
              style={{ fontSize: "0.75rem" }}
            >
              Bộ Sưu Tập
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li>
                <Link to="/products" className="footer-link">
                  PSA Graded
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">
                  BGS Pristine
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">
                  Vintage Base Set
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">
                  Limited Edition
                </Link>
              </li>
            </ul>
          </Col>

          {/* Cột 3: Services - Dịch vụ cao cấp */}
          <Col lg={2} md={4} sm={6}>
            <h6
              className="text-gold text-uppercase mb-4 fw-bold tracking-widest"
              style={{ fontSize: "0.75rem" }}
            >
              Dịch Vụ
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li>
                <Link to="#" className="footer-link">
                  Ký gửi thẻ bài
                </Link>
              </li>
              <li>
                <Link to="#" className="footer-link">
                  Bảo hiểm vận chuyển
                </Link>
              </li>
              <li>
                <Link to="#" className="footer-link">
                  Tư vấn đầu tư
                </Link>
              </li>
              <li>
                <Link to="#" className="footer-link">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </Col>

          {/* Cột 4: Concierge - Liên hệ & Newsletter */}
          <Col lg={4} md={4}>
            <h6
              className="text-gold text-uppercase mb-4 fw-bold tracking-widest"
              style={{ fontSize: "0.75rem" }}
            >
              Bản tin The Vault
            </h6>
            <p className="text small mb-4 italic">
              Đăng ký để nhận thông báo sớm nhất về các đợt đấu giá thẻ hiếm.
            </p>

            <Form onSubmit={(e) => e.preventDefault()}>
              <InputGroup className="mb-3 border-bottom border-secondary">
                <Form.Control
                  placeholder="Địa chỉ Email của quý khách..."
                  className="bg-transparent text-white border-0 shadow-none ps-0 rounded-0 footer-input-luxury"
                  style={{ fontSize: "0.85rem" }}
                />
                <Button variant="link" className="text-gold p-0">
                  <FaPaperPlane size={14} />
                </Button>
              </InputGroup>
            </Form>

            <div className="mt-5">
              <div className="d-flex align-items-center gap-3 mb-2">
                <FaMapMarkerAlt className="text-gold" size={12} />
                <span className="text-  small">
                  Quận 1, Thành phố Hồ Chí Minh
                </span>
              </div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <FaPhoneAlt className="text-gold" size={12} />
                <span className="text-  small">+84 93X XXX XXX</span>
              </div>
            </div>
          </Col>
        </Row>

        <hr className="border-secondary my-5 opacity-10" />

        <Row className="align-items-center pb-3">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <p
              className="text-  mb-0"
              style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
            >
              © 2026 THE VAULT COLLECTIBLES. TRUNG TÂM KIỂM ĐỊNH THẺ BÀI CAO
              CẤP.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex gap-4 justify-content-center justify-content-md-end grayscale-icons opacity-50">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                height="12"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                height="15"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="Paypal"
                height="15"
              />
            </div>
          </Col>
        </Row>
      </Container>

      {/* CSS Inline cho các hiệu ứng (Bảo có thể đưa vào file .css chung) */}
      <style>{`
        .footer-link {
          color: #888 !important;
          text-decoration: none;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }
        .footer-link:hover {
          color: #D4AF37 !important;
          padding-left: 5px;
        }
        .text-gold { color: #D4AF37 !important; }
        .hover-gold:hover { color: #D4AF37 !important; }
        .footer-input-luxury::placeholder {
          color: #444;
          font-style: italic;
        }
        .grayscale-icons img {
          filter: grayscale(100%) brightness(200%);
        }
        .pt-10 { padding-top: 6rem; }
        .mb-10 { margin-bottom: 5rem; }
      `}</style>
    </footer>
  );
};

export default Footer;
