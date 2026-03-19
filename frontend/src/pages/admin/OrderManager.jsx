import React, { useState, useEffect, useCallback } from "react";
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

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .om-root {
    --bg:     #f4f2ee;
    --surf:   #ffffff;
    --border: #e2ded6;
    --text:   #1c1917;
    --muted:  #78716c;
    --subtle: #a8a29e;
    --font:   'DM Sans', sans-serif;
    --mono:   'DM Mono', monospace;
    --col-pending-dot:  #ca8a04;
    --col-shipping-dot: #1d4ed8;
    --col-done-dot:     #16a34a;
    --col-cancel-dot:   #dc2626;
    font-family: var(--font);
    color: var(--text);
  }

  .om-page-header {
    display: flex; align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px; gap: 12px;
  }
  .om-page-title { font-size: 20px; font-weight: 600; letter-spacing: -.4px; margin: 0 0 2px; }
  .om-page-sub   { font-size: 13px; color: var(--muted); margin: 0; }

  .om-refresh-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; background: var(--text); color: #fff;
    border: none; border-radius: 8px; font-size: 13px; font-weight: 500;
    font-family: var(--font); cursor: pointer; white-space: nowrap;
    transition: background .15s, transform .1s; flex-shrink: 0;
  }
  .om-refresh-btn:hover  { background: #3c3c3c; transform: translateY(-1px); }
  .om-refresh-btn:active { transform: translateY(0); }

  .om-error {
    background: #fef2f2; border: 0.5px solid #fecaca;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: #dc2626; margin-bottom: 16px;
  }

  .om-toolbar {
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 12px; padding: 12px 16px;
    display: flex; gap: 10px; align-items: center;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .om-search-active .om-toolbar { border-color: var(--text); }

  .om-search-wrap { position: relative; flex: 1; min-width: 180px; }
  .om-search-wrap svg {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: var(--subtle); font-size: 12px; pointer-events: none;
  }
  .om-search-inp {
    width: 100%; padding: 8px 12px 8px 30px;
    border: 0.5px solid var(--border); border-radius: 8px;
    font-size: 13px; font-family: var(--font);
    color: var(--text); background: var(--bg);
    outline: none; transition: border-color .15s;
  }
  .om-search-inp:focus { border-color: var(--text); }

  .om-filter-select {
    padding: 8px 28px 8px 11px; border: 0.5px solid var(--border);
    border-radius: 8px; font-size: 13px; font-family: var(--font);
    color: var(--text); background: var(--bg);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='6'%3E%3Cpath d='M0 0l4.5 6L9 0z' fill='%2378716c'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 9px center;
    appearance: none; outline: none; cursor: pointer;
  }

  .om-filter-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border: 0.5px solid var(--border);
    border-radius: 8px; background: var(--bg);
    font-size: 13px; font-family: var(--font);
    color: var(--muted); cursor: pointer; white-space: nowrap;
    transition: background .12s, color .12s;
  }
  .om-filter-btn:hover { background: var(--border); color: var(--text); }

  .om-board {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; align-items: start;
  }
  @media (max-width: 900px) { .om-board { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .om-board { grid-template-columns: 1fr; } }

  .om-col {
    display: flex; flex-direction: column;
    border-radius: 12px; overflow: hidden;
    border: 0.5px solid var(--border); min-height: 200px;
    background: var(--bg); animation: om-fadein .3s ease both;
  }
  @keyframes om-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .om-col:nth-child(1) { animation-delay: .00s; }
  .om-col:nth-child(2) { animation-delay: .06s; }
  .om-col:nth-child(3) { animation-delay: .12s; }
  .om-col:nth-child(4) { animation-delay: .18s; }

  .om-col-hd {
    padding: 12px 14px 10px; background: var(--surf);
    border-bottom: 0.5px solid var(--border);
    display: flex; flex-direction: column; gap: 6px;
  }
  .om-col-hd-top { display: flex; align-items: center; gap: 8px; }
  .om-col-dot    { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .om-col-name   { font-size: 13px; font-weight: 600; flex: 1; color: var(--text); }
  .om-col-count  {
    font-size: 11px; font-family: var(--mono);
    padding: 1px 7px; border-radius: 20px;
    border: 0.5px solid var(--border); color: var(--muted); background: var(--bg);
  }
  .om-col-hd-meta  { display: flex; gap: 10px; align-items: center; }
  .om-col-total    { font-size: 12px; font-family: var(--mono); font-weight: 500; color: var(--muted); }
  .om-col-progress { flex: 1; height: 3px; border-radius: 2px; background: var(--border); overflow: hidden; }
  .om-col-progress-fill { height: 100%; border-radius: 2px; transition: width .4s ease; }

  .om-col-pending  .om-col-dot           { background: var(--col-pending-dot); }
  .om-col-pending  .om-col-progress-fill  { background: var(--col-pending-dot); }
  .om-col-pending  .om-card::before       { background: var(--col-pending-dot); }
  .om-col-shipping .om-col-dot           { background: var(--col-shipping-dot); }
  .om-col-shipping .om-col-progress-fill  { background: var(--col-shipping-dot); }
  .om-col-shipping .om-card::before       { background: var(--col-shipping-dot); }
  .om-col-done     .om-col-dot           { background: var(--col-done-dot); }
  .om-col-done     .om-col-progress-fill  { background: var(--col-done-dot); }
  .om-col-done     .om-card::before       { background: var(--col-done-dot); }
  .om-col-cancel   .om-col-dot           { background: var(--col-cancel-dot); }
  .om-col-cancel   .om-col-progress-fill  { background: var(--col-cancel-dot); }
  .om-col-cancel   .om-card::before       { background: var(--col-cancel-dot); }

  .om-cards { padding: 10px; display: flex; flex-direction: column; gap: 8px; flex: 1; }

  .om-card {
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 10px; padding: 12px; cursor: pointer;
    transition: border-color .15s, transform .1s, box-shadow .15s;
    position: relative; overflow: hidden;
  }
  .om-card::before {
    content: ''; position: absolute;
    left: 0; top: 0; bottom: 0; width: 3px;
    border-radius: 10px 0 0 10px;
  }
  .om-card:hover {
    border-color: var(--text); transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,.08);
  }
  .om-card-top  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .om-card-num  { font-size: 12px; font-family: var(--mono); font-weight: 500; color: var(--text); }
  .om-card-date { font-size: 10px; color: var(--subtle); font-family: var(--mono); }
  .om-card-name {
    font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .om-card-phone  { font-size: 11px; color: var(--subtle); margin-bottom: 10px; }
  .om-card-footer { display: flex; align-items: center; justify-content: space-between; }
  .om-card-amount { font-size: 13px; font-family: var(--mono); font-weight: 500; color: var(--text); }
  .om-card-pay    {
    font-size: 10px; padding: 2px 7px; border-radius: 4px;
    border: 0.5px solid var(--border); color: var(--muted);
    background: var(--bg); font-family: var(--mono); letter-spacing: .3px;
  }
  .om-card-view-btn {
    width: 26px; height: 26px; border-radius: 6px;
    border: 0.5px solid var(--border); background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 11px; color: var(--muted);
    transition: background .12s, color .12s, border-color .12s;
  }
  .om-card-view-btn:hover { background: var(--text); color: #fff; border-color: var(--text); }

  .om-col-empty {
    padding: 24px 12px; text-align: center; color: var(--subtle);
    font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .om-col-empty-icon {
    width: 32px; height: 32px; border-radius: 8px; background: var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; opacity: .5;
  }

  .om-loading { display: flex; align-items: center; justify-content: center; min-height: 300px; }
  .om-spinner {
    width: 28px; height: 28px;
    border: 2.5px solid var(--border); border-top-color: var(--text);
    border-radius: 50%; animation: om-spin .7s linear infinite;
  }
  @keyframes om-spin { to { transform: rotate(360deg); } }

  .om-pagination { display: flex; justify-content: center; gap: 4px; margin-top: 20px; }
  .om-page-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 0.5px solid var(--border); background: var(--surf);
    font-size: 13px; font-family: var(--font); color: var(--muted);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .12s, color .12s, border-color .12s;
  }
  .om-page-btn:hover:not(:disabled) { background: var(--bg); color: var(--text); }
  .om-page-btn.active { background: var(--text); color: #fff; border-color: var(--text); font-weight: 600; }
  .om-page-btn:disabled { opacity: .3; cursor: not-allowed; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   COLUMN CONFIG
───────────────────────────────────────────────────────────────────────────── */
const COLUMNS = [
  {
    key: "pending",
    label: "Chờ xử lý",
    cls: "om-col-pending",
    match: (s) => s === "pending",
  },
  {
    key: "shipping",
    label: "Đang giao",
    cls: "om-col-shipping",
    match: (s) => s === "shipping" || s === "confirmed",
  },
  {
    key: "done",
    label: "Hoàn thành",
    cls: "om-col-done",
    match: (s) => s === "delivered" || s === "completed",
  },
  {
    key: "cancel",
    label: "Đã hủy",
    cls: "om-col-cancel",
    match: (s) => s === "cancelled",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ORDER CARD
───────────────────────────────────────────────────────────────────────────── */
const OrderCard = ({ order, onView }) => {
const amount = order.totalAmount_cents
  ? new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(order.totalAmount_cents)
  : "N/A";
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    : "—";

  return (
    <div className="om-card" onClick={() => onView(order)}>
      <div className="om-card-top">
        <span className="om-card-num">
          {order.orderNumber || order._id?.slice(-6)?.toUpperCase()}
        </span>
        <span className="om-card-date">{date}</span>
      </div>
      <div className="om-card-name">
        {order.userId?.name || "Khách vãng lai"}
      </div>
      <div className="om-card-phone">{order.phoneNumber || "—"}</div>
      <div className="om-card-footer">
        <span className="om-card-amount">{amount}</span>
        <span className="om-card-pay">
          {order.paymentMethod?.toUpperCase() || "N/A"}
        </span>
        <button
          className="om-card-view-btn"
          title="Xem chi tiết"
          onClick={(e) => {
            e.stopPropagation();
            onView(order);
          }}
        >
          <FaEye />
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   KANBAN COLUMN
───────────────────────────────────────────────────────────────────────────── */
const KanbanCol = ({ col, orders, totalOrders, onView }) => {
  const colOrders = orders.filter((o) => col.match(o.status));
  const colTotal = colOrders.reduce(
    (sum, o) => sum + (o.totalAmount_cents || 0),
    0,
  );
  const pct = totalOrders > 0 ? (colOrders.length / totalOrders) * 100 : 0;

  return (
    <div className={`om-col ${col.cls}`}>
      <div className="om-col-hd">
        <div className="om-col-hd-top">
          <div className="om-col-dot" />
          <span className="om-col-name">{col.label}</span>
          <span className="om-col-count">{colOrders.length}</span>
        </div>
        <div className="om-col-hd-meta">
          <span className="om-col-total">
            {(colTotal / 1000).toLocaleString()} đ
          </span>
          <div className="om-col-progress">
            <div
              className="om-col-progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      <div className="om-cards">
        {colOrders.length === 0 ? (
          <div className="om-col-empty">
            <div className="om-col-empty-icon">
              <FaShoppingBag />
            </div>
            <span>Không có đơn</span>
          </div>
        ) : (
          colOrders.map((order) => (
            <OrderCard key={order._id} order={order} onView={onView} />
          ))
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const OrderManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const itemsPerPage = 10;

  // Fetch dữ liệu từ API
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
      const fetchedOrders = res.orders || res.data || [];
      const total = res.total || res.pagination?.total || fetchedOrders.length;

      setOrders(fetchedOrders);
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
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
      fetchOrders();
    } catch (err) {
      toast.error("Cập nhật thất bại: " + (err.message || "Lỗi server"));
    }
  };

  // Pagination handler
  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(stats.total / itemsPerPage)) return;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", page);
      return p;
    });
  };

  // Filter & search handlers
  const handleFilterChange = (e) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("status", e.target.value);
      p.set("page", "1");
      return p;
    });
  };

  const handleSearchChange = (e) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("search", e.target.value);
      p.set("page", "1");
      return p;
    });
  };

  const totalPages = Math.ceil(stats.total / itemsPerPage);

  // Client-side filter for kanban display
  const displayedOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      (o.orderNumber || "").toLowerCase().includes(q) ||
      (o.userId?.name || "").toLowerCase().includes(q) ||
      (o.phoneNumber || "").toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "All" ||
      o.status === filterStatus ||
      (filterStatus === "shipping" && o.status === "confirmed") ||
      (filterStatus === "completed" && o.status === "delivered");
    return matchSearch && matchStatus;
  });

  return (
    <div
      className={`om-root animate-fade-in${searchTerm ? " om-search-active" : ""}`}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* PAGE HEADER */}
      <div className="om-page-header">
        <div>
          <h2 className="om-page-title">Quản Lý Đơn Hàng</h2>
          <p className="om-page-sub">
            {stats.total} đơn hàng · Theo dõi pipeline xử lý
          </p>
        </div>
        <button className="om-refresh-btn" onClick={fetchOrders}>
          <FaDownload style={{ fontSize: 11 }} /> Làm mới
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="om-error">{error}</div>}

      {/* TOOLBAR */}
      <div className="om-toolbar">
        <div className="om-search-wrap">
          <FaSearch />
          <input
            className="om-search-inp"
            type="text"
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <select
          className="om-filter-select"
          value={filterStatus}
          onChange={handleFilterChange}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="shipping">Đang vận chuyển</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <button className="om-filter-btn" onClick={fetchOrders}>
          <FaFilter style={{ fontSize: 11 }} /> Lọc & Làm mới
        </button>
      </div>

      {/* KANBAN BOARD */}
      {loading ? (
        <div className="om-loading">
          <div className="om-spinner" />
        </div>
      ) : (
        <>
          <div className="om-board">
            {COLUMNS.map((col) => (
              <KanbanCol
                key={col.key}
                col={col}
                orders={displayedOrders}
                totalOrders={displayedOrders.length}
                onView={handleView}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="om-pagination">
              <button
                className="om-page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  className={`om-page-btn${idx + 1 === currentPage ? " active" : ""}`}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="om-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

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
