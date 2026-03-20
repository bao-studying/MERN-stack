import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FaUsers,
  FaUserPlus,
  FaUserTie,
  FaHistory,
  FaTimes,
  FaSignInAlt,
  FaSignOutAlt,
  FaBoxOpen,
  FaTrashAlt,
  FaCog,
  FaFileExport,
  FaShieldAlt,
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .cm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.32); z-index: 1040;
    opacity: 0; animation: cmFadeIn .2s ease forwards;
  }
  @keyframes cmFadeIn { to { opacity: 1; } }

  .cm-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 400px; max-width: 95vw;
    background: #fff; z-index: 1041;
    display: flex; flex-direction: column;
    box-shadow: -8px 0 32px rgba(0,0,0,.14);
    transform: translateX(100%);
    animation: cmSlideIn .28s cubic-bezier(.4,0,.2,1) forwards;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes cmSlideIn { to { transform: translateX(0); } }

  .cm-drawer-hd {
    padding: 16px 20px; border-bottom: 0.5px solid #e2ded6;
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0; background: #fff;
  }
  .cm-drawer-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    object-fit: cover; border: 2px solid #e2ded6; flex-shrink: 0;
  }
  .cm-drawer-name { font-size: 14px; font-weight: 600; color: #1c1917; margin: 0 0 1px; letter-spacing: -.2px; }
  .cm-drawer-sub  { font-size: 11px; color: #78716c; margin: 0; }
  .cm-drawer-close {
    margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
    border: 0.5px solid #e2ded6; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: #78716c; transition: background .12s, color .12s;
  }
  .cm-drawer-close:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

  .cm-stats {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 8px; padding: 14px 20px;
    border-bottom: 0.5px solid #e2ded6;
    flex-shrink: 0; background: #f5f3ef;
  }
  .cm-stat {
    background: #fff; border: 0.5px solid #e2ded6;
    border-radius: 10px; padding: 10px 12px;
  }
  .cm-stat-lbl { font-size: 10px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; color: #a8a29e; margin: 0 0 4px; }
  .cm-stat-val { font-size: 20px; font-weight: 600; font-family: 'DM Mono',monospace; color: #1c1917; margin: 0; }
  .cm-stat-val.green { color: #15803d; }
  .cm-stat-val.red   { color: #dc2626; }

  .cm-filter-bar {
    padding: 10px 20px; border-bottom: 0.5px solid #e2ded6;
    display: flex; gap: 6px; flex-shrink: 0;
    background: #fff; flex-wrap: wrap;
  }
  .cm-filter-chip {
    padding: 4px 12px; border-radius: 20px;
    border: 0.5px solid #e2ded6; background: transparent;
    font-size: 11px; font-weight: 500;
    font-family: 'DM Sans',sans-serif; color: #78716c;
    cursor: pointer; transition: .12s;
  }
  .cm-filter-chip:hover { background: #f5f3ef; }
  .cm-filter-chip.on       { background: #1c1917; color: #fff; border-color: #1c1917; }
  .cm-filter-chip.on-green { background: #15803d; color: #fff; border-color: #15803d; }
  .cm-filter-chip.on-red   { background: #dc2626; color: #fff; border-color: #dc2626; }

  .cm-tl-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
  .cm-tl-body::-webkit-scrollbar { width: 4px; }
  .cm-tl-body::-webkit-scrollbar-thumb { background: #e2ded6; border-radius: 2px; }

  .cm-date-group { margin-bottom: 20px; }
  .cm-date-lbl {
    font-size: 10px; font-weight: 700; letter-spacing: .6px;
    text-transform: uppercase; color: #a8a29e;
    margin: 0 0 10px; padding-bottom: 6px;
    border-bottom: 0.5px solid #e2ded6;
  }

  .cm-tl-item {
    display: flex; gap: 12px; margin-bottom: 12px;
    animation: cmItemIn .2s ease both;
  }
  @keyframes cmItemIn {
    from { opacity:0; transform:translateX(8px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .cm-tl-item:nth-child(1){animation-delay:.03s}
  .cm-tl-item:nth-child(2){animation-delay:.06s}
  .cm-tl-item:nth-child(3){animation-delay:.09s}
  .cm-tl-item:nth-child(4){animation-delay:.12s}
  .cm-tl-item:nth-child(5){animation-delay:.15s}

  .cm-tl-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .cm-tl-icon {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; flex-shrink: 0;
  }
  .cm-tl-icon.success { background: #dcfce7; color: #15803d; }
  .cm-tl-icon.failed  { background: #fee2e2; color: #dc2626; }
  .cm-tl-icon.info    { background: #dbeafe; color: #1d4ed8; }
  .cm-tl-icon.warn    { background: #fef9c3; color: #a16207; }
  .cm-tl-line { flex:1; width:1.5px; background:#e2ded6; margin:4px 0 0; min-height:12px; }

  .cm-tl-content { flex:1; min-width:0; }
  .cm-tl-action  { font-size:13px; font-weight:500; color:#1c1917; margin:0 0 2px; }
  .cm-tl-detail  { font-size:11.5px; color:#78716c; margin:0 0 4px; line-height:1.5; }
  .cm-tl-meta    { display:flex; align-items:center; gap:8px; }
  .cm-tl-time    { font-size:10px; font-family:'DM Mono',monospace; color:#a8a29e; }
  .cm-tl-ip      { font-size:10px; font-family:'DM Mono',monospace; color:#a8a29e; }
  .cm-tl-badge   { font-size:9px; padding:1px 7px; border-radius:20px; font-weight:600; }
  .cm-tl-badge.success { background:#dcfce7; color:#15803d; }
  .cm-tl-badge.failed  { background:#fee2e2; color:#dc2626; }

  .cm-log-empty {
    padding: 40px 20px; text-align: center; color: #a8a29e;
    font-size: 13px; display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .cm-log-empty-icon {
    width:44px; height:44px; border-radius:12px; background:#f5f3ef;
    display:flex; align-items:center; justify-content:center;
    font-size:18px; opacity:.5;
  }

  .cm-log-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 7px;
    border: 0.5px solid #e2ded6; background: transparent;
    font-size: 11px; font-weight: 500;
    font-family: 'DM Sans',sans-serif; color: #78716c; cursor: pointer;
    transition: .12s;
  }
  .cm-log-btn:hover { background:#dbeafe; color:#1d4ed8; border-color:#93c5fd; }
`;

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA — giống SystemLogPage, seed theo userId
───────────────────────────────────────────────────────────────── */
const ACTION_DEFS = [
  { key: "Login", label: "Đăng nhập", icon: <FaSignInAlt />, type: "info" },
  { key: "Logout", label: "Đăng xuất", icon: <FaSignOutAlt />, type: "info" },
  {
    key: "Create Product",
    label: "Thêm sản phẩm",
    icon: <FaBoxOpen />,
    type: "success",
  },
  {
    key: "Delete Order",
    label: "Xóa đơn hàng",
    icon: <FaTrashAlt />,
    type: "failed",
  },
  {
    key: "Update Settings",
    label: "Cập nhật cài đặt",
    icon: <FaCog />,
    type: "warn",
  },
  {
    key: "Export Data",
    label: "Xuất dữ liệu",
    icon: <FaFileExport />,
    type: "warn",
  },
  {
    key: "Lock User",
    label: "Khóa tài khoản",
    icon: <FaShieldAlt />,
    type: "failed",
  },
  {
    key: "View Dashboard",
    label: "Xem Dashboard",
    icon: <FaEye />,
    type: "success",
  },
];

const generateLogs = (user) => {
  if (!user) return [];
  const seed = user._id ? user._id.charCodeAt(user._id.length - 1) : 7;
  const now = new Date();
  return Array.from({ length: 20 }, (_, i) => {
    const def = ACTION_DEFS[(i + seed) % ACTION_DEFS.length];
    const daysAgo = Math.floor(i / 4);
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(10 + (i % 12), (i * 7) % 60, 0, 0);
    return {
      id: i + 1,
      key: def.key,
      label: def.label,
      icon: def.icon,
      type: def.type,
      detail: `Thực hiện thao tác ${def.label} trên hệ thống`,
      ip: `192.168.1.${(seed + i) % 255}`,
      time: d,
      status: i % 9 === 0 ? "Failed" : "Success",
    };
  }).sort((a, b) => b.time - a.time);
};

/* ─────────────────────────────────────────────────────────────────
   LOG DRAWER COMPONENT
───────────────────────────────────────────────────────────────── */
const LogDrawer = ({ user, onClose }) => {
  const [filterStatus, setFilterStatus] = useState("All");

  const allLogs = useMemo(() => generateLogs(user), [user]);
  const filtered = useMemo(
    () =>
      allLogs.filter(
        (l) => filterStatus === "All" || l.status === filterStatus,
      ),
    [allLogs, filterStatus],
  );

  const total = allLogs.length;
  const success = allLogs.filter((l) => l.status === "Success").length;
  const failed = allLogs.filter((l) => l.status === "Failed").length;

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((log) => {
      const key = log.time.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      if (!map[key]) map[key] = [];
      map[key].push(log);
    });
    return map;
  }, [filtered]);

  return (
    <>
      <div className="cm-overlay" onClick={onClose} />
      <div className="cm-drawer">
        {/* Header */}
        <div className="cm-drawer-hd">
          <img
            src={user?.avatarUrl || "https://via.placeholder.com/40"}
            alt={user?.name}
            className="cm-drawer-avatar"
          />
          <div>
            <p className="cm-drawer-name">{user?.name}</p>
            <p className="cm-drawer-sub">
              {user?.email} · {user?.role?.name || "staff"}
            </p>
          </div>
          <button className="cm-drawer-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Stats */}
        <div className="cm-stats">
          <div className="cm-stat">
            <p className="cm-stat-lbl">Tổng hành động</p>
            <p className="cm-stat-val">{total}</p>
          </div>
          <div className="cm-stat">
            <p className="cm-stat-lbl">Thành công</p>
            <p className="cm-stat-val green">{success}</p>
          </div>
          <div className="cm-stat">
            <p className="cm-stat-lbl">Thất bại</p>
            <p className="cm-stat-val red">{failed}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="cm-filter-bar">
          {[
            { val: "All", label: "Tất cả", cls: "on" },
            { val: "Success", label: "✓ Thành công", cls: "on-green" },
            { val: "Failed", label: "✕ Thất bại", cls: "on-red" },
          ].map((f) => (
            <button
              key={f.val}
              className={`cm-filter-chip${filterStatus === f.val ? " " + f.cls : ""}`}
              onClick={() => setFilterStatus(f.val)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="cm-tl-body">
          {filtered.length === 0 ? (
            <div className="cm-log-empty">
              <div className="cm-log-empty-icon">
                <FaHistory />
              </div>
              <span>Không có nhật ký phù hợp</span>
            </div>
          ) : (
            Object.entries(grouped).map(([dateKey, logs]) => (
              <div key={dateKey} className="cm-date-group">
                <p className="cm-date-lbl">{dateKey}</p>
                {logs.map((log, idx) => {
                  const isLast = idx === logs.length - 1;
                  const iconCls = log.status === "Failed" ? "failed" : log.type;
                  return (
                    <div key={log.id} className="cm-tl-item">
                      <div className="cm-tl-left">
                        <div className={`cm-tl-icon ${iconCls}`}>
                          {log.icon}
                        </div>
                        {!isLast && <div className="cm-tl-line" />}
                      </div>
                      <div className="cm-tl-content">
                        <p className="cm-tl-action">{log.label}</p>
                        <p className="cm-tl-detail">{log.detail}</p>
                        <div className="cm-tl-meta">
                          <span className="cm-tl-time">
                            {log.time.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="cm-tl-ip">{log.ip}</span>
                          <span
                            className={`cm-tl-badge ${log.status === "Failed" ? "failed" : "success"}`}
                          >
                            {log.status === "Failed"
                              ? "Thất bại"
                              : "Thành công"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT — 100% logic gốc giữ nguyên
───────────────────────────────────────────────────────────────── */
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

  // ── DRAWER STATE ──────────────────────────────────────────────
  const [drawerUser, setDrawerUser] = useState(null);
  // ─────────────────────────────────────────────────────────────

  const searchTerm = searchParams.get("search") || "";
  const filterStatus = searchParams.get("status") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const accountType = searchParams.get("type") || "customer";
  const isStaffView = accountType === "staff";
  const pageTitle = isStaffView ? "Quản Lý Đội Ngũ" : "Quản Lý Khách Hàng";

  const STAFF_ROLES = ["admin", "manager", "staff"];
  const CUSTOMER_ROLES = ["customer"];

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get("/auth/me");
        if (res.success) setCurrentUser(res.data);
      } catch (e) {
        console.error("Lỗi lấy thông tin cá nhân:", e);
      }
    })();
  }, []);

  const handleAddUserChange = (e) =>
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/users", {
        params: {
          page: currentPage,
          limit: 5,
          search: searchTerm,
          status: filterStatus,
          roles: isStaffView ? STAFF_ROLES.join(",") : CUSTOMER_ROLES.join(","),
        },
      });
      setUsers(res.users);
      setTotalPages(res.totalPages);
      setTotalUsers(res.totalUsers);
    } catch (e) {
      console.error("Lỗi tải danh sách user:", e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, accountType]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handlePageChange = (page) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", page);
    setSearchParams(p);
  };
  const handleSearchChange = (e) => {
    const p = new URLSearchParams(searchParams);
    p.set("search", e.target.value);
    p.set("page", 1);
    setSearchParams(p);
  };
  const handleFilterChange = (e) => {
    const p = new URLSearchParams(searchParams);
    p.set("status", e.target.value);
    p.set("page", 1);
    setSearchParams(p);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 1 ? "KHÓA" : "MỞ KHÓA";
    const next = currentStatus === 1 ? 0 : 1;
    if (!window.confirm(`Xác nhận ${action} tài khoản này?`)) return;
    try {
      const res = await axiosClient.put(`/users/${id}/status`);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, status: next } : u)),
        );
        if (selectedUser?._id === id)
          setSelectedUser((prev) => ({ ...prev, status: next }));
        alert("Thành công!");
      }
    } catch (error) {
      if (error.response?.status === 403)
        alert("BẠN KHÔNG CÓ QUYỀN THỰC HIỆN THAO TÁC NÀY (Chỉ Admin).");
      else alert("Lỗi cập nhật trạng thái. Vui lòng thử lại sau.");
    }
  };

  const canAddUser =
    currentUser?.role?.name === "admin" ||
    currentUser?.role?.name === "manager";

  return (
    <div className="animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
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
        <div className="d-flex gap-2" />
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
                    <div className="d-flex justify-content-end align-items-center gap-2">
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-pill border shadow-sm text-primary hover-scale"
                        onClick={() => handleViewUser(user)}
                      >
                        <FaEye className="me-1" /> Xem
                      </Button>

                      {/* ── NÚT LOG — chỉ hiện khi xem staff view ── */}
                      {isStaffView && (
                        <button
                          className="cm-log-btn"
                          onClick={() => setDrawerUser(user)}
                          title="Xem nhật ký"
                        >
                          <FaHistory style={{ fontSize: 10 }} /> Log
                        </button>
                      )}

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
                    </div>
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

      {/* ── LOG DRAWER ── */}
      {drawerUser && (
        <LogDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />
      )}
    </div>
  );
};

export default CustomerManager;
