import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import {
  FaDownload,
  FaCubes,
  FaGem,
  FaChartLine,
  FaHistory,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAdminTheme } from "../../context/useAdminTheme";
import "../../assets/styles/admin.css";

const StatsPage = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark";

  // Dữ liệu doanh thu theo tháng của TCG Store
  const monthlyData = [
    { name: "Th 1", income: 45000, expense: 32000 },
    { name: "Th 2", income: 52000, expense: 35000 },
    { name: "Th 3", income: 61000, expense: 48000 },
    { name: "Th 4", income: 58000, expense: 42000 },
    { name: "Th 5", income: 72000, expense: 51000 },
    { name: "Th 6", income: 85000, expense: 55000 },
  ];

  // Hiệu quả kinh doanh theo dòng sản phẩm Pokémon
  const productPerformance = [
    { name: "Booster Box", sales: 12000, stock: 450 },
    { name: "Elite Trainer", sales: 8500, stock: 320 },
    { name: "Premium Col.", sales: 15000, stock: 120 },
    { name: "Single Cards", sales: 5400, stock: 2100 },
    { name: "Accessories", sales: 3200, stock: 1500 },
  ];

  return (
    <div className="animate-fade-in p-3">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0" style={{ color: "var(--admin-text)" }}>
            Trung Tâm Phân Tích TCG
          </h2>
          <p className="text-muted small m-0">
            Theo dõi dòng tiền và hiệu suất kho hàng của TCG Store
          </p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select
            className="shadow-none admin-input"
            style={{ width: "160px", borderRadius: "10px" }}
          >
            <option>6 tháng qua</option>
            <option>Năm nay</option>
            <option>Toàn thời gian</option>
          </Form.Select>
          <Button
            variant="danger"
            className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2 border-0 shadow-sm"
          >
            <FaDownload /> Xuất Báo Cáo
          </Button>
        </div>
      </div>

      {/* KPI CARDS - Màu sắc theo các loại bóng Pokémon */}
      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <div
            className="stat-card border-0 shadow-sm"
            style={{ borderLeft: "5px solid #ef5350" }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted text-uppercase fw-bold small mb-1">
                  Tổng Doanh Thu
                </p>
                <h3 className="fw-bold text-dark">4.28 Tỷ</h3>
              </div>
              <div
                className="stat-icon"
                style={{ backgroundColor: "#ffebee", color: "#ef5350" }}
              >
                <FaChartLine />
              </div>
            </div>
            <small className="text-success fw-bold">
              ↑ 18%{" "}
              <span className="text-muted fw-normal">so với tháng trước</span>
            </small>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div
            className="stat-card border-0 shadow-sm"
            style={{ borderLeft: "5px solid #2196f3" }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted text-uppercase fw-bold small mb-1">
                  Giá Trị Kho Hàng
                </p>
                <h3 className="fw-bold text-dark">1.85 Tỷ</h3>
              </div>
              <div
                className="stat-icon"
                style={{ backgroundColor: "#e3f2fd", color: "#2196f3" }}
              >
                <FaCubes />
              </div>
            </div>
            <small className="text-info fw-bold">
              1,240{" "}
              <span className="text-muted fw-normal">
                sản phẩm đang lưu kho
              </span>
            </small>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div
            className="stat-card border-0 shadow-sm"
            style={{ borderLeft: "5px solid #ffca28" }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted text-uppercase fw-bold small mb-1">
                  Đơn Hàng Cao Cấp
                </p>
                <h3 className="fw-bold text-dark">85</h3>
              </div>
              <div
                className="stat-icon"
                style={{ backgroundColor: "#fff8e1", color: "#ffca28" }}
              >
                <FaGem />
              </div>
            </div>
            <small className="text-warning fw-bold">
              Dòng Grail <span className="text-muted fw-normal">tăng mạnh</span>
            </small>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div
            className="stat-card border-0 shadow-sm"
            style={{ borderLeft: "5px solid #7e57c2" }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted text-uppercase fw-bold small mb-1">
                  Tỷ Lệ Hoàn Trả
                </p>
                <h3 className="fw-bold text-dark">0.2%</h3>
              </div>
              <div
                className="stat-icon"
                style={{ backgroundColor: "#f3e5f5", color: "#7e57c2" }}
              >
                <FaHistory />
              </div>
            </div>
            <small className="text-success fw-bold">
              Cực thấp{" "}
              <span className="text-muted fw-normal">độ uy tín cao</span>
            </small>
          </div>
        </Col>
      </Row>

      {/* CHARTS */}
      <Row className="g-4">
        <Col lg={7}>
          <div className="chart-container shadow-sm border-0">
            <h5 className="fw-bold mb-4" style={{ color: "var(--admin-text)" }}>
              Biến Động Dòng Tiền TCG (VND)
            </h5>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef5350" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef5350" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "#333" : "#f0f0f0"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1e1e1e" : "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    height={36}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Doanh Thu"
                    stroke="#ef5350"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Vốn Nhập Hàng"
                    stroke="#bdbdbd"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="chart-container shadow-sm border-0">
            <h5 className="fw-bold mb-4" style={{ color: "var(--admin-text)" }}>
              Thị Phần Theo Dòng Thẻ
            </h5>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart
                  data={productPerformance}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={isDark ? "#333" : "#f0f0f0"}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12, fontWeight: "bold" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      backgroundColor: isDark ? "#1e1e1e" : "#fff",
                      borderRadius: "12px",
                      border: "none",
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    name="Sản Lượng Bán"
                    fill="#2196f3"
                    radius={[0, 10, 10, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default StatsPage;
