import React, { useState, useEffect } from "react";
import { Row, Col, Table, Badge, Spinner, Alert } from "react-bootstrap";
import {
  FaShoppingBag,
  FaUsers,
  FaCoins,
  FaGem,
  FaCrown,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAdminTheme } from "../../context/useAdminTheme";
import orderApi from "../../services/order.service";
import "../../assets/styles/admin.css";

const DashboardPage = () => {
  const { theme } = useAdminTheme();

  const [orders, setOrders] = useState([]); // Luôn là mảng rỗng ban đầu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await orderApi.getAllOrders({
          limit: 20,
          sort: "-createdAt",
        });

        // Chuẩn hóa response: luôn lấy mảng orders
        let fetchedOrders = [];
        if (Array.isArray(result)) {
          fetchedOrders = result;
        } else if (result && typeof result === "object") {
          fetchedOrders = result.orders || result.data || [];
        }

        // Bảo vệ: nếu không phải array, ép thành []
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
      } catch (err) {
        setError("Không tải được đơn hàng: " + (err.message || "Lỗi server"));
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ================== TÍNH TOÁN AN TOÀN ==================
  // Hàm reduce an toàn: nếu không phải array hoặc rỗng → trả default
  const safeReduce = (arr, callback, initialValue) => {
    if (!Array.isArray(arr) || arr.length === 0) return initialValue;
    return arr.reduce(callback, initialValue);
  };

  const totalRevenue = safeReduce(
    orders,
    (sum, o) => sum + (o.totalAmount_cents || 0),
    0,
  );
  const totalOrders = orders.length || 0;

  const kpiData = [
    {
      title: "Tổng Doanh Thu",
      value: `${(totalRevenue / 1_000_000_000).toFixed(2)} tỷ`,
      icon: <FaCoins />,
      trend: "+18.7%",
      isUp: true,
      color: "gold",
    },
    {
      title: "Đơn Hàng",
      value: totalOrders.toLocaleString(),
      icon: <FaShoppingBag />,
      trend: `+${Math.round(
        (safeReduce(
          orders.filter((o) => o.status === "completed"),
          (sum) => sum + 1,
          0,
        ) /
          (totalOrders || 1)) *
          100,
      )}% hoàn thành`,
      isUp: true,
      color: "success",
    },
    {
      title: "Khách Hàng",
      value: "3,672",
      icon: <FaUsers />,
      trend: "+9.8%",
      isUp: true,
      color: "primary",
    },
    {
      title: "Lợi Nhuận Hiếm",
      value: "842 triệu",
      icon: <FaGem />,
      trend: "+32.1%",
      isUp: true,
      color: "danger",
    },
  ];

  // Doanh thu theo ngày - an toàn
  const revenueByDay = safeReduce(
    orders,
    (acc, order) => {
      if (!order?.createdAt) return acc;
      const date = new Date(order.createdAt).toLocaleDateString("vi-VN", {
        weekday: "short",
      });
      acc[date] = (acc[date] || 0) + (order.totalAmount_cents || 0);
      return acc;
    },
    {},
  );

  const revenueData = Object.entries(revenueByDay).map(([name, doanhthu]) => ({
    name,
    doanhthu,
  }));

  // Top set bán chạy - an toàn
  const setSales = safeReduce(
    orders,
    (acc, order) => {
      if (!order?.items) return acc;
      order.items.forEach((item) => {
        const name = item.name || "Unknown Set";
        acc[name] = (acc[name] || 0) + (item.quantity || 1);
      });
      return acc;
    },
    {},
  );

  const setData = Object.entries(setSales)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const COLORS = ["#d4af37", "#ff6b6b", "#4ecdc4", "#45b7d1"];

  // Recent Orders - an toàn
  const recentOrders = Array.isArray(orders)
    ? orders.slice(0, 5).map((o) => ({
        id: o.orderNumber || "N/A",
        user: o.userId?.name || "Khách vãng lai",
        date: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
        total: o.totalAmount_cents
          ? `${(o.totalAmount_cents / 1000).toLocaleString()}đ`
          : "0đ",
        status: o.status || "unknown",
        product: o.items?.[0]?.name || "Nhiều sản phẩm",
      }))
    : [];

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge bg="success" className="rounded-pill px-3 py-2">
            Hoàn thành
          </Badge>
        );
      case "shipping":
        return (
          <Badge bg="primary" className="rounded-pill px-3 py-2">
            Đang giao
          </Badge>
        );
      case "pending":
        return (
          <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">
            Chờ xác nhận
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="rounded-pill px-3 py-2">
            Đã hủy
          </Badge>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
        <div>
          <h1 className="gradient-title mb-1">
            <FaCrown className="me-3 text-gold" /> BAO Po_Box Dashboard
          </h1>
          <p className="text-gold-light small">
            Kho báu Pokémon TCG – Dữ liệu realtime
          </p>
        </div>
        <div className="text-gold small fw-bold">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center py-5">
          <Spinner
            animation="border"
            variant="gold"
            style={{ width: "4rem", height: "4rem" }}
          />
          <p className="mt-3 text-gold">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* KPI - Chỉ render khi không loading */}
      {!loading && (
        <Row className="g-4 mb-5">
          {kpiData.map((item, idx) => (
            <Col md={6} xl={3} key={idx}>
              <div className={`kpi-card kpi-${item.color} shadow-gold-glow`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="kpi-label mb-1 text-uppercase">
                      {item.title}
                    </p>
                    <h3 className="kpi-value mb-0">{item.value}</h3>
                  </div>
                  <div className={`kpi-icon bg-${item.color}-opacity`}>
                    {item.icon}
                  </div>
                </div>
                <div className="mt-3 d-flex align-items-center small trend-badge">
                  <span className={`trend ${item.isUp ? "up" : "down"}`}>
                    {item.isUp ? <FaArrowUp /> : <FaArrowDown />} {item.trend}
                  </span>
                  <span className="text-gold-light ms-2">
                    so với tuần trước
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* CHARTS - Chỉ render khi có dữ liệu */}
      {!loading && orders.length > 0 && (
        <Row className="g-4 mb-5">
          <Col lg={8}>
            <div
              className="chart-card shadow-gold-glow"
              style={{ minHeight: "420px" }}
            >
              <div className="chart-header">
                <h5 className="fw-bold mb-0 text-gold">Doanh Thu Tuần Này</h5>
                <small className="text-gold-light">
                  Tổng booster & sealed product
                </small>
              </div>
              <div
                style={{ width: "100%", height: "380px", minHeight: "380px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#d4af37"
                          stopOpacity={0.7}
                        />
                        <stop
                          offset="95%"
                          stopColor="#d4af37"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid #d4af37",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="doanhthu"
                      stroke="#d4af37"
                      fill="url(#goldArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div
              className="chart-card shadow-gold-glow"
              style={{ minHeight: "420px" }}
            >
              <div className="chart-header">
                <h5 className="fw-bold mb-0 text-gold">Top Set Bán Chạy</h5>
              </div>
              <div
                style={{ width: "100%", height: "300px", minHeight: "300px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={setData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {setData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid #d4af37",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* ĐƠN HÀNG GẦN ĐÂY */}
      <div className="table-card shadow-gold-glow rounded-4 overflow-hidden">
        <div className="p-4 d-flex justify-content-between align-items-center border-bottom border-gold border-opacity-25">
          <h5 className="fw-bold mb-0 text-gold">
            <FaShoppingBag className="me-2" /> Đơn Hàng Gần Đây
          </h5>
          <Badge bg="gold" className="px-3 py-2">
            Xem tất cả
          </Badge>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 text-gold-light">
            <FaShoppingBag size={60} className="mb-4 opacity-50" />
            <h5>Chưa có đơn hàng nào</h5>
            <p className="small">Khi có đơn mới, sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <Table hover responsive className="custom-table mb-0">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Sản Phẩm</th>
                <th>Ngày Đặt</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => (
                <tr key={idx} className="hover-gold-row">
                  <td className="fw-bold text-gold">{order.id}</td>
                  <td>{order.user}</td>
                  <td className="text-truncate" style={{ maxWidth: "180px" }}>
                    {order.product}
                  </td>
                  <td>{order.date}</td>
                  <td className="fw-bold text-success">{order.total}</td>
                  <td>{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
