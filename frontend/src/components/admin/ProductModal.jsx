import React, { useState, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Nav,
  Tab,
} from "react-bootstrap";
import {
  FaSave,
  FaTimes,
  FaDollarSign,
  FaBoxOpen,
  FaImage,
  FaCloudUploadAlt,
  FaTag,
  FaBarcode,
  FaWeightHanging,
  FaTrash,
} from "react-icons/fa";

const DEFAULT_VALUES = {
  name: "",
  category: "",
  brand: "",
  price_cents: "",
  stock: "",
  sku: "",
  variantName: "",
  description: "",
  images: [], // Mảng các hình ảnh: [{ url: '', preview: '' }]
};

const ProductModal = ({
  show,
  handleClose,
  product,
  onSave,
  categories = [],
  availableBrands = [],
}) => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("url"); // 'url' hoặc 'file'
  const [brandMode, setBrandMode] = useState(
    product && product.brand ? "select" : "select",
  );
  const [tempUrl, setTempUrl] = useState(""); // Temporary state cho URL input

  const getCategoryId = (prod) => {
    if (!prod || !prod.categoryId) return "";
    return typeof prod.categoryId === "object"
      ? prod.categoryId._id
      : prod.categoryId;
  };

  // Init State
  const [formData, setFormData] = useState(() => {
    if (product) {
      const existingImages =
        product.images?.map((img) => ({
          url: img.imageUrl,
          preview: img.imageUrl || "https://placehold.co/300x300?text=No+Image",
        })) || [];
      const firstVariant = product.variants?.[0] || {};
      const isExistingBrand = availableBrands.includes(product.brand);
      if (product.brand && !isExistingBrand) {
        // Side effect trong init state: Có thể setBrandMode ở đây hoặc dùng useEffect
        // Tuy nhiên để đơn giản ta cứ init giá trị cho form data
      }
      return {
        id: product._id || product.id,
        name: product.name,
        category: getCategoryId(product),
        brand: product.brand || "",
        price_cents: product.price_cents,
        stock: product.variants?.[0]?.stock || product.stock || 0,
        sku: firstVariant.sku || product.sku || "",
        variantName: firstVariant.name || "",
        description: product.description || "",
        images: existingImages.slice(0, 3), // Giới hạn tối đa 3 hình
      };
    }
    return DEFAULT_VALUES;
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Thêm hình từ URL
  const handleAddUrl = () => {
    if (tempUrl && formData.images.length < 3) {
      const newImage = {
        url: tempUrl,
        preview: tempUrl || "https://placehold.co/300x300?text=No+Image",
      };
      setFormData({
        ...formData,
        images: [...formData.images, newImage],
      });
      setTempUrl(""); // Reset input
    }
  };

  // Xử lý chọn nhiều File (Convert to Base64)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    files.forEach((file) => {
      if (formData.images.length + newImages.length < 3) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            url: reader.result,
            preview: reader.result,
          });
          if (newImages.length === files.length) {
            setFormData({
              ...formData,
              images: [...formData.images, ...newImages],
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Xóa hình
  const handleRemoveImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.price_cents ||
      !formData.category ||
      !formData.brand
    ) {
      alert("Vui lòng điền tên, danh mục và giá!");
      return;
    }

    const payload = {
      name: formData.name,
      categoryId: formData.category,
      brand: formData.brand,
      price_cents: Number(formData.price_cents),
      description: formData.description,
      images: formData.images.map((img) => ({ imageUrl: img.url })),
      variants: [
        {
          name: formData.variantName || "Default",
          sku: formData.sku,
          price_cents: Number(formData.price_cents),
          stock: Number(formData.stock) || 0,
        },
      ],
    };

    if (formData.id) payload.id = formData.id;
    onSave(payload);
    // handleClose(); // Đóng modal ngay (trải nghiệm người dùng tốt hơn)
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      className="eco-modal"
      scrollable
      backdrop="static"
    >
      <Modal.Header className="border-0 bg-light">
        <Modal.Title className="fw-bold text-success fs-5">
          {product ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        </Modal.Title>
        <button className="icon-btn border-0 ms-auto" onClick={handleClose}>
          <FaTimes />
        </button>
      </Modal.Header>

      <Modal.Body className="p-4 custom-scrollbar">
        <Row>
          {/* CỘT TRÁI: ẢNH */}
          <Col xs={12} md={4} className="mb-4 mb-md-0">
            <div className="d-flex flex-wrap justify-content-center mb-3">
              {formData.images.map((img, index) => (
                <div
                  key={index}
                  className="position-relative m-2"
                  style={{ width: "100px", height: "100px" }}
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-100 h-100 object-fit-cover rounded"
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/300x300?text=No+Image")
                    }
                  />
                  <button
                    className="position-absolute top-0 end-0 bg-danger text-white border-0 rounded-circle"
                    style={{
                      width: "20px",
                      height: "20px",
                      lineHeight: "20px",
                      fontSize: "12px",
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="text-muted">Chưa có hình ảnh</div>
              )}
            </div>
            <div className="text-center small text-muted mb-3">
              {formData.images.length}/3 hình ảnh
            </div>
            <Tab.Container
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav
                variant="pills"
                className="justify-content-center mb-3 text-small"
              >
                <Nav.Item>
                  <Nav.Link
                    eventKey="url"
                    className="py-1 px-3"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Link URL
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="file"
                    className="py-1 px-3"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Tải ảnh lên
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="url">
                  <InputGroup size="sm">
                    <InputGroup.Text>
                      <FaImage />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Dán link ảnh..."
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                    />
                  </InputGroup>
                  <Button
                    variant="success"
                    size="sm"
                    className="w-100 mt-2"
                    onClick={handleAddUrl}
                    disabled={formData.images.length >= 3 || !tempUrl}
                  >
                    Thêm URL
                  </Button>
                  <Form.Text className="text-muted small d-block mt-1">
                    Dùng link ảnh có sẵn trên mạng.
                  </Form.Text>
                </Tab.Pane>

                <Tab.Pane eventKey="file">
                  <div
                    className="border border-dashed rounded p-3 text-center cursor-pointer hover-bg-light"
                    onClick={() => fileInputRef.current.click()}
                    style={{ cursor: "pointer" }}
                  >
                    <FaCloudUploadAlt size={24} className="text-success mb-2" />
                    <div className="small fw-bold">
                      Chọn ảnh từ máy (có thể chọn nhiều)
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      accept="image/*"
                      multiple // Cho phép chọn nhiều file
                      onChange={handleFileChange}
                    />
                  </div>
                  <Form.Text className="text-muted small d-block mt-1 text-center">
                    Ảnh sẽ được nén vào database. Tối đa 3 hình.
                  </Form.Text>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
          {/* CỘT PHẢI: FORM */}
          <Col xs={12} md={8}>
            <Form>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="admin-label">
                      Tên sản phẩm <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="Nhập tên sản phẩm..."
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="admin-label">
                      Danh mục <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="admin-input"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Group>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="admin-label m-0">
                        Thương hiệu <span className="text-danger">*</span>
                      </Form.Label>
                      {/* Nút chuyển đổi chế độ nhập */}
                      <Button
                        variant="link"
                        size="sm"
                        className="text-decoration-none p-0"
                        onClick={() => {
                          setBrandMode((prev) =>
                            prev === "select" ? "new" : "select",
                          );
                          setFormData({ ...formData, brand: "" }); // Reset brand khi đổi chế độ
                        }}
                      >
                        {brandMode === "select" ? "+ Thêm mới" : "Chọn có sẵn"}
                      </Button>
                    </div>
                    {brandMode === "select" ? (
                      <Form.Select
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="admin-input"
                      >
                        <option value="">-- Chọn thương hiệu --</option>
                        {availableBrands.map((b, idx) => (
                          <option key={idx} value={b}>
                            {b}
                          </option>
                        ))}
                        <option value="Khác">Khác</option>
                      </Form.Select>
                    ) : (
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0">
                          <FaTag className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          className="admin-input border-start-0 ps-0"
                          placeholder="Nhập tên thương hiệu mới..."
                        />
                      </InputGroup>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="admin-label">
                      Mã SKU (Biến thể)
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <FaBarcode className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="admin-input border-start-0 ps-0"
                        placeholder="VD: SP-001-30G"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="admin-label">
                      Phân loại / Khối lượng
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <FaWeightHanging className="text-muted" />
                      </InputGroup.Text>
                      {/* INPUT CHO VARIANT NAME */}
                      <Form.Control
                        type="text"
                        name="variantName"
                        value={formData.variantName}
                        onChange={handleChange}
                        className="admin-input border-start-0 ps-0"
                        placeholder="VD: 30g, Hộp lớn..."
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="admin-label">Tồn kho</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <FaBoxOpen className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="admin-input border-start-0 ps-0"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="admin-label">
                      Giá bán (VNĐ) <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <FaDollarSign className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="price_cents"
                        value={formData.price_cents}
                        onChange={handleChange}
                        className="admin-input border-start-0 ps-0"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="admin-label">Mô tả ngắn</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="Mô tả sản phẩm..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 pe-4 pb-4">
        <Button
          variant="light"
          onClick={handleClose}
          className="rounded-pill px-4"
        >
          Hủy bỏ
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          className="rounded-pill px-4 fw-bold shadow-sm"
        >
          <FaSave className="me-2" /> Lưu Sản Phẩm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
