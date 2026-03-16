import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Pagination,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaShoppingBag,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import OrderDetailModal from "../../components/admin/OrderDetailModal";
import orderApi from "../../services/order.service";
import toast from "react-hot-toast";
import "../../assets/styles/admin.css";
import { useSearchParams } from "react-router-dom";

const OrderManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy giá trị từ URL
  const filterStatus = searchParams.get("status") || "All";
  const searchTerm = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const itemsPerPage = 10; // tăng lên 10 để grid đẹp hơn

  // Fetch dữ liệu từ API (server-side filter + pagination)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus === "All" ? undefined : filterStatus,
        search: searchTerm || undefined,
      };

      const res = await orderApi.getAllOrders(params);

      // Giả sử backend trả về { orders: [...], total: number, page, pages, limit }
      const fetchedOrders = res.orders || res.data || [];
      const total = res.total || res.pagination?.total || fetchedOrders.length;

      setOrders(fetchedOrders);

      // Tính stats từ dữ liệu thật (nếu backend chưa gửi stats riêng)
      setStats({
        total,
        pending: fetchedOrders.filter((o) => o.status === "pending").length,
        shipping: fetchedOrders.filter(
          (o) => o.status === "shipping" || o.status === "confirmed",
        ).length,
        completed: fetchedOrders.filter(
          (o) => o.status === "delivered" || o.status === "completed",
        ).length,
        cancelled: fetchedOrders.filter((o) => o.status === "cancelled").length,
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Lỗi tải đơn hàng";
      setError(errMsg);
      toast.error(errMsg);
      console.error("Lỗi fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Xem chi tiết đơn
  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Cập nhật trạng thái từ modal
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công!");

      // Cập nhật local state ngay lập tức
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );

      // Refresh stats & list (tùy chọn)
      fetchOrders();
    } catch (err) {
      toast.error("Cập nhật thất bại: " + (err.message || "Lỗi server"));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "delivered":
        return (
          <Badge bg="success" className="rounded-pill px-3 py-2">
            Hoàn thành
          </Badge>
        );
      case "shipping":
      case "confirmed":
        return (
          <Badge bg="primary" className="rounded-pill px-3 py-2">
            Đang giao
          </Badge>
        );
      case "pending":
        return (
          <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">
            Chờ xử lý
          </Badge>
        );
      case "cancelled":
        return (
          <Badge bg="danger" className="rounded-pill px-3 py-2">
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="rounded-pill px-3 py-2">
            Không xác định
          </Badge>
        );
    }
  };

  // Pagination handler (đồng bộ URL)
  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(stats.total / itemsPerPage)) return;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", page);
      return params;
    });
  };

  // Filter & search handler (reset page về 1)
  const handleFilterChange = (e) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("status", e.target.value);
      params.set("page", "1");
      return params;
    });
  };

  const handleSearchChange = (e) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("search", e.target.value);
      params.set("page", "1");
      return params;
    });
  };

  const totalPages = Math.ceil(stats.total / itemsPerPage);

  return (
    <div className="animate-fade-in">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
        <div>
          <h2 className="fw-bold mb-1 text-gold">Quản Lý Đơn Hàng</h2>
          <p className="text-gold-light small mb-0">
            Theo dõi và xử lý đơn hàng TCG Pokémon
          </p>
        </div>
        <Button
          variant="gold"
          className="rounded-pill px-4 fw-bold shadow-gold d-flex align-items-center gap-2"
          onClick={fetchOrders}
        >
          <FaDownload /> Làm mới dữ liệu
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* MINI STATS */}
      <Row className="g-3 mb-5">
        <Col xs={6} md={3} lg={3}>
          <div className="stat-card p-4 rounded-4 border border-gold border-opacity-30 bg-dark-light">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-gold bg-opacity-25 p-3 text-gold">
                <FaShoppingBag size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">{stats.total}</h4>
                <small className="text-gold-light">Tổng đơn</small>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3} lg={3}>
          <div className="stat-card p-4 rounded-4 border border-warning border-opacity-30 bg-dark-light">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-warning bg-opacity-25 p-3 text-warning">
                <FaClock size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">{stats.pending}</h4>
                <small className="text-warning">Chờ xử lý</small>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3} lg={3}>
          <div className="stat-card p-4 rounded-4 border border-primary border-opacity-30 bg-dark-light">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary bg-opacity-25 p-3 text-primary">
                <FaTruck size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">{stats.shipping}</h4>
                <small className="text-primary">Đang giao</small>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3} lg={3}>
          <div className="stat-card p-4 rounded-4 border border-success border-opacity-30 bg-dark-light">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-success bg-opacity-25 p-3 text-success">
                <FaCheckCircle size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">{stats.completed}</h4>
                <small className="text-success">Hoàn thành</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* FILTERS */}
      <div className="table-card p-4 mb-5 rounded-4 border border-gold border-opacity-30 bg-dark-light">
        <Row className="g-3 align-items-center">
          <Col md={5}>
            <InputGroup className="rounded-pill overflow-hidden border border-gold">
              <InputGroup.Text className="bg-transparent border-0 text-gold">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm mã đơn, tên khách, SĐT..."
                className="bg-transparent text-white border-0 shadow-none"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select
              className="rounded-pill bg-transparent text-white border-gold shadow-none"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="shipping">Đang vận chuyển</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button
              variant="outline-gold"
              className="w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={fetchOrders}
            >
              <FaFilter /> Lọc & Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* TABLE / GRID ORDERS */}
      <div className="table-card rounded-4 overflow-hidden shadow-gold-glow border border-gold border-opacity-20 bg-dark">
        {loading ? (
          <div className="text-center py-5">
            <Spinner
              animation="border"
              variant="gold"
              style={{ width: "3rem", height: "3rem" }}
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 text-gold-light">
            <FaShoppingBag size={60} className="mb-4 opacity-50" />
            <h5>Chưa có đơn hàng nào</h5>
            <p className="small">Khi có đơn mới, sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <>
            <Table hover responsive className="mb-0 custom-table text-white">
              <thead className="bg-gold-opacity">
                <tr>
                  <th className="ps-4 py-3">Mã Đơn</th>
                  <th className="py-3">Khách Hàng</th>
                  <th className="py-3">Ngày Đặt</th>
                  <th className="py-3">Tổng Tiền</th>
                  <th className="py-3">Thanh Toán</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="text-end pe-4 py-3">Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover-gold-row">
                    <td className="ps-4 fw-bold text-gold">
                      {order.orderNumber}
                    </td>
                    <td>
                      <div className="fw-bold">
                        {order.userId?.name || "Khách vãng lai"}
                      </div>
                      <small className="text-gold-light">
                        {order.phoneNumber}
                      </small>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="fw-bold text-success">
                      {(order.totalAmount_cents / 1000).toLocaleString()} đ
                    </td>
                    <td>
                      <Badge bg="outline-gold" className="px-3 py-2">
                        {order.paymentMethod?.toUpperCase() || "N/A"}
                      </Badge>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-end pe-4">
                      <Button
                        variant="outline-gold"
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => handleView(order)}
                      >
                        <FaEye className="me-1" /> Xem
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-top border-gold border-opacity-20 d-flex justify-content-center">
                <Pagination className="gold-pagination">
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx + 1}
                      active={idx + 1 === currentPage}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      <OrderDetailModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default OrderManager;
