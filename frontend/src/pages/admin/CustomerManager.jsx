import React, { useState, useEffect, useCallback } from "react";

import { useSearchParams } from "react-router-dom";
import CustomerDetailModal from "../../components/admin/CustomerDetailModal";
import axiosClient from "../../services/axiosClient";
import "../../assets/styles/admin.css";
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
  Modal,
} from "react-bootstrap";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaUnlock,
  FaLock,
  FaDownload,
  FaUsers,
  FaUserPlus,
  FaUserTie,
} from "react-icons/fa";

const CustomerManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });

  // --- LẤY GIÁ TRỊ TỪ URL ---
  const searchTerm = searchParams.get("search") || "";
  const filterStatus = searchParams.get("status") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1");

  // ── NEW: đọc type từ URL để biết đang xem "customer" hay "staff" ──
  const accountType = searchParams.get("type") || "customer"; // "customer" | "staff"
  const isStaffView = accountType === "staff";
  const pageTitle = isStaffView ? "Quản Lý Đội Ngũ" : "Quản Lý Khách Hàng";

  // Roles tương ứng với từng view
  const STAFF_ROLES = ["admin", "manager", "staff"];
  const CUSTOMER_ROLES = ["customer"];

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axiosClient.get("/auth/me");
        if (res.success) setCurrentUser(res.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin cá nhân:", error);
      }
    };
    fetchMe();
  }, []);

  const handleAddUserChange = (e) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await axiosClient.post("/users", newUserData);
      if (res.success) {
        alert("Thêm người dùng mới thành công!");
        setShowAddModal(false);
        setNewUserData({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "staff",
        });
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi thêm user");
    } finally {
      setAddLoading(false);
    }
  };

  // --- FETCH DATA — truyền roles tương ứng với từng view lên API ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/users", {
        params: {
          page: currentPage,
          limit: 5,
          search: searchTerm,
          status: filterStatus,
          // Gửi roles phù hợp để backend lọc đúng nhóm
          roles: isStaffView
            ? STAFF_ROLES.join(",") // "admin,manager,staff"
            : CUSTOMER_ROLES.join(","), // "customer"
        },
      });

      setUsers(res.users);
      setTotalPages(res.totalPages);
      setTotalUsers(res.totalUsers);
    } catch (error) {
      console.error("Lỗi tải danh sách user:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, accountType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  // --- CÁC HÀM UPDATE URL ---
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("search", e.target.value);
    newParams.set("page", 1);
    setSearchParams(newParams);
  };

  const handleFilterChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("status", e.target.value);
    newParams.set("page", 1);
    setSearchParams(newParams);
  };

  // --- ACTIONS ---
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 1 ? "KHÓA" : "MỞ KHÓA";
    const nextStatus = currentStatus === 1 ? 0 : 1;

    if (window.confirm(`Xác nhận ${action} tài khoản này?`)) {
      try {
        const res = await axiosClient.put(`/users/${id}/status`);
        if (res.success) {
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u._id === id ? { ...u, status: nextStatus } : u,
            ),
          );
          if (selectedUser && selectedUser._id === id) {
            setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
          }
          alert("Thành công!");
        }
      } catch (error) {
        console.error("Lỗi toggle status:", error);
        if (error.response && error.response.status === 403) {
          alert("BẠN KHÔNG CÓ QUYỀN THỰC HIỆN THAO TÁC NÀY (Chỉ Admin).");
        } else {
          alert("Lỗi cập nhật trạng thái. Vui lòng thử lại sau.");
        }
      }
    }
  };

  const canAddUser =
    currentUser?.role?.name === "admin" ||
    currentUser?.role?.name === "manager";

  return (
    <div className="animate-fade-in">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          {/* ── Title thay đổi theo type ── */}
          <h2 className="fw-bold m-0" style={{ color: "var(--admin-text)" }}>
            {isStaffView ? (
              <FaUserTie className="me-2" />
            ) : (
              <FaUsers className="me-2" />
            )}
            {pageTitle}
          </h2>
          <p className="text-muted small m-0">
            Tổng số: {totalUsers} tài khoản
          </p>
        </div>
        <div className="d-flex gap-2"></div>
        {canAddUser && (
          <Button
            variant="success"
            className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <FaUserPlus /> Thêm {isStaffView ? "Nhân viên" : "Khách hàng"}
          </Button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="table-card p-3 mb-4">
        <Row className="g-3">
          <Col md={5}>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên, email, sđt..."
                className="border-start-0 shadow-none"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              className="shadow-none"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Locked">Bị khóa</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button
              variant="outline-secondary"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <FaFilter /> Lọc nhóm
            </Button>
          </Col>
        </Row>
      </div>

      {/* TABLE */}
      <div className="table-card overflow-hidden">
        <Table hover responsive className="custom-table align-middle mb-0">
          <thead>
            <tr>
              <th className="ps-4">Người Dùng</th>
              <th>Liên Hệ</th>
              <th>Vai Trò</th>
              <th className="text-center">Ngày Tham Gia</th>
              <th>Trạng Thái</th>
              <th className="text-end pe-4">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={
                          user.avatarUrl || "https://via.placeholder.com/150"
                        }
                        alt={user.name}
                        className="rounded-circle border object-fit-cover"
                        style={{ width: 45, height: 45 }}
                      />
                      <div>
                        <div
                          className="fw-bold"
                          style={{ color: "var(--admin-text)" }}
                        >
                          {user.name}
                        </div>
                        <small
                          className="text-muted text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          ID: {user._id.slice(-6)}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{user.email}</div>
                    <small className="text-muted">{user.phone || "N/A"}</small>
                  </td>
                  <td>
                    <Badge
                      bg={
                        user.role?.name === "admin"
                          ? "dark"
                          : user.role?.name === "manager"
                            ? "primary"
                            : "info"
                      }
                      className="text-uppercase"
                    >
                      {user.role?.name || "Customer"}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    {user.status === 1 ? (
                      <Badge
                        bg="success"
                        className="rounded-pill px-3 bg-opacity-75"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        bg="danger"
                        className="rounded-pill px-3 bg-opacity-75"
                      >
                        Locked
                      </Badge>
                    )}
                  </td>
                  <td className="text-end pe-4">
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-pill border shadow-sm text-primary hover-scale me-2"
                      onClick={() => handleViewUser(user)}
                    >
                      <FaEye className="me-1" /> Xem
                    </Button>
                    {user.role?.name !== "admin" &&
                      (user.status === 1 ? (
                        <Button
                          variant="light"
                          size="sm"
                          className="rounded-pill border shadow-sm text-danger hover-scale"
                          onClick={() => handleToggleStatus(user._id, 1)}
                          title="Khóa"
                        >
                          <FaLock />
                        </Button>
                      ) : (
                        <Button
                          variant="light"
                          size="sm"
                          className="rounded-pill border shadow-sm text-success hover-scale"
                          onClick={() => handleToggleStatus(user._id, 0)}
                          title="Mở khóa"
                        >
                          <FaUnlock />
                        </Button>
                      ))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  Không tìm thấy {isStaffView ? "nhân viên" : "khách hàng"} nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-center align-items-center flex-column">
            <Pagination className="eco-pagination mb-2">
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
            <small className="text-muted">
              Hiển thị trang {currentPage} trên tổng số {totalPages} trang
            </small>
          </div>
        )}
      </div>

      <div>
        {/* MODAL THÊM USER */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-success">
              {isStaffView ? "Thêm Nhân Viên Mới" : "Thêm Thành Viên Mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddUserSubmit}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Họ và tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      required
                      placeholder="Nhập tên nhân viên"
                      onChange={handleAddUserChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      required
                      placeholder="example@gmail.com"
                      onChange={handleAddUserChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Số điện thoại
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      required
                      placeholder="09xxx"
                      onChange={handleAddUserChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      required
                      placeholder="******"
                      onChange={handleAddUserChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Vai trò hệ thống
                    </Form.Label>
                    <Form.Select name="role" onChange={handleAddUserChange}>
                      <option value="staff">staff (Nhân viên)</option>
                      <option value="manager">Manager (Quản lý)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-4">
                <Button
                  variant="light"
                  className="w-100 fw-bold"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="success"
                  type="submit"
                  className="w-100 fw-bold"
                  disabled={addLoading}
                >
                  {addLoading ? <Spinner size="sm" /> : "Xác nhận thêm"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        <CustomerDetailModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          customer={selectedUser}
          handleToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
};

export default CustomerManager;
