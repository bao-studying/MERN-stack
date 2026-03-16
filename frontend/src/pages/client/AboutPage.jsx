import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  FloatingLabel,
  Badge,
} from "react-bootstrap";
import {
  FaPaw,
  FaChartLine,
  FaShieldAlt,
  FaUsersCog,
  FaQuoteLeft,
  FaPaperPlane,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTrophy,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import contactApi from "../../services/contact.service";
import toast from "react-hot-toast";
import "../../assets/styles/pages.css"; // Giả sử bạn có file css riêng cho page này

const AboutPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const res = await contactApi.sendContact(formData);
      if (res.success) {
        toast.success("Tin nhắn đã gửi thành công! Chúng tôi sẽ phản hồi sớm.");
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Gửi thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark text-white">
      {/* HERO - Đột phá với gradient + Poke Ball overlay */}
      <div
        className="position-relative text-center py-5 py-lg-8"
        style={{
          background:
            "linear-gradient(135deg, #ff0000 0%, #ffcc00 50%, #0066cc 100%)",
          minHeight: "80vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-60"></div>

        {/* Poke Ball decorative */}
        <div
          className="position-absolute top-50 start-50 translate-middle opacity-10"
          style={{ fontSize: "40vw", zIndex: 0 }}
        >
          ⚪
        </div>

        <Container className="position-relative z-2">
          <h1 className="display-3 fw-black mb-4 text-shadow-lg">BAO Po_Box</h1>
          <h2 className="display-5 fw-bold mb-4 text-yellow">
            Cộng đồng Đầu tư & Sưu tầm Pokémon TCG lớn nhất Việt Nam
          </h2>
          <p className="lead fs-4 mb-5 opacity-90">
            Nơi những sealed box hiếm, Elite Trainer Box mint condition trở
            thành tài sản tăng giá theo thời gian.
          </p>
          <Button
            as={Link}
            to="/products"
            variant="warning"
            size="lg"
            className="rounded-pill px-5 py-3 fw-bold shadow-lg fs-4"
          >
            Khám phá Kho Báu Ngay
          </Button>
        </Container>
      </div>

      {/* Founder Story - Cá nhân hóa với tên Dương Gia Bảo */}
      <Container className="py-5">
        <Row className="align-items-center g-5">
          <Col lg={5}>
            <div className="founder-card rounded-4 overflow-hidden shadow-2xl position-relative">
              <img
                src="https://conteudo.imguol.com.br/c/entretenimento/24/2019/08/16/thomas-shelby-personagem-de-peaky-blinders-em-imagem-da-5-temporada-1565977143218_v2_4x3.jpg"
                alt="Dương Gia Bảo - Founder BAO Po_Box"
                className="w-100"
                style={{ height: "500px", objectFit: "cover" }}
              />
              <div className="position-absolute bottom-0 start-0 end-0 bg-gradient-dark p-4 text-white">
                <h3 className="fw-bold mb-1">Dương Gia Bảo</h3>
                <p className="mb-0">Founder & Visionary</p>
              </div>
            </div>
          </Col>

          <Col lg={7}>
            <h2 className="display-5 fw-black mb-4 text-yellow">
              Câu chuyện khởi nguồn
            </h2>
            <div className="mb-4">
              <FaQuoteLeft className="text-warning display-1 opacity-25 float-start me-4" />
              <p className="fs-4 fst-italic text-light">
                "Từ năm 2020, khi chứng kiến giá sealed box Pokémon tăng gấp 3–5
                lần chỉ sau vài năm, tôi nhận ra đây không chỉ là sở thích – đây
                là một kênh đầu tư thực thụ. Tôi quyết định xây dựng BAO Po_Box
                để mọi người cùng tham gia, cùng bảo vệ giá trị sưu tầm, cùng
                đầu tư vào những sản phẩm authentic mint condition – nơi đam mê
                gặp gỡ lợi nhuận."
              </p>
            </div>
            <p className="fs-5 text-muted">
              Dương Gia Bảo – người sáng lập BAO Po_Box – với hơn 5 năm kinh
              nghiệm trong cộng đồng Pokémon TCG Việt Nam, cam kết mang đến
              những sản phẩm sealed tốt nhất, kiểm định nghiêm ngặt và cộng đồng
              minh bạch.
            </p>
            <Badge bg="warning" className="fs-5 px-4 py-2 mt-3">
              100% Authentic – Mint Condition – Giá trị tăng trưởng
            </Badge>
          </Col>
        </Row>
      </Container>

      {/* Timeline */}
      <div className="bg-gradient-dark py-5">
        <Container>
          <h2 className="text-center display-5 fw-black mb-5 text-yellow">
            Hành trình BAO Po_Box
          </h2>
          <div className="timeline-container">
            {[
              {
                year: "2021",
                title: "Khởi đầu",
                desc: "Cửa hàng nhỏ tại TP.HCM, tập trung sealed box hiếm đầu tiên.",
              },
              {
                year: "2022",
                title: "Bùng nổ",
                desc: "Mở rộng kho hàng, đạt 2.000 khách hàng sưu tầm & đầu tư.",
              },
              {
                year: "2024",
                title: "Cộng đồng",
                desc: "Ra mắt nền tảng online, nhóm đầu tư & chia sẻ kiến thức TCG.",
              },
              {
                year: "2025",
                title: "Hiện tại",
                desc: "Hơn 10.000 thành viên, hợp tác trực tiếp với nhà phân phối Nhật Bản & Mỹ.",
              },
            ].map((item, i) => (
              <div key={i} className="timeline-item d-flex mb-5">
                <div className="timeline-year text-warning fw-bold fs-1 me-4">
                  {item.year}
                </div>
                <Card className="bg-dark border-warning border-2 flex-grow-1 shadow-lg">
                  <Card.Body>
                    <h4 className="fw-bold text-warning">{item.title}</h4>
                    <p className="text-light mb-0">{item.desc}</p>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Giá trị cốt lõi */}
      <Container className="py-5">
        <h2 className="text-center display-5 fw-black mb-5 text-yellow">
          Giá trị cốt lõi
        </h2>
        <Row className="g-4">
          {[
            {
              icon: FaShieldAlt,
              title: "Authentic 100%",
              desc: "Mọi sản phẩm được kiểm định nguồn gốc, mint condition.",
            },
            {
              icon: FaChartLine,
              title: "Đầu tư thông minh",
              desc: "Sealed box có giá trị tăng trưởng theo thời gian.",
            },
            {
              icon: FaUsersCog,
              title: "Cộng đồng mạnh mẽ",
              desc: "Nơi mọi người cùng chia sẻ kiến thức & cơ hội.",
            },
            {
              icon: FaTrophy,
              title: "Chất lượng đỉnh cao",
              desc: "Chỉ chọn những set hiếm, hộp sealed tốt nhất.",
            },
          ].map((item, i) => (
            <Col md={6} lg={3} key={i}>
              <Card className="bg-dark border-warning border-2 h-100 text-center hover-lift shadow-lg">
                <Card.Body className="p-4">
                  <item.icon className="text-warning fs-1 mb-3" />
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="small text-light">{item.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Contact Section */}
      <div className="bg-gradient-primary py-5">
        <Container>
          <Row className="g-5 align-items-stretch">
            <Col lg={5}>
              <h2 className="fw-black display-5 mb-4 text-yellow">
                Liên hệ & Hợp tác
              </h2>
              <p className="fs-5 mb-4 text-light">
                Bạn muốn tham gia cộng đồng đầu tư? Cần tư vấn sản phẩm hiếm?
                Hay muốn hợp tác cung cấp sealed box?
              </p>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3 bg-dark p-3 rounded-3">
                  <FaMapMarkerAlt className="text-warning fs-3" />
                  <div>
                    <h6 className="mb-0 fw-bold">Địa chỉ</h6>
                    <small>65 Huỳnh Thúc Kháng, Q.1, TP.HCM</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3 bg-dark p-3 rounded-3">
                  <FaPhoneAlt className="text-warning fs-3" />
                  <div>
                    <h6 className="mb-0 fw-bold">Hotline</h6>
                    <small>0901 234 567 (Anh Bảo)</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3 bg-dark p-3 rounded-3">
                  <FaEnvelope className="text-warning fs-3" />
                  <div>
                    <h6 className="mb-0 fw-bold">Email</h6>
                    <small>contact@baopobox.vn</small>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={7}>
              <Card className="bg-dark border-warning border-2 shadow-2xl overflow-hidden h-100">
                <Card.Body className="p-5">
                  <h4 className="fw-bold text-warning mb-4">
                    Gửi tin nhắn cho chúng tôi
                  </h4>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="name"
                          label="Họ tên"
                          className="mb-3"
                        >
                          <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="email"
                          label="Email"
                          className="mb-3"
                        >
                          <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </FloatingLabel>
                      </Col>
                    </Row>
                    <FloatingLabel
                      controlId="subject"
                      label="Tiêu đề"
                      className="mb-3"
                    >
                      <Form.Control
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                      />
                    </FloatingLabel>
                    <FloatingLabel
                      controlId="message"
                      label="Tin nhắn của bạn"
                      className="mb-4"
                    >
                      <Form.Control
                        as="textarea"
                        style={{ height: "160px" }}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                      />
                    </FloatingLabel>
                    <Button
                      type="submit"
                      variant="warning"
                      size="lg"
                      className="w-100 rounded-pill fw-bold shadow-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        "Đang gửi..."
                      ) : (
                        <>
                          Gửi tin nhắn <FaPaperPlane className="ms-2" />
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Google Map */}
      <Container className="py-5">
        <h2 className="text-center display-5 fw-black mb-5 text-yellow">
          Tìm chúng tôi
        </h2>
        <div className="rounded-4 overflow-hidden shadow-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4945466164723!2d106.69999731480077!3d10.773383292323565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a602db!2zNjUgSHXhuqduIFRow7pjIEtow6FuZywgQsO0biBOZ8OhaSwgUTEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1690000000000!5m2!1svi!2s"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
