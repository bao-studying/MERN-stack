import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  FloatingLabel,
  Badge,
} from "react-bootstrap";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaUniversity,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaPlusCircle,
  FaAddressBook,
  FaStickyNote,
  FaTicketAlt,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import orderApi from "../../services/order.service";
import userApi from "../../services/user.service";
import axiosClient from "../../services/axiosClient";
import toast from "react-hot-toast";
import "../../assets/styles/cart-checkout.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ← đọc state từ CartPage
  const { cartItems, clearCart } = useCart();
  const { user, login } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  // ── VOUCHER STATE ─────────────────────────────────────────────
  // Nếu CartPage đã áp voucher → nhận qua location.state
  const cartVoucher = location.state?.appliedVoucher || null;

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(cartVoucher); // pre-fill từ cart
  const [voucherError, setVoucherError] = useState("");
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchLatestAddresses = async () => {
      try {
        const res = await userApi.getProfile();
        if (res.success) login(res.data);
      } catch (error) {
        console.error("Lỗi cập nhật địa chỉ:", error);
      }
    };
    fetchLatestAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIC ĐỊA CHỈ (GIỮ NGUYÊN) ---
  const savedAddresses = useMemo(() => user?.addresses || [], [user]);
  const [useNewAddress, setUseNewAddress] = useState(
    savedAddresses.length === 0,
  );
  const defaultAddr = useMemo(
    () => savedAddresses.find((a) => a.isDefault) || savedAddresses[0],
    [savedAddresses],
  );
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddr ? defaultAddr._id : null,
  );
  const [newAddrData, setNewAddrData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    addressLine: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setUseNewAddress(true);
    } else if (!selectedAddressId) {
      const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (def) setSelectedAddressId(def._id);
      setUseNewAddress(false);
    }
  }, [savedAddresses, selectedAddressId]);

  // --- TÍNH TOÁN TIỀN (GIỮ NGUYÊN) ---
  const validCartItems = useMemo(
    () => cartItems.filter((item) => item.productId),
    [cartItems],
  );
  const subtotal = useMemo(() => {
    return validCartItems.reduce(
      (acc, item) => acc + item.productId.price_cents * item.quantity,
      0,
    );
  }, [validCartItems]);

  const FREESHIP_THRESHOLD = 300000;
  const SHIPPING_FEE = 30000;
  const isFreeShip = subtotal >= FREESHIP_THRESHOLD;
  const shippingFee = subtotal > 0 && !isFreeShip ? SHIPPING_FEE : 0;

  // ── TÍNH CÓ VOUCHER ──────────────────────────────────────────
  const discountAmount = appliedVoucher?.discount || 0;
  const effectiveShipping =
    appliedVoucher?.type === "freeship" ? 0 : shippingFee;
  const total = Math.max(0, subtotal + effectiveShipping - discountAmount);
  // ─────────────────────────────────────────────────────────────

  // ── ÁP VOUCHER TRONG CHECKOUT ────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError("");
    setVoucherLoading(true);
    try {
      const res = await axiosClient.post("/vouchers/validate", {
        code: voucherCode.trim(),
        orderAmount: subtotal,
      });
      if (res.success) {
        setAppliedVoucher({
          _id: res.voucher._id,
          code: res.voucher.code,
          description: res.voucher.description,
          type: res.voucher.type,
          discount: res.discount,
        });
        toast.success(`Áp dụng "${res.voucher.code}" thành công!`);
        setVoucherCode("");
      }
    } catch (err) {
      setVoucherError(err.response?.data?.message || "Mã voucher không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
    toast("Đã xóa voucher", { icon: "🗑️" });
  };
  // ─────────────────────────────────────────────────────────────

  // --- XỬ LÝ ĐẶT HÀNG (thêm voucherId vào payload) ---
  const handlePlaceOrder = async () => {
    if (validCartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    let finalShippingAddress = "";
    let finalPhone = "";

    setLoading(true);
    try {
      if (useNewAddress) {
        if (
          !newAddrData.fullName ||
          !newAddrData.phone ||
          !newAddrData.addressLine ||
          !newAddrData.city ||
          !newAddrData.province
        ) {
          toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
          setLoading(false);
          return;
        }
        const saveAddrRes = await userApi.addAddress({
          ...newAddrData,
          isDefault: savedAddresses.length === 0,
        });
        if (saveAddrRes.success) {
          const profileRes = await userApi.getProfile();
          if (profileRes.success) login(profileRes.data);
        }
        finalShippingAddress = `${newAddrData.addressLine}, ${newAddrData.city}, ${newAddrData.province}`;
        finalPhone = newAddrData.phone;
      } else {
        const selectedAddr = savedAddresses.find(
          (a) => a._id === selectedAddressId,
        );
        if (!selectedAddr) {
          toast.error("Vui lòng chọn địa chỉ giao hàng");
          setLoading(false);
          return;
        }
        finalShippingAddress = `${selectedAddr.addressLine}, ${selectedAddr.city}, ${selectedAddr.province}`;
        finalPhone = selectedAddr.phone;
      }

      // ── Payload thêm voucherId & discount ──────────────────
      const orderPayload = {
        shippingAddress: finalShippingAddress,
        phoneNumber: finalPhone,
        note: note,
        paymentMethod: paymentMethod,
        // Thêm mới: truyền voucher nếu có
        ...(appliedVoucher && {
          voucherId: appliedVoucher._id,
          voucherCode: appliedVoucher.code,
          discountAmount: discountAmount,
        }),
      };
      // ────────────────────────────────────────────────────────

      const res = await orderApi.createOrder(orderPayload);

      if (res.success) {
        toast.success("Đặt hàng thành công! Vui lòng kiểm tra email.");
        clearCart();
        navigate("/checkout/success", { state: { order: res.data } });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Container className="py-4">
        <div className="mb-4">
          <Link
            to="/cart"
            className="text-decoration-none text-muted hover-green fw-medium"
          >
            <FaArrowLeft className="me-2" /> Quay lại giỏ hàng
          </Link>
        </div>

        {/* STEP WIZARD (GIỮ NGUYÊN) */}
        <div className="step-wizard">
          <div className="step-item completed">
            <div className="step-count">1</div>
            <span className="step-text">Giỏ hàng</span>
          </div>
          <div className="step-line active"></div>
          <div className="step-item active">
            <div className="step-count">2</div>
            <span className="step-text">Thanh toán</span>
          </div>
          <div className="step-line"></div>
          <div className="step-item">
            <div className="step-count">3</div>
            <span className="step-text">Hoàn tất</span>
          </div>
        </div>

        <Row>
          {/* LEFT: SHIPPING INFO & PAYMENT (GIỮ NGUYÊN HOÀN TOÀN) */}
          <Col lg={7}>
            {/* 1. THÔNG TIN GIAO HÀNG */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                    <span
                      className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 30, height: 30, fontSize: "0.9rem" }}
                    >
                      1
                    </span>
                    Thông tin giao hàng
                  </h5>
                  {savedAddresses.length > 0 &&
                    (!useNewAddress ? (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => setUseNewAddress(true)}
                      >
                        <FaPlusCircle className="me-1" /> Nhập địa chỉ khác
                      </Button>
                    ) : (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setUseNewAddress(false)}
                      >
                        <FaAddressBook className="me-1" /> Chọn từ sổ địa chỉ
                      </Button>
                    ))}
                </div>

                <div className="bg-light p-3 rounded mb-3 border d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-3 text-muted small">
                    <span>
                      <FaUser className="me-1" /> {user?.name}
                    </span>
                    <span>
                      <FaEnvelope className="me-1" /> {user?.email}
                    </span>
                  </div>
                </div>

                {!useNewAddress && savedAddresses.length > 0 ? (
                  <div
                    className="d-flex flex-column gap-3 animate-fade-in custom-scrollbar"
                    style={{
                      maxHeight: "350px",
                      overflowY: "auto",
                      paddingRight: "5px",
                    }}
                  >
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`payment-card p-3 d-flex align-items-start gap-3 ${selectedAddressId === addr._id ? "selected" : ""}`}
                        onClick={() => setSelectedAddressId(addr._id)}
                      >
                        <div
                          className={`custom-radio mt-1 flex-shrink-0 ${selectedAddressId === addr._id ? "border-success" : ""}`}
                        >
                          {selectedAddressId === addr._id && (
                            <div className="dot"></div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-dark">
                              {addr.fullName}
                            </span>
                            <span className="text-muted small">
                              | {addr.phone}
                            </span>
                            {addr.isDefault && (
                              <Badge bg="success" className="ms-auto">
                                Mặc định
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted small mb-0">
                            {addr.addressLine}, {addr.city}, {addr.province}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-fade-in bg-white p-3 border rounded-3">
                    <h6 className="fw-bold mb-3 text-success">
                      Nhập thông tin nhận hàng mới:
                    </h6>
                    <Row>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="fullName"
                          label="Họ và tên người nhận"
                          className="mb-3"
                        >
                          <Form.Control
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={newAddrData.fullName}
                            onChange={(e) =>
                              setNewAddrData({
                                ...newAddrData,
                                fullName: e.target.value,
                              })
                            }
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="phone"
                          label="Số điện thoại"
                          className="mb-3"
                        >
                          <Form.Control
                            type="tel"
                            placeholder="09..."
                            value={newAddrData.phone}
                            onChange={(e) =>
                              setNewAddrData({
                                ...newAddrData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </FloatingLabel>
                      </Col>
                    </Row>
                    <FloatingLabel
                      controlId="addrLine"
                      label="Địa chỉ (Số nhà, đường...)"
                      className="mb-3"
                    >
                      <Form.Control
                        type="text"
                        placeholder="Số nhà, đường..."
                        value={newAddrData.addressLine}
                        onChange={(e) =>
                          setNewAddrData({
                            ...newAddrData,
                            addressLine: e.target.value,
                          })
                        }
                      />
                    </FloatingLabel>
                    <Row>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="city"
                          label="Quận / Huyện"
                          className="mb-3"
                        >
                          <Form.Control
                            type="text"
                            placeholder="Quận..."
                            value={newAddrData.city}
                            onChange={(e) =>
                              setNewAddrData({
                                ...newAddrData,
                                city: e.target.value,
                              })
                            }
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="province"
                          label="Tỉnh / Thành phố"
                          className="mb-3"
                        >
                          <Form.Control
                            type="text"
                            placeholder="Tỉnh..."
                            value={newAddrData.province}
                            onChange={(e) =>
                              setNewAddrData({
                                ...newAddrData,
                                province: e.target.value,
                              })
                            }
                          />
                        </FloatingLabel>
                      </Col>
                    </Row>
                    <Form.Text className="text-muted fst-italic">
                      * Địa chỉ này sẽ được tự động lưu vào sổ địa chỉ của bạn.
                    </Form.Text>
                  </div>
                )}

                <div className="mt-3">
                  <FloatingLabel
                    controlId="note"
                    label={
                      <>
                        <FaStickyNote className="me-2" />
                        Ghi chú đơn hàng (Tùy chọn)
                      </>
                    }
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Ghi chú"
                      style={{ height: "80px" }}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </FloatingLabel>
                </div>
              </Card.Body>
            </Card>

            {/* 2. PHƯƠNG THỨC THANH TOÁN (GIỮ NGUYÊN) */}
            <Card className="border-0 shadow-sm mb-4 mb-lg-0">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <span
                    className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 30, height: 30, fontSize: "0.9rem" }}
                  >
                    2
                  </span>
                  Phương thức thanh toán
                </h5>
                <div className="d-flex flex-column gap-3">
                  <div
                    className={`payment-card p-3 d-flex align-items-center justify-content-between ${paymentMethod === "cod" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light p-2 rounded text-success">
                        <FaMoneyBillWave size={24} />
                      </div>
                      <div>
                        <div className="fw-bold">
                          Thanh toán khi nhận hàng (COD)
                        </div>
                        <div className="small text-muted">
                          Thanh toán tiền mặt cho shipper
                        </div>
                      </div>
                    </div>
                    <div className="custom-radio">
                      {paymentMethod === "cod" && <div className="dot"></div>}
                    </div>
                  </div>
                  <div
                    className={`payment-card p-3 d-flex align-items-center justify-content-between ${paymentMethod === "banking" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("banking")}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light p-2 rounded text-primary">
                        <FaUniversity size={24} />
                      </div>
                      <div>
                        <div className="fw-bold">
                          Chuyển khoản ngân hàng (VietQR)
                        </div>
                        <div className="small text-muted">
                          Quét mã QR - Xác nhận tự động
                        </div>
                        <Badge bg="warning" text="dark" className="mt-1">
                          Sắp ra mắt
                        </Badge>
                      </div>
                    </div>
                    <div className="custom-radio disabled opacity-50"></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT: ORDER SUMMARY */}
          <Col lg={5}>
            <Card className="border-0 shadow-sm sticky-summary">
              <Card.Header className="bg-white py-3 border-bottom-0">
                <h5 className="mb-0 fw-bold">
                  Đơn hàng của bạn ({validCartItems.length})
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {/* Danh sách sản phẩm (GIỮ NGUYÊN) */}
                <div
                  className="px-4 py-2"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {validCartItems.map((item) => (
                    <div key={item.productId._id} className="d-flex gap-3 mb-3">
                      <div className="position-relative">
                        <img
                          src={
                            item.productId.images?.[0]?.imageUrl ||
                            "https://placehold.co/60"
                          }
                          alt={item.productId.name}
                          className="rounded border"
                          style={{ width: 60, height: 60, objectFit: "cover" }}
                        />
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary border border-light">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <div
                          className="text-truncate fw-medium"
                          style={{ maxWidth: "200px" }}
                        >
                          {item.productId.name}
                        </div>
                        <div className="small text-muted">
                          {item.productId.price_cents?.toLocaleString()} đ
                        </div>
                      </div>
                      <div className="fw-bold">
                        {(
                          item.productId.price_cents * item.quantity
                        ).toLocaleString()}{" "}
                        đ
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-light p-4 mt-2">
                  {/* ── VOUCHER INPUT (thêm mới) ── */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted mb-2 d-flex align-items-center gap-1">
                      <FaTicketAlt style={{ fontSize: 11 }} /> MÃ VOUCHER
                    </label>

                    {!appliedVoucher ? (
                      <>
                        <div className="input-group input-group-sm">
                          <Form.Control
                            placeholder="Nhập mã voucher..."
                            value={voucherCode}
                            onChange={(e) => {
                              setVoucherCode(e.target.value);
                              setVoucherError("");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleApplyVoucher()
                            }
                            disabled={voucherLoading}
                          />
                          <Button
                            variant="outline-success"
                            onClick={handleApplyVoucher}
                            disabled={voucherLoading || !voucherCode.trim()}
                          >
                            {voucherLoading ? "..." : "Áp dụng"}
                          </Button>
                        </div>
                        {voucherError && (
                          <div className="text-danger small mt-1">
                            {voucherError}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="d-flex align-items-center justify-content-between p-2 rounded border border-success bg-white">
                        <div className="d-flex align-items-center gap-2">
                          <FaCheckCircle
                            className="text-success"
                            style={{ fontSize: 13 }}
                          />
                          <div>
                            <div className="fw-bold small text-success">
                              {appliedVoucher.code}
                            </div>
                            <div style={{ fontSize: 11, color: "#78716c" }}>
                              {appliedVoucher.description}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {appliedVoucher.type !== "freeship" && (
                            <span className="fw-bold small text-success">
                              -{discountAmount.toLocaleString()}đ
                            </span>
                          )}
                          {appliedVoucher.type === "freeship" && (
                            <span className="fw-bold small text-success">
                              Freeship
                            </span>
                          )}
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: "#9ca3af",
                              display: "flex",
                              alignItems: "center",
                            }}
                            onClick={handleRemoveVoucher}
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* ── END VOUCHER ── */}

                  {/* Tính tiền */}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tạm tính</span>
                    <span className="fw-bold">
                      {subtotal.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Phí vận chuyển</span>
                    {effectiveShipping === 0 ? (
                      <span className="text-success fw-bold">
                        {appliedVoucher?.type === "freeship"
                          ? "Miễn phí (voucher)"
                          : "Miễn phí"}
                      </span>
                    ) : (
                      <span>{effectiveShipping.toLocaleString()} đ</span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Giảm giá voucher</span>
                      <span className="text-success fw-bold">
                        -{discountAmount.toLocaleString()} đ
                      </span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-1 mb-4">
                    <span className="fw-bold fs-5">Tổng cộng</span>
                    <div className="text-end">
                      <div className="fw-bold fs-4 text-success">
                        {total.toLocaleString()} đ
                      </div>
                      <small className="text-muted">(Đã bao gồm VAT)</small>
                    </div>
                  </div>

                  <Button
                    variant="success"
                    size="lg"
                    className="w-100 rounded-pill fw-bold shadow-sm py-3 text-uppercase"
                    onClick={handlePlaceOrder}
                    disabled={loading || validCartItems.length === 0}
                  >
                    {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CheckoutPage;
