import React, { useState, useEffect, useRef } from "react";
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
  FaUsers,
  FaShieldAlt,
  FaChartLine,
  FaQuoteLeft,
  FaPaperPlane,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTrophy,
  FaMedal,
  FaFire,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import contactApi from "../../services/contact.service";
import toast from "react-hot-toast";
import "../../assets/styles/pages.css";

const AboutPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Counter Animation
  const [students, setStudents] = useState(0);
  const [years, setYears] = useState(0);
  const [blackBelts, setBlackBelts] = useState(0);

  const counterRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Counter observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounter(setStudents, 1500, 2000); // Điều chỉnh số học viên cho thực tế với timeline
          animateCounter(setYears, 20, 1500);
          animateCounter(setBlackBelts, 20, 1800);
        }
      },
      { threshold: 0.5 },
    );

    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  const animateCounter = (setter, target, duration) => {
    let start = 0;
    const increment = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(start);
      }
    }, 16);
  };

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
        toast.success(
          "Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ sớm.",
        );
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gửi thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="liquid-bg text-white">
      {/* INLINE STYLES CHO HIỆU ỨNG LIQUID & GLASS 
        Bạn có thể mang đoạn style này vào pages.css sau nếu muốn code sạch hơn
      */}
      <style>{`
        .liquid-bg {
          position: relative;
          background-color: #120b12; /* Nền base tối nhẹ */
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(139, 0, 0, 0.4) 0%, transparent 50%), /* Đỏ đô */
            radial-gradient(circle at 85% 30%, rgba(212, 175, 55, 0.2) 0%, transparent 50%), /* Vàng Gold */
            radial-gradient(circle at 50% 90%, rgba(10, 25, 47, 0.6) 0%, transparent 50%); /* Xanh navy sâu */
          background-attachment: fixed;
          min-height: 100vh;
          overflow: hidden;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          border-radius: 24px;
          transition: all 0.3s ease;
        }

        .glass-panel:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(212, 175, 55, 0.3); /* Viền gold nhẹ khi hover */
          box-shadow: 0 15px 45px 0 rgba(0, 0, 0, 0.4);
        }

        .text-gradient-gold {
          background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Tối ưu Glass Input Form */
        .glass-input .form-control {
          background: rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        
        .glass-input .form-control:focus {
          background: rgba(0, 0, 0, 0.4) !important;
          border-color: #d4af37 !important;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2) !important;
        }

        .glass-input label {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .timeline-line {
          border-left: 2px dashed rgba(212, 175, 55, 0.4);
          margin-left: 1.5rem;
          padding-left: 2rem;
        }
      `}</style>

      {/* HERO SECTION - Glass Style */}
      <div
        className="position-relative text-center py-5 py-lg-8"
        style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}
      >
        {/* Decorative Elements */}
        <div
          className="position-absolute top-50 start-50 translate-middle opacity-10"
          style={{ fontSize: "30vw", filter: "blur(4px)" }}
        >
          🥋
        </div>

        <Container className="position-relative z-2">
          <div
            className="glass-panel p-5 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            <h1
              className="display-2 fw-black mb-3 text-white"
              style={{ letterSpacing: "2px" }}
            >
              KAZOKU KARATE
            </h1>
            <h2 className="fs-3 fw-bold mb-4 text-gradient-gold">
              Võ Đạo – Kỷ Luật – Tinh Thần – Gia Đình
            </h2>
            <p className="lead fs-5 mb-0 opacity-90 mx-auto text-light">
              Nơi rèn luyện thân – tâm – trí. Xây dựng nhân cách samurai cho thế
              hệ trẻ và người lớn.
            </p>
          </div>
        </Container>
      </div>

      {/* STATS BAR (Đã xử lý thêm chữ và dấu cộng vào hàng) */}
      <div ref={counterRef} className="py-5 position-relative">
        <Container>
          <Row className="text-center g-4">
            <Col md={4}>
              <div className="glass-panel p-4 h-100">
                <h2 className="display-4 fw-bold text-gradient-gold mb-2">
                  {students.toLocaleString()}+
                </h2>
                <p className="text-light fs-5 mb-0 text-uppercase tracking-wider">
                  Học Viên Đang Tập
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="glass-panel p-4 h-100">
                <h2 className="display-4 fw-bold text-gradient-gold mb-2">
                  {years} Năm
                </h2>
                <p className="text-light fs-5 mb-0 text-uppercase tracking-wider">
                  Kinh Nghiệm
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="glass-panel p-4 h-100">
                <h2 className="display-4 fw-bold text-gradient-gold mb-2">
                  {blackBelts.toLocaleString()}+
                </h2>
                <p className="text-light fs-5 mb-0 text-uppercase tracking-wider">
                  Đơn Vị Tập Luyện
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Founder Story */}
      <Container className="py-5 position-relative z-2">
        <Row className="align-items-center g-5">
          <Col lg={5}>
            <div className="glass-panel p-2 overflow-hidden position-relative">
              <img
                src="/images/aboutpage1.jpg"
                alt="Sensei - Founder Karate Kazoku"
                className="w-100 rounded-4"
                style={{ height: "600px", objectFit: "cover" }}
              />
              <div
                className="position-absolute bottom-0 start-0 end-0 p-4 m-2 glass-panel"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <h3 className="fw-bold mb-1 text-gradient-gold">
                  Sensei Đinh Vạn Năng
                </h3>
                <p className="mb-0 text-light">
                  Founder & Head Instructor – 5th Dan
                </p>
              </div>
            </div>
          </Col>

          <Col lg={7}>
            <div className="glass-panel p-5 h-100 d-flex flex-column justify-content-center">
              <h2 className="display-5 fw-black mb-4 text-gradient-gold">
                Câu Chuyện
              </h2>
              <div className="mb-4">
                <FaQuoteLeft className="text-warning display-4 opacity-50 float-start me-4" />
                <p
                  className="fs-4 fst-italic text-light"
                  style={{ lineHeight: "1.6" }}
                >
                  "Kazoku không chỉ là võ đường. Đây là nơi chúng tôi xây dựng
                  một gia đình võ đạo – nơi con người rèn luyện ý chí, tôn trọng
                  lẫn nhau và vượt qua giới hạn của chính mình."
                </p>
              </div>
              <p className="fs-5 text-light opacity-75 mb-4">
                Với hơn 20 năm kinh nghiệm giảng dạy Karate Do, Sensei Đinh Vạn
                Năng cùng gia đình Kazoku đã tạo nên môi trường đào tạo karate
                chuyên nghiệp, an toàn và đầy cảm hứng cho mọi lứa tuổi tại
                TP.HCM.
              </p>
              <div>
                <Badge
                  bg="transparent"
                  className="fs-6 px-4 py-3 border border-warning text-warning rounded-pill"
                >
                  Truyền Thống • Kỷ Luật • Tôn Trọng • Gia Đình
                </Badge>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Timeline */}
      <div className="py-5 position-relative z-2">
        <Container>
          <h2 className="text-center display-5 fw-black mb-5 text-gradient-gold">
            HÀNH TRÌNH KAZOKU
          </h2>
          <div
            className="timeline-container mx-auto"
            style={{ maxWidth: "800px" }}
          >
            {[
              {
                year: "2006",
                title: "Khởi Nguyên",
                desc: "Thành lập dojo đầu tiên tại cơ sở Tân Hương.",
              },
              {
                year: "2017",
                title: "Phát Triển",
                desc: "Mở rộng chương trình thiếu nhi & người lớn.",
              },
              {
                year: "2022",
                title: "Gia Tăng",
                desc: "Xây dựng cộng đồng mạnh mẽ, tổ chức giải đấu nội bộ.",
              },
              {
                year: "2025",
                title: "Hiện Tại",
                desc: "Hơn 1250 học viên, hợp tác với các liên đoàn karate quốc tế.",
              },
            ].map((item, i) => (
              <div key={i} className="d-flex mb-4">
                <div
                  className="text-gradient-gold fw-bold display-6 me-4"
                  style={{ width: "100px" }}
                >
                  {item.year}
                </div>
                <div className="glass-panel flex-grow-1 p-4">
                  <h4 className="fw-bold text-white mb-2">{item.title}</h4>
                  <p className="text-light opacity-75 mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Core Values */}
      <Container className="py-5 position-relative z-2">
        <h2 className="text-center display-5 fw-black mb-5 text-gradient-gold">
          Giá Trị Cốt Lõi
        </h2>
        <Row className="g-4">
          {[
            {
              icon: FaShieldAlt,
              title: "Kỷ Luật & Tôn Trọng",
              desc: "Xây dựng nhân cách qua võ đạo truyền thống.",
            },
            {
              icon: FaFire,
              title: "Tinh Thần Chiến Binh",
              desc: "Vượt qua giới hạn, rèn luyện ý chí mạnh mẽ.",
            },
            {
              icon: FaUsers,
              title: "Tinh Thần Gia Tộc",
              desc: "Môi trường ấm áp như một gia đình thực thụ.",
            },
            {
              icon: FaMedal,
              title: "Chất Lượng Đỉnh Cao",
              desc: "Giảng viên giàu kinh nghiệm, chương trình bài bản.",
            },
          ].map((item, i) => (
            <Col md={6} lg={3} key={i}>
              <div className="glass-panel p-4 h-100 text-center text-white">
                <div
                  className="d-inline-block p-3 rounded-circle mb-3"
                  style={{ background: "rgba(212, 175, 55, 0.1)" }}
                >
                  <item.icon className="fs-1" style={{ color: "#d4af37" }} />
                </div>
                <h5 className="fw-bold text-gradient-gold">{item.title}</h5>
                <p className="small text-light opacity-75 mb-0">{item.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Contact Section */}
      <div className="py-5 position-relative z-2">
        <Container>
          <Row className="g-5 align-items-stretch">
            <Col lg={5}>
              <div className="glass-panel p-5 h-100">
                <h2 className="fw-black display-5 mb-4 text-gradient-gold">
                  Liên Hệ & Đăng Ký
                </h2>
                <p className="fs-5 mb-5 text-light opacity-75">
                  Sẵn sàng bắt đầu hành trình võ đạo? Chúng tôi luôn chào đón
                  bạn và gia đình.
                </p>
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle"
                      style={{ background: "rgba(212, 175, 55, 0.1)" }}
                    >
                      <FaMapMarkerAlt
                        style={{ color: "#d4af37" }}
                        className="fs-4"
                      />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold text-white">Địa Chỉ</h6>
                      <small className="text-light opacity-75">
                        65 Huỳnh Thúc Kháng, Quận 1, TP.HCM
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle"
                      style={{ background: "rgba(212, 175, 55, 0.1)" }}
                    >
                      <FaPhoneAlt
                        style={{ color: "#d4af37" }}
                        className="fs-4"
                      />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold text-white">Hotline</h6>
                      <small className="text-light opacity-75">
                        0901 234 567 (Sensei A)
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle"
                      style={{ background: "rgba(212, 175, 55, 0.1)" }}
                    >
                      <FaEnvelope
                        style={{ color: "#d4af37" }}
                        className="fs-4"
                      />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold text-white">Email</h6>
                      <small className="text-light opacity-75">
                        contact@kazokukarate.vn
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={7}>
              <div className="glass-panel p-5 h-100">
                <h4 className="fw-bold text-gradient-gold mb-4 fs-3">
                  Gửi Tin Nhắn Cho Chúng Tôi
                </h4>
                <Form onSubmit={handleSubmit} className="glass-input">
                  <Row>
                    <Col md={6}>
                      <FloatingLabel
                        controlId="name"
                        label="Họ tên"
                        className="mb-4"
                      >
                        <Form.Control
                          type="text"
                          placeholder="Họ tên"
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
                        className="mb-4"
                      >
                        <Form.Control
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </FloatingLabel>
                    </Col>
                  </Row>
                  <FloatingLabel
                    controlId="subject"
                    label="Tiêu đề"
                    className="mb-4"
                  >
                    <Form.Control
                      type="text"
                      placeholder="Tiêu đề"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </FloatingLabel>
                  <FloatingLabel
                    controlId="message"
                    label="Tin nhắn"
                    className="mb-4"
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Tin nhắn"
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
                    size="lg"
                    className="w-100 rounded-pill fw-bold border-0 py-3"
                    style={{
                      background: "linear-gradient(to right, #d4af37, #aa771c)",
                      color: "#000",
                      boxShadow: "0 4px 15px rgba(212, 175, 55, 0.4)",
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      "Đang gửi..."
                    ) : (
                      <>
                        Gửi Tin Nhắn <FaPaperPlane className="ms-2" />
                      </>
                    )}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Google Map */}
      <Container className="py-5 position-relative z-2">
        <h2 className="text-center display-5 fw-black mb-5 text-gradient-gold">
          Tìm Chúng Tôi
        </h2>
        <div className="glass-panel p-2 overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4945466164723!2d106.69999731480077!3d10.773383292323565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a602db!2zNjUgSHXhuqduIFRow7pjIEtow6FuZywgQsO0biBOZ8OhaSwgUTEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1690000000000!5m2!1svi!2s"
            width="100%"
            height="500"
            style={{ border: 0, borderRadius: "16px" }}
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
