import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import blogApi from "../../services/blog.service";
import "../../assets/styles/home.css";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const result = await blogApi.getAll({ limit: 12, sort: "-createdAt" });
      const list = Array.isArray(result?.blogs)
        ? result.blogs
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setBlogs(list);
    } catch (err) {
      console.error("Lỗi tải blog:", err);
      setError("Không tải được bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const openBlogModal = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBlog(null);
  };

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        color: "#f8f8f8",
        minHeight: "100vh",
      }}
    >
      {/* Hero Section */}
      <section
        className="py-5"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,10,0.95), rgba(10,10,10,0.95)), url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container>
          <div className="py-5 text-center">
            <h1 className="display-5 fw-bold">Tin Tức & Hướng Dẫn</h1>
            <p className="lead text-light opacity-75">
              Cập nhật tin tức sưu tầm, mẹo bảo quản và những câu chuyện đặc
              sắc.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" />
          </div>
        ) : error ? (
          <div className="text-center text-danger py-5">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Chưa có bài viết nào. Hãy quay lại sau nhé.
          </div>
        ) : (
          <Row className="g-4">
            {blogs.map((blog) => (
              <Col lg={4} md={6} key={blog._id}>
                <Card
                  className="border-0 shadow-sm h-100 overflow-hidden blog-card"
                  onClick={() => openBlogModal(blog)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="ratio ratio-16x9">
                    <img
                      src={
                        blog.imageUrl ||
                        "https://placehold.co/600x400?text=Blog+Post"
                      }
                      alt={blog.title}
                      className="object-fit-cover w-100 h-100"
                    />
                  </div>
                  <Card.Body className="bg-dark text-light d-flex flex-column">
                    <small className="text-warning text-uppercase mb-2 d-block">
                      <FaCalendarAlt className="me-1" />
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString("vi-VN")
                        : "Không rõ"}
                    </small>
                    <Card.Title className="fw-bold mb-3">
                      {blog.title}
                    </Card.Title>
                    <Card.Text className="text-muted flex-grow-1">
                      {blog.excerpt || blog.content?.slice(0, 120) + "..."}
                    </Card.Text>
                    <Button
                      variant="warning"
                      className="mt-auto rounded-0 fw-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        openBlogModal(blog);
                      }}
                    >
                      Đọc thêm
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* ====================== BLOG DETAIL MODAL ====================== */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        size="lg"
        className="blog-detail-modal"
      >
        <Modal.Header className="border-0 bg-dark text-light">
          <Modal.Title className="fw-bold">{selectedBlog?.title}</Modal.Title>
          <button
            className="btn-close btn-close-white"
            onClick={closeModal}
          ></button>
        </Modal.Header>

        <Modal.Body className="bg-dark text-light p-0">
          {/* Ảnh bìa lớn */}
          {selectedBlog?.imageUrl && (
            <div className="ratio ratio-21x9">
              <img
                src={selectedBlog.imageUrl}
                alt={selectedBlog.title}
                className="w-100 object-fit-cover"
              />
            </div>
          )}

          {/* Nội dung bài viết */}
          <div className="p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4 text-muted">
              <FaCalendarAlt />
              <span>
                {selectedBlog?.publishedAt
                  ? new Date(selectedBlog.publishedAt).toLocaleDateString(
                      "vi-VN",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : ""}
              </span>
            </div>

            {/* Nội dung chính */}
            <div
              className="blog-content"
              style={{
                lineHeight: "1.8",
                fontSize: "1.05rem",
                whiteSpace: "pre-line",
              }}
            >
              {selectedBlog?.content}
            </div>

            {/* Ảnh giữa bài nếu có */}
            {selectedBlog?.midImage && (
              <div className="my-5 text-center">
                <img
                  src={selectedBlog.midImage}
                  alt="Hình ảnh minh họa"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "500px" }}
                />
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-dark border-0">
          <Button variant="light" onClick={closeModal}>
            <FaTimes className="me-2" /> Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BlogPage;
