import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
  Tab,
  Nav,
} from "react-bootstrap";
import {
  FaRegNewspaper,
  FaEdit,
  FaPlus,
  FaSave,
  FaTimes,
  FaCamera,
  FaLink,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import blogApi from "../../services/blog.service";
import "../../assets/styles/admin.css";

const STYLES = `
  .bm-root {
    min-height: 100%;
    color: #1c1917;
    font-family: 'DM Sans', sans-serif;
  }
  .bm-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }
  .bm-header-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
  }
  .bm-header-subtitle {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 13px;
  }
  .bm-panel {
    background: #ffffff;
    border: 1px solid #e2ded6;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
    margin-bottom: 18px;
  }
  .bm-panel h5 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  .bm-list-item {
    border-bottom: 1px solid #e5e7eb;
    padding: 14px 0;
  }
  .bm-list-item:last-child {
    border-bottom: none;
  }
  .bm-list-item-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .bm-list-item-meta {
    display: flex;
    gap: 12px;
    color: #6b7280;
    font-size: 12px;
  }
  .bm-empty {
    color: #6b7280;
    font-size: 14px;
    padding: 24px 0;
  }
`;

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [imageMode, setImageMode] = useState("link");

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    coverImage: "",
    midImage: "",
    status: "published",
  });

  // Filter state
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);

      // ✅ Load TẤT CẢ bài viết (cả published và draft)
      const result = await blogApi.getAll({
        limit: 50,
        sort: "-createdAt",
        // Không thêm status filter để hiển thị cả bài ẩn
      });

      const list = Array.isArray(result?.blogs)
        ? result.blogs
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setBlogs(list);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      coverImage: "",
      midImage: "",
      status: "published",
    });
    setImageMode("link");
    setShowModal(true);
    setError(null);
    setMessage(null);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      imageUrl: blog.imageUrl || "",
      coverImage: blog.coverImage || "",
      midImage: blog.midImage || "",
      status: blog.status || "published",
    });
    setImageMode("link");
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlog(null);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("image", file);

      const res = await blogApi.uploadImage(formPayload);
      if (res?.imageUrl || res?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl || res.url }));
      }
    } catch (err) {
      setError("Upload ảnh thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError("Tiêu đề và nội dung không được để trống");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        imageUrl: formData.imageUrl,
        coverImage: formData.coverImage,
        midImage: formData.midImage,
        status: formData.status,
      };

      if (editingBlog) {
        // ===== UPDATE =====
        await blogApi.update(editingBlog._id, payload);
        setMessage("✅ Cập nhật bài viết thành công!");
      } else {
        // ===== CREATE =====
        await blogApi.create(payload);
        setMessage("✅ Thêm bài viết thành công!");
      }

      loadBlogs(); // Refresh danh sách
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra khi lưu bài viết",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (blog) => {
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      await blogApi.update(blog._id, { status: newStatus });
      setBlogs((prev) =>
        prev.map((b) => (b._id === blog._id ? { ...b, status: newStatus } : b)),
      );
    } catch (err) {
      alert("Không thể thay đổi trạng thái");
    }
  };

  return (
    <div className="bm-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="bm-header">
        <div>
          <h1 className="bm-header-title">Quản lý Blog</h1>
          <p className="bm-header-subtitle">Viết và quản lý bài viết</p>
        </div>
        <Button variant="warning" onClick={openCreateModal}>
          <FaPlus className="me-2" /> Viết bài mới
        </Button>
      </div>

      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={12}>
          <div className="bm-panel">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Bài viết gần đây</h5>

              <Form.Select
                style={{ width: "auto" }}
                onChange={(e) => setFilterStatus(e.target.value)}
                value={filterStatus}
              >
                <option value="all">Tất cả bài viết</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp / Ẩn</option>
              </Form.Select>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="bm-empty">Chưa có bài viết nào.</div>
            ) : (
              blogs
                .filter((blog) => filterStatus === "all" || blog.status === filterStatus)
                .map((blog) => (
                  <div
                    key={blog._id}
                    className="bm-list-item d-flex justify-content-between align-items-center"
                  >
                    <div className="flex-grow-1">
                      <div className="bm-list-item-title">{blog.title}</div>
                      <div className="bm-list-item-meta">
                        <span
                          style={{
                            color:
                              blog.status === "published" ? "#28a745" : "#ffc107",
                            fontWeight: "500",
                          }}
                        >
                          {blog.status === "published"
                            ? "✅ Đã xuất bản"
                            : "⏳ Bản nháp"}
                        </span>
                        <span>
                          {new Date(
                            blog.publishedAt || blog.createdAt,
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(blog)}
                      >
                        <FaEdit /> Sửa
                      </Button>
                      <Button
                        variant={
                          blog.status === "published"
                            ? "outline-success"
                            : "outline-secondary"
                        }
                        size="sm"
                        onClick={() => toggleStatus(blog)}
                      >
                        {blog.status === "published" ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Col>
      </Row>

      <BlogModal
        show={showModal}
        handleClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        imageMode={imageMode}
        setImageMode={setImageMode}
        handleImageUpload={handleImageUpload}
        handleSubmit={handleSubmit}
        saving={saving}
        isEdit={!!editingBlog}
        fileInputRef={fileInputRef}
      />
    </div>
  );
};

/* ====================== MODAL ====================== */
const BlogModal = ({
  show,
  handleClose,
  formData,
  setFormData,
  imageMode,
  setImageMode,
  handleImageUpload,
  handleSubmit,
  saving,
  isEdit,
  fileInputRef,
}) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header className="border-0 bg-light">
        <Modal.Title className="fw-bold">
          {isEdit ? "Chỉnh sửa bài viết" : "Viết bài mới"}
        </Modal.Title>
        <button className="icon-btn border-0 ms-auto" onClick={handleClose}>
          <FaTimes />
        </button>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Tóm tắt</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.excerpt}
              onChange={(e) => handleChange("excerpt", e.target.value)}
            />
          </Form.Group>

          <h6 className="mt-4 mb-3 fw-bold">Hình ảnh</h6>

          <Tab.Container activeKey={imageMode} onSelect={setImageMode}>
            <Nav variant="pills" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="upload">
                  <FaCamera className="me-1" /> Upload
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="link">
                  <FaLink className="me-1" /> Link
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="upload">
                <Button
                  variant="outline-secondary"
                  onClick={() => fileInputRef.current.click()}
                >
                  Chọn ảnh đại diện
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="link">
                <Form.Control
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>

          <div className="mt-3">
            <Form.Label>Ảnh nền (Cover Image)</Form.Label>
            <Form.Control
              type="url"
              value={formData.coverImage}
              onChange={(e) => handleChange("coverImage", e.target.value)}
              placeholder="Link ảnh nền"
            />
          </div>

          <div className="mt-3">
            <Form.Label>Ảnh giữa bài viết</Form.Label>
            <Form.Control
              type="url"
              value={formData.midImage}
              onChange={(e) => handleChange("midImage", e.target.value)}
              placeholder="Link ảnh giữa nội dung"
            />
          </div>

          <Form.Group className="mb-3 mt-4">
            <Form.Label className="fw-bold">Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Trạng thái</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="light" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="warning" onClick={handleSubmit} disabled={saving}>
          {saving ? <Spinner size="sm" /> : <FaSave className="me-2" />}
          {isEdit ? "Cập nhật" : "Đăng bài"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BlogManager;
