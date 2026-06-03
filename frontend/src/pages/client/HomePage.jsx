import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Carousel,
  Card,
  Badge,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaShippingFast,
  FaLeaf,
  FaMedal,
  FaArrowRight,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import QuickViewModal from "../../components/product/QuickViewModal";
import productApi from "../../services/product.service";
import categoryApi from "../../services/category.service";
import blogApi from "../../services/blog.service";
import "../../assets/styles/home.css";

const HomePage = () => {
  // --- STATE DỮ LIỆU (Giữ nguyên 100%) ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- FETCH DATA TỪ API (Giữ nguyên 100%) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, blogRes] = await Promise.all([
          productApi.getAll({ limit: 12, sort: "-createdAt" }),
          categoryApi.getAll(),
          blogApi.getAll({ limit: 3, sort: "-createdAt" }),
        ]);

        if (prodRes && prodRes.data) {
          const list = Array.isArray(prodRes.data)
            ? prodRes.data
            : prodRes.data.products || [];

          const mappedProducts = list.map((p) => ({
            ...p,
            id: p._id,
            price: p.price_cents,
            salePrice:
              p.compareAtPriceCents && p.compareAtPriceCents > p.price_cents
                ? p.compareAtPriceCents
                : null,
            image:
              p.images?.[0]?.imageUrl ||
              "https://placehold.co/300x420?text=Mystery+Card",
            category: p.categoryId?.name || "Sản phẩm",
          }));
          setProducts(mappedProducts);
        }

        if (catRes) {
          let catList = [];
          if (Array.isArray(catRes)) catList = catRes;
          else if (Array.isArray(catRes.data)) catList = catRes.data;
          else if (Array.isArray(catRes.categories))
            catList = catRes.categories;
          else if (catRes.data && Array.isArray(catRes.data.categories))
            catList = catRes.data.categories;

          setCategories(catList);
        }

        // Blogs - Lấy thêm content và midImage
        if (blogRes) {
          const list = Array.isArray(blogRes.blogs)
            ? blogRes.blogs
            : Array.isArray(blogRes.data)
              ? blogRes.data
              : [];

          setBlogs(
            list.map((item) => ({
              _id: item._id,
              title: item.title,
              content: item.content,
              excerpt: item.excerpt,
              imageUrl: item.imageUrl,
              midImage: item.midImage,
              publishedAt: item.publishedAt,
              date: item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString("vi-VN")
                : "Không rõ",
            })),
          );
        }
      } catch (error) {
        console.error("Lỗi tải trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const openBlogModal = (blog) => {
    setSelectedBlog(blog);
    setShowBlogModal(true);
  };

  const closeBlogModal = () => {
    setShowBlogModal(false);
    setSelectedBlog(null);
  };

  const getCategoryImage = (cat, index) => {
    if (cat.image || cat.imageUrl) return cat.image || cat.imageUrl;
    const placeholders = [
      "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80",
    ];
    return placeholders[index % placeholders.length];
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <Spinner animation="border" style={{ color: "#d4af37" }} />
      </div>
    );
  }

  // --- UI MỚI TỪ ĐÂY ---
  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        color: "#e0e0e0",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* 1. HERO SECTION - Cinematic & Immersive */}
      <section className="position-relative">
        <Carousel
          className="border-0"
          interval={5000}
          fade
          controls={false}
          indicators={false}
        >
          <Carousel.Item>
            <div
              className="vw-100 position-relative"
              style={{
                height: "90vh",
                backgroundImage: `url("/images/homepage1.jpg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background:
                    "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.8) 100%)",
                }}
              >
                <Container
                  fluid
                  className="h-100 d-flex flex-column justify-content-center"
                  style={{ padding: 0 }}
                >
                  {" "}
                  <div
                    className="p-5 rounded-4 shadow-lg"
                    style={{
                      maxWidth: "600px",
                      backdropFilter: "blur(12px)",
                      backgroundColor: "rgba(20, 20, 20, 0.4)",
                    }}
                  >
                    <p
                      className="text-uppercase tracking-widest mb-2"
                      style={{
                        color: "#d4af37",
                        letterSpacing: "3px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      câu lạc bộ võ thuật Nhật Bản
                    </p>
                    <h1
                      className="display-4 fw-bold mb-4 text-white"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        lineHeight: "1.2",
                      }}
                    >
                      KAZOKU <br />{" "}
                      <span style={{ color: "#d4af37" }}>KARATE CLUB</span>
                    </h1>
                    <p className="lead mb-5 text-light opacity-75 fs-6">
                      Nơi hội tụ tinh hoa võ đạo, truyền thống và sự phát triển
                      của Karate tại Việt Nam. Hành trình rèn luyện, kết nối và
                      tỏa sáng cùng Kazoku.
                    </p>
                    <Button
                      as={Link}
                      to="/products"
                      className="rounded-0 px-5 py-3 text-uppercase fw-bold border-0 shadow-sm"
                      style={{
                        backgroundColor: "#d4af37",
                        color: "#0a0a0a",
                        letterSpacing: "1px",
                      }}
                    >
                      Xem ngay <FaArrowRight className="ms-2" />
                    </Button>
                  </div>
                </Container>
              </div>
            </div>
          </Carousel.Item>
          {/* Bạn có thể thêm các Carousel.Item khác tương tự ở đây */}
        </Carousel>
      </section>

      {/* 2. OVERLAPPING FEATURES - Glassmorphism Floating Strip */}
      <section style={{ marginTop: "-80px", position: "relative", zIndex: 10 }}>
        <Container style={{ padding: 0 }}>
          <div
            className="rounded-4 p-4 shadow-lg"
            style={{
              backdropFilter: "blur(20px)",
              backgroundColor: "rgba(30, 30, 30, 0.7)",
            }}
          >
            <Row className="g-4 text-center text-md-start">
              {[
                {
                  icon: <FaMedal size={32} style={{ color: "#d4af37" }} />,
                  title: " Nhật Bản Cao Cấp",
                  desc: " Sản phẩm chính hãng, chất lượng vượt trội",
                },
                {
                  icon: <FaShippingFast size={32} className="text-white" />,
                  title: "Vận Chuyển Đặc Quyền",
                  desc: " Vận Chuyển nhanh chóng, an toàn với dịch vụ cao cấp",
                },
                {
                  icon: <FaLeaf size={32} className="text-success" />,
                  title: "Mint Condition",
                  desc: "Tuyển chọn tình trạng hoàn hảo nhất",
                },
              ].map((item, idx) => (
                <Col md={4} key={idx}>
                  <div className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start gap-3">
                    <div
                      className="p-3 rounded-circle"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h6
                        className="fw-bold mb-1 text-white text-uppercase"
                        style={{ letterSpacing: "1px", fontSize: "0.9rem" }}
                      >
                        {item.title}
                      </h6>
                      <p className="text-  small mb-0">{item.desc}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* 3. CATEGORIES - Graded Slab Style (Hình chữ nhật đứng) */}
      {categories.length > 0 && (
        <section className="py-5 mt-5">
          <Container style={{ padding: 0 }}>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <h2
                className="fw-bold text-white m-0"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Danh Mục Sưu Tầm
              </h2>
              <div
                style={{
                  height: "2px",
                  flexGrow: 1,
                  backgroundColor: "rgba(212, 175, 55, 0.2)",
                  margin: "0 20px",
                  marginBottom: "10px",
                }}
              ></div>
            </div>

            <Row
              className="g-4 flex-nowrap overflow-auto hide-scrollbar pb-3"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {categories.map((cat, idx) => (
                <Col
                  xs={6}
                  md={3}
                  lg={2}
                  key={cat._id}
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Link
                    to={`/products?category=${cat._id}`}
                    className="text-decoration-none group d-block"
                  >
                    <div
                      className="position-relative overflow-hidden rounded-3 shadow"
                      style={{
                        aspectRatio: "3/4",
                      }}
                    >
                      <img
                        src={getCategoryImage(cat, idx)}
                        alt={cat.name}
                        className="w-100 h-100 object-fit-cover opacity-75"
                        style={{ transition: "transform 0.5s ease" }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end p-3"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                        }}
                      >
                        <h6
                          className="fw-bold text-white text-uppercase w-100 text-center m-0"
                          style={{
                            fontSize: "0.8rem",
                            letterSpacing: "2px",
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                          }}
                        >
                          {cat.name}
                        </h6>
                      </div>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* 4. SẢN PHẨM MỚI - Asymmetrical Split Layout */}
      <section className="py-5 my-5" style={{ backgroundColor: "#111" }}>
        <Container style={{ padding: 0 }}>
          <Row className="g-5 align-items-center">
            {/* Cột trái: Tiêu đề lớn */}
            <Col lg={4}>
              <div className="pe-lg-4">
                <Badge
                  bg="transparent"
                  className="text-warning mb-3 px-3 py-2 rounded-0 text-uppercase"
                  style={{ letterSpacing: "2px" }}
                >
                  New Arrivals
                </Badge>
                <h2
                  className="display-5 fw-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Kiệt Tác <br /> Vừa Cập Bến
                </h2>
                <p className="text-  mb-5" style={{ lineHeight: "1.8" }}>
                  Khám phá các bộ võ phục mới nhất, được tuyển chọn kỹ lưỡng từ
                  những nguồn uy tín nhất.
                </p>
                <Button
                  as={Link}
                  to="/products"
                  variant="outline-light"
                  className="rounded-0 px-4 py-2 text-uppercase"
                  style={{ letterSpacing: "1px" }}
                >
                  Khám Phá Toàn Bộ
                </Button>
              </div>
            </Col>

            {/* Cột phải: Grid sản phẩm */}
            <Col lg={8}>
              {products.length > 0 ? (
                <Row xs={1} sm={2} className="g-4">
                  {products.slice(0, 4).map((product) => (
                    <Col key={product.id}>
                      <div className="bg-dark rounded-3 p-2 h-100 border-0 transition-all hover-glow">
                        <ProductCard
                          product={product}
                          onQuickView={handleQuickView}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5 rounded-3">
                  <p className="text-  m-0">Kho lưu trữ hiện đang trống.</p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* 5. PARALLAX STATIC BANNER */}
      <section className="mb-5 position-relative">
        <div
          className="w-100 d-flex align-items-center justify-content-center text-center px-3"
          style={{
            height: "450px",
            backgroundImage:`url("/images/homepage2.jpg")`,
             backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed", // Hiệu ứng Parallax sang trọng
          }}
        >
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          ></div>
          <div
            className="position-relative text-white z-1"
            style={{ maxWidth: "800px" }}
          >
            <FaMedal
              size={48}
              style={{ color: "#d4af37", marginBottom: "20px" }}
            />
            <h2
              className="fw-bold mb-4 display-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Tiếp Nối{"  "}
              <span style={{ color: "#d4af37", fontStyle: "italic" }}>
                Đam Mê
              </span>
            </h2>
            <p
              className="fs-5 mb-5 opacity-75 fw-light mx-auto"
              style={{ maxWidth: "600px" }}
            >
              Hơn cả một câu lạc bộ, chúng tôi là nơi kết nối những tâm hồn võ
              đạo tạo thành một đại gia đình chung đam mê. Cùng nhau, chúng ta
              tiếp nối truyền thống, phát triển và tỏa sáng trên hành trình
              Karate.
            </p>
            <Button
              as={Link}
              to="/products"
              className="rounded-0 px-5 py-3 fw-bold text-dark text-uppercase border-0"
              style={{ backgroundColor: "#d4af37", letterSpacing: "2px" }}
            >
              Tham Gia Ngay
            </Button>
          </div>
        </div>
      </section>

      {/* 6. THE GRAIL VAULT (Best Sellers) - Museum Layout */}
      {products.length > 4 && (
        <section className="py-5 mb-5">
          <Container style={{ padding: 0 }}>
            <div className="text-center mb-5">
              <p
                className="text-warning text-uppercase mb-2"
                style={{ letterSpacing: "3px", fontSize: "0.85rem" }}
              >
                Most Wanted
              </p>
              <h2
                className="fw-bold text-white"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2.5rem",
                }}
              >
                The Grail Vault
              </h2>
            </div>
            <Row xs={1} md={2} lg={4} className="g-4">
              {products.slice(4, 8).map((product) => (
                <Col key={product.id}>
                  <div
                    className="p-3 h-100 position-relative"
                    style={{
                      backgroundColor: "#141414",
                      borderRadius: "8px",
                    }}
                  >
                    <ProductCard
                      product={product}
                      onQuickView={handleQuickView}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* ====================== BLOG SECTION ====================== */}
      <section className="py-5">
        <Container style={{ padding: 0 }}>
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <p
                className="text-warning text-uppercase mb-2"
                style={{ letterSpacing: "3px", fontSize: "0.85rem" }}
              >
                News
              </p>
              <h2
                className="fw-bold text-white m-0"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Blog & Các Hoạt Động Nổi Bật
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-white text-decoration-none fw-bold small text-uppercase pb-1 border-bottom border-warning"
            >
              Đọc tất cả →
            </Link>
          </div>

          <Row className="g-4">
            {blogs.map((blog) => (
              <Col md={4} key={blog._id}>
                <div
                  className="h-100 bg-transparent border-0 group cursor-pointer"
                  onClick={() => openBlogModal(blog)}
                >
                  {/* Phần card blog giữ nguyên như cũ... */}
                  <div
                    className="overflow-hidden rounded-0 mb-3"
                    style={{ height: "250px" }}
                  >
                    <img
                      src={
                        blog.imageUrl ||
                        "https://placehold.co/600x400?text=Blog+Post"
                      }
                      alt={blog.title}
                      className="w-100 h-100 object-fit-cover opacity-75 transition-all"
                      style={{
                        transition: "transform 0.6s ease, opacity 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.opacity = "0.75";
                      }}
                    />
                  </div>

                  <div
                    className="text-small mb-2 d-flex align-items-center gap-2 text-uppercase"
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "1px",
                      color: "#888",
                    }}
                  >
                    <FaClock size={12} style={{ color: "#d4af37" }} />{" "}
                    {blog.date}
                  </div>

                  <h5
                    className="fw-bold text-white mb-3"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      lineHeight: "1.4",
                    }}
                  >
                    {blog.title}
                  </h5>

                  <span
                    className="text-warning text-uppercase d-inline-flex align-items-center gap-1"
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "1px",
                      fontWeight: "bold",
                    }}
                  >
                    Đọc bài viết <span style={{ fontSize: "1rem" }}>→</span>
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </Container>

        {/* BLOG MODAL - ĐÃ TỐI ƯU HIỂN THỊ HÌNH ẢNH */}
        <Modal
          show={showBlogModal}
          onHide={closeBlogModal}
          centered
          size="xl" // Tăng kích thước modal để ảnh rộng hơn
          dialogClassName="blog-modal"
        >
          <Modal.Header className="border-0 bg-dark text-light">
            <Modal.Title className="fw-bold">{selectedBlog?.title}</Modal.Title>
            <button
              className="btn-close btn-close-white"
              onClick={closeBlogModal}
            ></button>
          </Modal.Header>

          <Modal.Body className="bg-dark text-light p-0">
            {/* === ẢNH BÌA CHÍNH - SHOW HẾT === */}
            {selectedBlog?.imageUrl && (
              <div className="position-relative">
                <img
                  src={selectedBlog.imageUrl}
                  alt={selectedBlog.title}
                  className="w-100"
                  style={{
                    maxHeight: "65vh",
                    objectFit: "contain", // ← Thay đổi quan trọng: show hết ảnh không bị crop
                    backgroundColor: "#1a1a1a",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                {/* Overlay gradient nhẹ ở dưới ảnh */}
                <div
                  className="position-absolute bottom-0 start-0 w-100"
                  style={{
                    height: "40%",
                    background:
                      "linear-gradient(transparent, rgba(10,10,10,0.85))",
                  }}
                />
              </div>
            )}

            <div className="p-4 p-md-5">
              {/* Ngày đăng */}
              <div className="d-flex align-items-center gap-3 mb-4 text-muted">
                <FaCalendarAlt />
                <span>{selectedBlog?.date}</span>
              </div>

              {/* Nội dung bài viết */}
              <div
                className="blog-content"
                style={{
                  lineHeight: "1.85",
                  fontSize: "1.08rem",
                  color: "#e0e0e0",
                  whiteSpace: "pre-line",
                }}
              >
                {selectedBlog?.content ||
                  selectedBlog?.excerpt ||
                  "Đang cập nhật nội dung..."}
              </div>

              {/* === ẢNH GIỮA BÀI VIẾT === */}
              {selectedBlog?.midImage && (
                <div className="my-5 text-center">
                  <img
                    src={selectedBlog.midImage}
                    alt="Hình ảnh minh họa"
                    className="img-fluid rounded shadow"
                    style={{
                      maxHeight: "520px",
                      width: "auto",
                      maxWidth: "100%",
                      objectFit: "contain", // Show hết ảnh không crop
                    }}
                  />
                </div>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer className="bg-dark border-0">
            <Button variant="light" onClick={closeBlogModal} className="px-4">
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </section>

      {/* QUICK VIEW MODAL (Giữ nguyên) */}
      <QuickViewModal
        show={showQuickView}
        handleClose={() => setShowQuickView(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default HomePage;
