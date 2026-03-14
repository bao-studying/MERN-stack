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
} from "react-bootstrap";
import {
  FaShippingFast,
  FaLeaf,
  FaMedal,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import QuickViewModal from "../../components/product/QuickViewModal";
import productApi from "../../services/product.service";
import categoryApi from "../../services/category.service";
import "../../assets/styles/home.css";

const HomePage = () => {
  // --- STATE DỮ LIỆU ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Quick View
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- FETCH DATA TỪ API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song API Product và Category
        const [prodRes, catRes] = await Promise.all([
          productApi.getAll({ limit: 12, sort: "-createdAt" }),
          categoryApi.getAll(),
        ]);

        // 1. Xử lý Sản phẩm
        // Backend trả về: { success: true, data: [...] }
        // Frontend cũ gọi nhầm là prodRes.products -> Sửa thành prodRes.data
        if (prodRes && prodRes.data) {
          const list = Array.isArray(prodRes.data)
            ? prodRes.data
            : prodRes.data.products || [];

          const mappedProducts = list.map((p) => ({
            ...p,
            id: p._id, // Map _id thành id cho ProductCard
            price: p.price_cents,
            salePrice:
              p.compareAtPriceCents && p.compareAtPriceCents > p.price_cents
                ? p.compareAtPriceCents
                : null,
            // Lấy ảnh đầu tiên, fallback nếu không có
            image:
              p.images?.[0]?.imageUrl ||
              "https://placehold.co/300x300?text=No+Image",
            category: p.categoryId?.name || "Sản phẩm",
          }));
          setProducts(mappedProducts);
        }

        // 2. Xử lý Danh mục
        // Backend trả về: { success: true, data: [...] } hoặc { categories: [...] } tùy service
        // Kiểm tra kỹ cấu trúc trả về
        if (catRes) {
          // Logic fallback để bắt đúng mảng danh mục dù cấu trúc là gì
          let catList = [];
          if (Array.isArray(catRes)) catList = catRes;
          else if (Array.isArray(catRes.data)) catList = catRes.data;
          else if (Array.isArray(catRes.categories))
            catList = catRes.categories;
          else if (catRes.data && Array.isArray(catRes.data.categories))
            catList = catRes.data.categories;

          setCategories(catList);
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

  // Hàm render ảnh danh mục (Fallback)
  const getCategoryImage = (cat, index) => {
    if (cat.image || cat.imageUrl) return cat.image || cat.imageUrl;
    const placeholders = [
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80",
    ];
    return placeholders[index % placeholders.length];
  };

  // Blog giả định
  const blogs = [
    {
      id: 1,
      title: "5 Cách sống xanh dễ dàng tại nhà",
      img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
      date: "20/01/2025",
    },
    {
      id: 2,
      title: "Lợi ích tuyệt vời của rau hữu cơ",
      img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000&auto=format&fit=crop",
      date: "18/01/2025",
    },
    {
      id: 3,
      title: "Tái chế rác thải nhựa đúng cách",
      img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
      date: "15/01/2025",
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="mb-5">
        <Carousel className="hero-section" interval={4000} fade>
          <Carousel.Item>
            <div
              className="hero-slide"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1500&q=80")',
              }}
            >
              <div className="hero-overlay">
                <div className="hero-content animate-slide-up">
                  <Badge
                    bg="warning"
                    text="dark"
                    className="mb-3 px-3 py-2 rounded-pill"
                  >
                    100% Organic
                  </Badge>
                  <h1 className="display-4 fw-bold mb-3">
                    Thực Phẩm Xanh <br /> Cho Cuộc Sống Lành
                  </h1>
                  <p className="lead mb-4 opacity-75">
                    Tươi ngon từ nông trại đến bàn ăn. Giảm thiểu rác thải.
                  </p>
                  <Button
                    as={Link}
                    to="/products"
                    variant="success"
                    size="lg"
                    className="rounded-pill px-5 shadow fw-bold border-0"
                  >
                    Mua Ngay <FaArrowRight className="ms-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div
              className="hero-slide"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1500&q=80")',
              }}
            >
              <div className="hero-overlay">
                <div className="hero-content">
                  <Badge bg="info" className="mb-3 px-3 py-2 rounded-pill">
                    Zero Waste
                  </Badge>
                  <h1 className="display-4 fw-bold mb-3">
                    Nói Không Với <br /> Rác Thải Nhựa
                  </h1>
                  <p className="lead mb-4 opacity-75">
                    Bộ sưu tập sản phẩm thân thiện với mẹ thiên nhiên.
                  </p>
                  <Button
                    as={Link}
                    to="/about"
                    variant="light"
                    size="lg"
                    className="rounded-pill px-5 shadow fw-bold text-success border-0"
                  >
                    Khám Phá <FaArrowRight className="ms-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </section>

      {/* 2. FEATURES */}
      <section className="mb-5">
        <Container>
          <Row className="g-4">
            {[
              {
                icon: <FaLeaf className="fs-1 text-success" />,
                title: "100% Tự Nhiên",
                desc: "Nguồn gốc hữu cơ minh bạch",
              },
              {
                icon: <FaShippingFast className="fs-1 text-primary" />,
                title: "Giao Hàng Nhanh",
                desc: "Miễn phí vận chuyển đơn từ 300k",
              },
              {
                icon: <FaMedal className="fs-1 text-warning" />,
                title: "Chất Lượng Cao",
                desc: "Được kiểm định nghiêm ngặt",
              },
            ].map((item, idx) => (
              <Col md={4} key={idx}>
                <div className="d-flex align-items-center bg-white p-4 rounded-4 shadow-sm h-100 border border-light hover-top transition-all">
                  <div className="me-3">{item.icon}</div>
                  <div>
                    <h5 className="fw-bold mb-1">{item.title}</h5>
                    <p className="text-muted small mb-0">{item.desc}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 3. CATEGORIES (ĐÃ SỬA LOGIC LẤY DATA) */}
      {categories.length > 0 && (
        <section className="mb-5 text-center">
          <Container>
            <h2 className="section-title">Danh Mục Nổi Bật</h2>
            <Row className="justify-content-center g-4">
              {categories.map((cat, idx) => (
                <Col xs={4} md={2} key={cat._id}>
                  <Link
                    to={`/products?category=${cat._id}`}
                    className="text-decoration-none"
                  >
                    <div className="category-card">
                      <div className="cat-img-wrapper">
                        <img
                          src={getCategoryImage(cat, idx)}
                          alt={cat.name}
                          onError={(e) => {
                            e.target.src = "https://placehold.co/150?text=Eco";
                          }}
                        />
                      </div>
                      <h6
                        className="fw-bold text-dark mt-3 text-truncate px-2"
                        title={cat.name}
                      >
                        {cat.name}
                      </h6>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* 4. SẢN PHẨM MỚI (ĐÃ SỬA LOGIC LẤY DATA) */}
      <section
        className="mb-5 py-5 bg-light rounded-4"
        style={{
          backgroundImage: "linear-gradient(to bottom, #f1f8e9, white)",
        }}
      >
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="fw-bold mb-0 text-success">Sản Phẩm Mới</h2>
                <Badge bg="danger" className="animate-pulse">
                  New
                </Badge>
              </div>
              <p className="text-muted mb-0">Những món hàng xanh vừa cập bến</p>
            </div>
            <Button
              as={Link}
              to="/products"
              variant="outline-success"
              className="rounded-pill fw-bold"
            >
              Xem tất cả
            </Button>
          </div>

          {products.length > 0 ? (
            <Row xs={1} md={2} lg={4} className="g-4">
              {products.slice(0, 4).map((product) => (
                <Col key={product.id}>
                  <ProductCard
                    product={product}
                    onQuickView={handleQuickView}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5 text-muted">
              <p>Chưa có sản phẩm nào.</p>
              {/* Hiển thị nút thêm SP nếu đang dev */}
              <small>
                Vui lòng vào Admin thêm sản phẩm hoặc kiểm tra kết nối DB.
              </small>
            </div>
          )}
        </Container>
      </section>

      {/* 5. BANNER TĨNH */}
      <section className="mb-5">
        <Container>
          <div
            className="static-banner rounded-4 overflow-hidden position-relative shadow-sm"
            style={{ height: "300px" }}
          >
            <img
              src="https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=1740&auto=format&fit=crop"
              alt="Banner Mùa Hè Xanh Mát"
              className="w-100 h-100 object-fit-cover"
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center text-center px-3">
              <div className="text-white" style={{ maxWidth: "700px" }}>
                <h2 className="fw-bold mb-3 display-5">Mùa Hè Xanh Mát</h2>
                <p className="fs-5 mb-4 opacity-90">
                  Khám phá bộ sưu tập nước ép trái cây và rau củ hữu cơ giải
                  nhiệt mùa hè.
                </p>
                <Button
                  as={Link}
                  to="/products"
                  variant="light"
                  size="lg"
                  className="rounded-pill px-5 fw-bold text-success"
                >
                  Mua Ngay
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. SỐNG XANH & BỀN VỮNG */}
      {products.length > 4 && (
        <section className="mb-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="section-title">Sống Xanh & Bền Vững</h2>
              <p className="text-muted w-75 mx-auto">
                Các sản phẩm được yêu thích nhất tại EcoStore
              </p>
            </div>
            <Row xs={1} md={2} lg={4} className="g-4">
              {/* Logic: Lấy 4 sản phẩm tiếp theo (hoặc random nếu bạn thích) */}
              {products.slice(4, 8).map((product) => (
                <Col key={product.id}>
                  <ProductCard
                    product={product}
                    onQuickView={handleQuickView}
                  />
                </Col>
              ))}
            </Row>
            <div className="text-center mt-5">
              <Button
                as={Link}
                to="/products"
                variant="outline-success"
                size="lg"
                className="rounded-pill px-5"
              >
                Xem thêm sản phẩm
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* 7. BLOG */}
      <section className="mb-5 pb-4">
        <Container>
          <h2 className="fw-bold mb-4">Góc Sống Xanh</h2>
          <Row className="g-4">
            {blogs.map((blog) => (
              <Col md={4} key={blog.id}>
                <Card className="blog-card h-100">
                  <Card.Img variant="top" src={blog.img} className="blog-img" />
                  <Card.Body>
                    <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                      <FaClock size={12} /> {blog.date}
                    </div>
                    <Card.Title
                      className="fw-bold mb-2 fs-5 hover-green"
                      style={{ cursor: "pointer" }}
                    >
                      {blog.title}
                    </Card.Title>
                    <Card.Text className="text-muted small">
                      Khám phá những mẹo nhỏ giúp bạn sống xanh hơn mỗi ngày mà
                      không tốn quá nhiều công sức...
                    </Card.Text>
                    <Button
                      variant="link"
                      className="p-0 text-success text-decoration-none fw-bold"
                    >
                      Đọc tiếp &rarr;
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        show={showQuickView}
        handleClose={() => setShowQuickView(false)}
        product={selectedProduct}
      />
    </>
  );
};

export default HomePage;
