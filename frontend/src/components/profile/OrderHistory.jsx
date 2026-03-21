import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Modal, Spinner } from "react-bootstrap";
import { FaEye, FaBoxOpen } from "react-icons/fa";
import orderApi from "../../services/order.service"; // Import service

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Gọi API lấy đơn hàng của tôi
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await orderApi.getMyOrders();
        if (res.success) {
          setOrders(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử đơn hàng:", error);
        // toast.error("Không thể tải lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return <Badge bg="success">Giao thành công</Badge>;
      case "shipping":
      case "confirmed":
        return <Badge bg="primary">Đang vận chuyển</Badge>;
      case "pending":
        return (
          <Badge bg="warning" text="dark">
            Chờ xử lý
          </Badge>
        );
      case "cancelled":
        return <Badge bg="secondary">Đã hủy</Badge>;
      default:
        return (
          <Badge bg="light" text="dark">
            {status}
          </Badge>
        );
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <div className="  animate-fade-in">
      <h4 className="fw-bold mb-4 pb-3 border-bottom text-primary">
        <FaBoxOpen className="me-2" />
        Lịch sử đơn hàng
      </h4>

      {orders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaBoxOpen size={40} className="mb-3 opacity-50" />
          <p>Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <Table responsive hover className="align-middle">
          <thead className="bg-light text-secondary">
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="fw-bold text-success">{order.orderNumber}</td>
                <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="fw-bold">
                  {order.totalAmount_cents?.toLocaleString()} đ
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td className="text-end">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => handleShowDetails(order)}
                  >
                    <FaEye className="me-1" /> Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Chi Tiết Đơn Hàng */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-success fw-bold">
            Chi tiết đơn hàng {selectedOrder?.orderNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <div>
              <p className="mb-1">
                <strong>Ngày đặt:</strong>{" "}
                {new Date(selectedOrder?.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <p className="mb-1">
                <strong>Trạng thái:</strong>{" "}
                {getStatusBadge(selectedOrder?.status)}
              </p>
              <p className="mb-1">
                <strong>Thanh toán:</strong>{" "}
                {selectedOrder?.paymentMethod === "cod"
                  ? "Tiền mặt (COD)"
                  : selectedOrder?.paymentMethod}
              </p>
            </div>
            <div className="text-end">
              <p className="mb-1">
                <strong>Người nhận:</strong>{" "}
                {selectedOrder?.userId?.name || "Khách"}
              </p>
              <p className="mb-1">
                <strong>SĐT:</strong> {selectedOrder?.phoneNumber}
              </p>
              <p
                className="mb-1 small text-muted"
                style={{ maxWidth: "250px" }}
              >
                {selectedOrder?.shippingAddress}
              </p>
            </div>
          </div>
          <hr />
          <h6 className="fw-bold text-muted mb-3">Sản phẩm:</h6>
          <div
            className="table-responsive"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            <Table size="sm" borderless>
              <tbody>
                {selectedOrder?.items?.map((item, idx) => (
                  <tr key={idx} className="border-bottom">
                    <td style={{ width: "60px" }}>
                      <img
                        src={item.image || "https://placehold.co/50"}
                        alt=""
                        width="50"
                        height="50"
                        className="rounded object-fit-cover border"
                      />
                    </td>
                    <td>
                      <div className="fw-medium">{item.name}</div>
                      <small className="text-muted">
                        {item.price_cents?.toLocaleString()} đ
                      </small>
                    </td>
                    <td className="text-center">x{item.quantity}</td>
                    <td className="text-end fw-bold">
                      {(item.price_cents * item.quantity).toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {selectedOrder?.note && (
            <div className="mt-3 p-2 bg-light rounded border border-warning border-opacity-25">
              <small className="text-muted fw-bold">Ghi chú:</small>{" "}
              <span className="small">{selectedOrder.note}</span>
            </div>
          )}

          <h5 className="text-end text-success mt-3 pt-2 border-top">
            Tổng tiền: {selectedOrder?.totalAmount_cents?.toLocaleString()} đ
          </h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderHistory;
