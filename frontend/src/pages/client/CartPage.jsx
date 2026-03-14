import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ProgressBar,
  InputGroup,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowRight,
  FaCheckCircle,
  FaSignInAlt,
  FaShoppingCart,
  FaTicketAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import "../../assets/styles/cart-checkout.css";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");

  // --- SAFE GUARD: Lọc sạch item lỗi (GIỮ NGUYÊN) ---
  const validCartItems = useMemo(() => {
    return Array.isArray(cartItems)
      ? cartItems.filter((item) => item && item.productId && item.productId._id)
      : [];
  }, [cartItems]);

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = validCartItems.map((item) => item.productId._id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleRemoveSelected = () => {
    if (
      window.confirm(`Bạn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)
    ) {
      selectedItems.forEach((id) => removeFromCart(id));
      setSelectedItems([]);
    }
  };

  // --- TÍNH TOÁN TIỀN (GIỮ NGUYÊN) ---
  const subtotal = useMemo(() => {
    return validCartItems.reduce((acc, item) => {
      const price = item.productId.price_cents || 0;
      if (selectedItems.includes(item.productId._id)) {
        return acc + price * item.quantity;
      }
      return acc;
    }, 0);
  }, [validCartItems, selectedItems]);

  const FREESHIP_THRESHOLD = 300000;
  const SHIPPING_FEE = 30000;
  const isFreeShip = subtotal >= FREESHIP_THRESHOLD;
  const currentShippingFee = subtotal > 0 && !isFreeShip ? SHIPPING_FEE : 0;
  const finalTotal = subtotal + currentShippingFee;
  const progress = Math.min((subtotal / FREESHIP_THRESHOLD) * 100, 100);
  const isAllSelected =
    validCartItems.length > 0 && selectedItems.length === validCartItems.length;

  // --- CSS CUSTOM NỘI BỘ CHO LUXURY UI ---
  const customStyles = `
    .bg-dark-premium { background-color: #0a0a0a; }
    .card-dark { background: #141414; border: 1px solid #2a2a2a; border-radius: 16px; }
    .text-gold { color: #d4af37 !important; }
    .border-gold { border-color: #d4af37 !important; }
    .btn-gold { background: linear-gradient(135deg, #d4af37, #f9e297); color: #000; border: none; font-weight: 700; }
    .btn-gold:hover { background: linear-gradient(135deg, #f9e297, #d4af37); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }
    .btn-gold:disabled { background: #333; color: #666; transform: none; box-shadow: none; }
    .luxury-checkbox input[type="checkbox"] { accent-color: #d4af37; width: 20px; height: 20px; cursor: pointer; }
    .cart-item-row { transition: all 0.3s ease; }
    .cart-item-row:hover { background: #1a1a1a; transform: translateX(5px); border-left: 3px solid #d4af37; }
    .qty-btn { background: #222; color: #fff; border: 1px solid #333; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: 0.2s; }
    .qty-btn:hover:not(:disabled) { background: #d4af37; color: #000; }
    .qty-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .qty-input { background: transparent; border: none; color: #fff; width: 40px; text-align: center; font-weight: bold; }
    .qty-input:focus { outline: none; }
    .custom-progress .progress-bar { background: linear-gradient(90deg, #b8860b, #ffd700); }
    .step-wizard-premium { display: flex; justify-content: space-between; align-items: center; position: relative; max-width: 600px; margin: 0 auto 3rem auto; }
    .step-wizard-premium::before { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: #333; z-index: 1; transform: translateY(-50%); }
    .step-item-premium { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .step-circle { width: 40px; height: 40px; border-radius: 50%; background: #141414; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #666; transition: 0.3s; }
    .step-item-premium.active .step-circle { border-color: #d4af37; background: #d4af37; color: #000; box-shadow: 0 0 15px rgba(212,175,55,0.4); }
    .step-text { color: #666; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .step-item-premium.active .step-text { color: #d4af37; }
  `;

  // --- RENDER ---
  if (!user) {
    return (
      <div className="bg-dark-premium min-vh-100 d-flex align-items-center">
        <style>{customStyles}</style>
        <Container className="text-center">
          <div
            className="mb-4 d-inline-block p-4 rounded-circle"
            style={{ background: "rgba(212,175,55,0.1)" }}
          >
            <FaSignInAlt size={60} className="text-gold" />
          </div>
          <h2 className="fw-bold mb-3 text-white luxury-serif">
            Xác thực tài khoản
          </h2>
          <p className="text-secondary mb-4">
            Vui lòng đăng nhập để xem tủ đồ cá nhân của bạn.
          </p>
          <Button
            as={Link}
            to="/login"
            className="btn-gold rounded-pill px-5 py-3 shadow-lg"
          >
            Đăng nhập ngay
          </Button>
        </Container>
      </div>
    );
  }

  if (validCartItems.length === 0) {
    return (
      <div className="bg-dark-premium min-vh-100 d-flex align-items-center">
        <style>{customStyles}</style>
        <Container className="text-center">
          <div
            className="mb-4 d-inline-block p-4 rounded-circle"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <FaShoppingCart size={60} className="text-secondary" />
          </div>
          <h2 className="fw-bold mb-3 text-white luxury-serif">
            Giỏ hàng trống
          </h2>
          <p className="text-secondary mb-4">
            Chưa có vật phẩm nào được thêm vào bộ sưu tập của bạn.
          </p>
          <Button
            as={Link}
            to="/products"
            className="btn-gold rounded-pill px-5 py-3 shadow-lg"
          >
            Khám phá ngay
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-dark-premium min-vh-100 pb-5 pt-4 text-white">
      <style>{customStyles}</style>
      <Container>
        {/* Step Wizard Nâng cấp */}
        <div className="step-wizard-premium">
          <div className="step-item-premium active">
            <div className="step-circle">1</div>
            <span className="step-text">Giỏ hàng</span>
          </div>
          <div className="step-item-premium">
            <div className="step-circle">2</div>
            <span className="step-text">Thanh toán</span>
          </div>
          <div className="step-item-premium">
            <div className="step-circle">3</div>
            <span className="step-text">Hoàn tất</span>
          </div>
        </div>

        <Row className="gy-4">
          {/* LEFT: CART ITEMS */}
          <Col lg={8}>
            <div className="card-dark p-3 mb-4 d-flex justify-content-between align-items-center">
              <Form.Check
                type="checkbox"
                id="selectAll"
                label={
                  <span className="ms-2 text-white fw-bold">
                    Chọn tất cả vật phẩm ({validCartItems.length})
                  </span>
                }
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="luxury-checkbox mb-0 d-flex align-items-center"
              />
              {selectedItems.length > 0 && (
                <Button
                  variant="link"
                  className="text-danger p-0 text-decoration-none small fw-bold d-flex align-items-center gap-1"
                  onClick={handleRemoveSelected}
                >
                  <FaTrash /> Xóa đã chọn ({selectedItems.length})
                </Button>
              )}
            </div>

            <div className="card-dark overflow-hidden">
              {validCartItems.map((item, index) => {
                const product = item.productId;
                const price = product.price_cents || 0;
                const isSelected = selectedItems.includes(product._id);
                const isLast = index === validCartItems.length - 1;

                return (
                  <div
                    key={product._id}
                    className={`p-4 cart-item-row ${!isLast ? "border-bottom border-secondary" : ""} ${isSelected ? "bg-black bg-opacity-25" : ""}`}
                  >
                    <Row className="align-items-center">
                      <Col xs={1} className="d-flex justify-content-center">
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(product._id)}
                          className="luxury-checkbox"
                        />
                      </Col>

                      <Col xs={3} md={2}>
                        <Link
                          to={`/product/${product.slug}`}
                          className="d-block ratio ratio-1x1 bg-white rounded-3 overflow-hidden p-1"
                        >
                          <img
                            src={
                              product.images?.[0]?.imageUrl ||
                              "https://placehold.co/100"
                            }
                            alt={product.name}
                            className="img-fluid object-fit-contain w-100 h-100"
                          />
                        </Link>
                      </Col>

                      <Col
                        xs={8}
                        md={9}
                        className="d-flex flex-column justify-content-between h-100"
                      >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold mb-1">
                              <Link
                                to={`/product/${product.slug}`}
                                className="text-white text-decoration-none hover-gold"
                              >
                                {product.name}
                              </Link>
                            </h5>
                            <span className="text-gold fw-bold fs-6">
                              {price.toLocaleString()} đ
                            </span>
                          </div>
                          <button
                            className="btn btn-link text-secondary p-0 hover-danger"
                            onClick={() => removeFromCart(product._id)}
                            title="Xóa"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>

                        <div className="d-flex justify-content-between align-items-end">
                          <div
                            className="d-flex align-items-center gap-2 p-1 rounded-3"
                            style={{
                              background: "#0a0a0a",
                              border: "1px solid #333",
                            }}
                          >
                            <button
                              className="qty-btn"
                              onClick={() =>
                                updateQuantity(product._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus size={12} />
                            </button>
                            <input
                              type="text"
                              className="qty-input"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              className="qty-btn"
                              onClick={() =>
                                updateQuantity(product._id, item.quantity + 1)
                              }
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          <div className="text-end">
                            <div className="small text-secondary mb-1">
                              Thành tiền
                            </div>
                            <div className="fw-bold fs-5 text-gold">
                              {(price * item.quantity).toLocaleString()} đ
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <Link
                to="/products"
                className="text-decoration-none text-secondary d-inline-flex align-items-center gap-2 hover-gold transition-all"
              >
                <FaArrowLeft /> Tiếp tục khám phá
              </Link>
            </div>
          </Col>

          {/* RIGHT: SUMMARY */}
          <Col lg={4}>
            <div className="card-dark sticky-top" style={{ top: "100px" }}>
              <div className="p-4 border-bottom border-secondary">
                <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                  <FaShieldAlt className="text-gold" /> Tổng kết giao dịch
                </h5>
              </div>

              <div className="p-4">
                {/* Freeship Progress */}
                <div className="mb-4 p-3 rounded-3 bg-black">
                  {subtotal > 0 ? (
                    <>
                      {subtotal < FREESHIP_THRESHOLD ? (
                        <p className="mb-2 small text-secondary">
                          Chỉ cần{" "}
                          <span className="text-gold fw-bold">
                            {(FREESHIP_THRESHOLD - subtotal).toLocaleString()} đ
                          </span>{" "}
                          nữa để nhận Freeship
                        </p>
                      ) : (
                        <p className="mb-2 small text-gold fw-bold">
                          <FaCheckCircle className="me-1" /> Đủ điều kiện
                          Freeship
                        </p>
                      )}
                      <ProgressBar
                        now={progress}
                        className="custom-progress rounded-pill bg-dark"
                        style={{ height: "8px" }}
                      />
                    </>
                  ) : (
                    <p className="mb-0 small text-secondary">
                      Chọn sản phẩm để xem ưu đãi vận chuyển.
                    </p>
                  )}
                </div>

                {/* Voucher Input */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary">
                    MÃ ĐẶC QUYỀN / VOUCHER
                  </label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark border-secondary text-gold border-end-0">
                      <FaTicketAlt />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Nhập mã của bạn"
                      className="bg-dark text-white border-secondary border-start-0 border-end-0 shadow-none"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button
                      variant="outline-warning"
                      className="border-secondary text-gold"
                      onClick={() =>
                        alert("Tính năng Voucher đang phát triển!")
                      }
                    >
                      Áp dụng
                    </Button>
                  </InputGroup>
                </div>

                {/* Bill Details */}
                <div className="d-flex justify-content-between mb-3 text-secondary">
                  <span>Tạm tính</span>
                  <span className="text-white">
                    {subtotal.toLocaleString()} đ
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-3 text-secondary">
                  <span>Phí vận chuyển</span>
                  {subtotal === 0 ? (
                    <span className="text-white">0 đ</span>
                  ) : isFreeShip ? (
                    <span className="text-gold fw-bold">Miễn phí</span>
                  ) : (
                    <span className="text-white">
                      {currentShippingFee.toLocaleString()} đ
                    </span>
                  )}
                </div>

                <div className="d-flex justify-content-between mb-4 pb-4 border-bottom border-secondary">
                  <span className="text-secondary">Chiết khấu</span>
                  <span className="text-gold">- 0 đ</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold fs-5 text-white">Tổng cộng</span>
                  <span
                    className="fw-bold fs-3 text-gold"
                    style={{ textShadow: "0 0 10px rgba(212,175,55,0.3)" }}
                  >
                    {finalTotal.toLocaleString()} đ
                  </span>
                </div>

                <Button
                  className="btn-gold w-100 py-3 rounded-3 d-flex justify-content-center align-items-center gap-2 fs-5 transition-all"
                  onClick={() => navigate("/checkout")}
                  disabled={selectedItems.length === 0}
                >
                  Tiến hành thanh toán <FaArrowRight />
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CartPage;
