import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaBox } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import ProductModal from "../../components/admin/ProductModal";
import productApi from "../../services/product.service";
import categoryApi from "../../services/category.service";
import "../../assets/styles/admin.css";

/* ─────────────────────────────────────────────────────────────────────────────
   STYLE INJECTION  (scoped to .pm-root so it never bleeds into the host app)
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

  .pm-root {
    --pm-bg:        #f4f2ee;
    --pm-surface:   #ffffff;
    --pm-border:    #e2ded6;
    --pm-accent:    #c8490c;
    --pm-accent2:   #1a6b3c;
    --pm-text:      #1c1917;
    --pm-muted:     #78716c;
    --pm-subtle:    #a8a29e;
    --pm-info:      #1d4ed8;
    --pm-row-hover: #faf9f7;
    --pm-selected:  #fff8f5;
    --pm-sel-bdr:   #c8490c;
    --pm-panel-w:   420px;
    --pm-radius:    10px;
    --pm-font:      'DM Sans', sans-serif;
    --pm-mono:      'DM Mono', monospace;
    font-family: var(--pm-font);
  }

  /* ── LAYOUT ── */
  .pm-layout {
    display: flex;
    gap: 0;
    height: calc(100vh - 120px);
    min-height: 500px;
    background: var(--pm-bg);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--pm-border);
    box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 8px 32px rgba(0,0,0,.06);
  }

  /* ── LEFT PANE ── */
  .pm-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--pm-border);
    background: var(--pm-surface);
    transition: flex .3s ease;
  }
  .pm-left.panel-open { flex: 1.05; }

  /* ── TOOLBAR ── */
  .pm-toolbar {
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--pm-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
  }
  .pm-toolbar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .pm-title {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -.3px;
    color: var(--pm-text);
    margin: 0;
  }
  .pm-count {
    font-size: 12px;
    color: var(--pm-muted);
    font-weight: 400;
    margin-left: 6px;
    font-family: var(--pm-mono);
  }
  .pm-btn-add {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    background: var(--pm-accent);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--pm-font);
    cursor: pointer;
    white-space: nowrap;
    transition: background .15s, transform .1s;
  }
  .pm-btn-add:hover { background: #a83a08; transform: translateY(-1px); }
  .pm-btn-add:active { transform: translateY(0); }

  /* ── SEARCH + FILTER ── */
  .pm-filters {
    display: flex;
    gap: 8px;
  }
  .pm-search-wrap {
    flex: 1;
    position: relative;
  }
  .pm-search-wrap svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--pm-subtle);
    font-size: 12px;
    pointer-events: none;
  }
  .pm-input {
    width: 100%;
    padding: 8px 12px 8px 32px;
    border: 1px solid var(--pm-border);
    border-radius: 8px;
    font-size: 13px;
    font-family: var(--pm-font);
    color: var(--pm-text);
    background: var(--pm-bg);
    outline: none;
    transition: border-color .15s, background .15s;
  }
  .pm-input:focus { border-color: var(--pm-accent); background: #fff; }
  .pm-select {
    padding: 8px 28px 8px 11px;
    border: 1px solid var(--pm-border);
    border-radius: 8px;
    font-size: 13px;
    font-family: var(--pm-font);
    color: var(--pm-text);
    background: var(--pm-bg);
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2378716c'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    cursor: pointer;
    transition: border-color .15s;
    min-width: 140px;
  }
  .pm-select:focus { border-color: var(--pm-accent); }

  /* ── TABLE ── */
  .pm-table-wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .pm-table-wrap::-webkit-scrollbar { width: 5px; }
  .pm-table-wrap::-webkit-scrollbar-track { background: transparent; }
  .pm-table-wrap::-webkit-scrollbar-thumb { background: var(--pm-border); border-radius: 3px; }

  .pm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .pm-table thead th {
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .6px;
    text-transform: uppercase;
    color: var(--pm-subtle);
    background: var(--pm-surface);
    border-bottom: 1px solid var(--pm-border);
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .pm-table tbody tr {
    border-bottom: 1px solid var(--pm-border);
    cursor: pointer;
    transition: background .12s;
  }
  .pm-table tbody tr:last-child { border-bottom: none; }
  .pm-table tbody tr:hover { background: var(--pm-row-hover); }
  .pm-table tbody tr.pm-row-active {
    background: var(--pm-selected);
    border-left: 3px solid var(--pm-sel-bdr);
  }
  .pm-table tbody tr.pm-row-active td:first-child { padding-left: 11px; }
  .pm-table td { padding: 11px 14px; vertical-align: middle; color: var(--pm-text); }

  .pm-prod-thumb {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--pm-border);
    flex-shrink: 0;
  }
  .pm-prod-name {
    font-weight: 500;
    color: var(--pm-text);
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }
  .pm-prod-sku {
    font-size: 11px;
    color: var(--pm-subtle);
    font-family: var(--pm-mono);
    margin-top: 1px;
  }
  .pm-price {
    font-family: var(--pm-mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--pm-accent2);
    white-space: nowrap;
  }
  .pm-stock-num {
    font-family: var(--pm-mono);
    font-size: 13px;
    font-weight: 500;
  }
  .pm-badge {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.5;
  }
  .pm-badge-cat {
    background: #f0ede8;
    color: #57534e;
    border: 1px solid #e2ded6;
  }
  .pm-badge-brand {
    background: #eff6ff;
    color: var(--pm-info);
    border: 1px solid #bfdbfe;
  }
  .pm-badge-in {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }
  .pm-badge-out {
    background: #f4f2ee;
    color: var(--pm-muted);
    border: 1px solid var(--pm-border);
  }

  .pm-row-actions {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }
  .pm-action-btn {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    border: 1px solid var(--pm-border);
    background: var(--pm-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: background .12s, border-color .12s, transform .1s, color .12s;
    color: var(--pm-muted);
  }
  .pm-action-btn:hover { background: var(--pm-bg); transform: translateY(-1px); }
  .pm-action-btn.edit:hover { color: var(--pm-info); border-color: #bfdbfe; background: #eff6ff; }
  .pm-action-btn.del:hover { color: #dc2626; border-color: #fecaca; background: #fef2f2; }

  /* ── EMPTY STATE ── */
  .pm-empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--pm-subtle);
  }
  .pm-empty-icon { font-size: 32px; margin-bottom: 10px; opacity: .4; }
  .pm-empty-text { font-size: 13px; }

  /* ── PAGINATION ── */
  .pm-pagination {
    padding: 12px 16px;
    border-top: 1px solid var(--pm-border);
    display: flex;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .pm-page-btn {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    border: 1px solid var(--pm-border);
    background: transparent;
    font-size: 12px;
    font-family: var(--pm-font);
    color: var(--pm-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .12s, color .12s, border-color .12s;
  }
  .pm-page-btn:hover:not(:disabled) { background: var(--pm-bg); color: var(--pm-text); }
  .pm-page-btn.active { background: var(--pm-accent); color: #fff; border-color: var(--pm-accent); font-weight: 600; }
  .pm-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── RIGHT PANEL ── */
  .pm-panel {
    width: var(--pm-panel-w);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--pm-bg);
    transform: translateX(100%);
    transition: transform .28s cubic-bezier(.4,0,.2,1), width .28s ease;
    overflow: hidden;
    width: 0;
  }
  .pm-panel.open {
    transform: translateX(0);
    width: var(--pm-panel-w);
  }

  /* ── PANEL HEADER ── */
  .pm-panel-header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--pm-border);
    background: var(--pm-surface);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .pm-panel-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--pm-text);
    margin: 0;
    letter-spacing: -.2px;
  }
  .pm-panel-close {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    border: 1px solid var(--pm-border);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--pm-muted);
    line-height: 1;
    transition: background .12s, color .12s;
  }
  .pm-panel-close:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

  /* ── PANEL BODY ── */
  .pm-panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .pm-panel-body::-webkit-scrollbar { width: 4px; }
  .pm-panel-body::-webkit-scrollbar-thumb { background: var(--pm-border); border-radius: 3px; }

  /* ── PRODUCT HERO ── */
  .pm-detail-hero {
    background: var(--pm-surface);
    border-radius: var(--pm-radius);
    border: 1px solid var(--pm-border);
    padding: 16px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .pm-detail-img {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid var(--pm-border);
    flex-shrink: 0;
  }
  .pm-detail-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--pm-text);
    line-height: 1.4;
    margin: 0 0 4px;
  }
  .pm-detail-sku {
    font-size: 11px;
    font-family: var(--pm-mono);
    color: var(--pm-subtle);
    margin-bottom: 8px;
  }

  /* ── STATS ROW ── */
  .pm-stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .pm-stat-card {
    background: var(--pm-surface);
    border: 1px solid var(--pm-border);
    border-radius: var(--pm-radius);
    padding: 14px;
  }
  .pm-stat-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .5px;
    text-transform: uppercase;
    color: var(--pm-subtle);
    margin-bottom: 5px;
  }
  .pm-stat-value {
    font-size: 18px;
    font-weight: 600;
    font-family: var(--pm-mono);
    color: var(--pm-text);
    line-height: 1.2;
  }
  .pm-stat-value.green { color: var(--pm-accent2); }
  .pm-stat-value.orange { color: var(--pm-accent); }

  /* ── INFO SECTION ── */
  .pm-info-section {
    background: var(--pm-surface);
    border: 1px solid var(--pm-border);
    border-radius: var(--pm-radius);
    overflow: hidden;
  }
  .pm-info-section-header {
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .5px;
    text-transform: uppercase;
    color: var(--pm-subtle);
    border-bottom: 1px solid var(--pm-border);
    background: var(--pm-bg);
  }
  .pm-info-row {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid var(--pm-border);
    gap: 10px;
    font-size: 13px;
  }
  .pm-info-row:last-child { border-bottom: none; }
  .pm-info-key {
    color: var(--pm-muted);
    min-width: 90px;
    flex-shrink: 0;
    font-size: 12px;
  }
  .pm-info-val {
    color: var(--pm-text);
    font-weight: 500;
    flex: 1;
    text-align: right;
  }
  .pm-info-val.mono { font-family: var(--pm-mono); }

  /* ── VARIANTS ── */
  .pm-variants-list { display: flex; flex-direction: column; }
  .pm-variant-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--pm-border);
    font-size: 12px;
  }
  .pm-variant-row:last-child { border-bottom: none; }
  .pm-variant-name { flex: 1; color: var(--pm-text); font-weight: 500; }
  .pm-variant-sku { font-family: var(--pm-mono); color: var(--pm-subtle); font-size: 11px; }
  .pm-variant-stock { font-family: var(--pm-mono); font-weight: 600; color: var(--pm-text); min-width: 24px; text-align: right; }

  /* ── PANEL FOOTER ── */
  .pm-panel-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--pm-border);
    background: var(--pm-surface);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .pm-panel-btn {
    flex: 1;
    padding: 9px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--pm-font);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: background .15s, transform .1s, border-color .15s;
    border: 1px solid transparent;
  }
  .pm-panel-btn:active { transform: scale(.98); }
  .pm-panel-btn.primary { background: var(--pm-info); color: #fff; }
  .pm-panel-btn.primary:hover { background: #1a40b8; }
  .pm-panel-btn.danger { background: transparent; border-color: #fecaca; color: #dc2626; }
  .pm-panel-btn.danger:hover { background: #fef2f2; }

  /* ── PLACEHOLDER ── */
  .pm-panel-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    color: var(--pm-subtle);
  }
  .pm-placeholder-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--pm-border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
    font-size: 20px;
    opacity: .5;
  }
  .pm-placeholder-text { font-size: 13px; line-height: 1.6; }

  /* ── LOADING ── */
  .pm-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
  }
  .pm-spinner {
    width: 28px;
    height: 28px;
    border: 2.5px solid var(--pm-border);
    border-top-color: var(--pm-accent);
    border-radius: 50%;
    animation: pm-spin .7s linear infinite;
  }
  @keyframes pm-spin { to { transform: rotate(360deg); } }

  /* ── PANEL FADE-IN ── */
  @keyframes pm-slide-in {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .pm-panel-content-anim { animation: pm-slide-in .22s ease; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   DETAIL PANEL  (pure display component — no logic)
───────────────────────────────────────────────────────────────────────────── */
const DetailPanel = ({ product, onEdit, onDelete, onClose }) => {
  if (!product) {
    return (
      <div className="pm-panel-placeholder">
        <div className="pm-placeholder-icon">
          <FaBox />
        </div>
        <div className="pm-placeholder-text">
          Chọn một sản phẩm
          <br />
          để xem chi tiết
        </div>
      </div>
    );
  }

  const currentStock =
    product.variants?.length > 0
      ? product.variants.reduce((sum, v) => sum + v.stock, 0)
      : product.stock || 0;
  const isOutOfStock = currentStock <= 0 || product.is_active === false;

  return (
    <div
      className="pm-panel-content-anim"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div className="pm-panel-header">
        <p className="pm-panel-title">Chi tiết sản phẩm</p>
        <button className="pm-panel-close" onClick={onClose} title="Đóng">
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div className="pm-panel-body">
        {/* Hero */}
        <div className="pm-detail-hero">
          <img
            src={product.images?.[0]?.imageUrl || "https://placehold.co/80"}
            alt={product.name}
            className="pm-detail-img"
            onError={(e) => (e.target.src = "https://placehold.co/80")}
          />
          <div style={{ minWidth: 0 }}>
            <p className="pm-detail-name">{product.name}</p>
            <p className="pm-detail-sku">
              SKU: {product.variants?.[0]?.sku || product.sku || "N/A"}
            </p>
            <span
              className={`pm-badge ${isOutOfStock ? "pm-badge-out" : "pm-badge-in"}`}
            >
              {isOutOfStock ? "Hết hàng" : "Còn hàng"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="pm-stats-row">
          <div className="pm-stat-card">
            <div className="pm-stat-label">Giá bán</div>
            <div className="pm-stat-value green">
              {product.price_cents?.toLocaleString()}
              <span style={{ fontSize: 13, fontWeight: 400 }}> đ</span>
            </div>
          </div>
          <div className="pm-stat-card">
            <div className="pm-stat-label">Tồn kho</div>
            <div
              className={`pm-stat-value ${currentStock < 5 ? "orange" : ""}`}
            >
              {currentStock}
              <span style={{ fontSize: 13, fontWeight: 400 }}> sp</span>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="pm-info-section">
          <div className="pm-info-section-header">Thông tin</div>
          <div className="pm-info-row">
            <span className="pm-info-key">Danh mục</span>
            <span className="pm-info-val">
              <span className="pm-badge pm-badge-cat">
                {product.categoryId?.name || "N/A"}
              </span>
            </span>
          </div>
          <div className="pm-info-row">
            <span className="pm-info-key">Thương hiệu</span>
            <span className="pm-info-val">
              <span className="pm-badge pm-badge-brand">
                {product.brand || "Khác"}
              </span>
            </span>
          </div>
          {product.description && (
            <div className="pm-info-row" style={{ alignItems: "flex-start" }}>
              <span className="pm-info-key" style={{ paddingTop: 2 }}>
                Mô tả
              </span>
              <span
                className="pm-info-val"
                style={{
                  fontSize: 12,
                  color: "var(--pm-muted)",
                  fontWeight: 400,
                  textAlign: "right",
                }}
              >
                {product.description}
              </span>
            </div>
          )}
        </div>

         
      </div>

      {/* Footer actions */}
      <div className="pm-panel-footer">
        <button
          className="pm-panel-btn primary"
          onClick={() => onEdit(product)}
        >
          <FaEdit style={{ fontSize: 12 }} /> Chỉnh sửa
        </button>
        <button
          className="pm-panel-btn danger"
          onClick={() => onDelete(product._id)}
        >
          <FaTrash style={{ fontSize: 12 }} /> Xóa
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT  — all logic identical to original, only JSX changed
───────────────────────────────────────────────────────────────────────────── */
const ProductManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- 1. LẤY GIÁ TRỊ TỪ URL ---
  const searchTerm = searchParams.get("search") || "";
  const filterCategory = searchParams.get("category") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 5;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: selected product for detail panel (UI state only — no logic impact)
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- 2. LOAD DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll({ params: { is_active: true } }),
      ]);
      const productList = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data?.products || [];
      setProducts(productList);
      const categoryList = Array.isArray(catRes.data)
        ? catRes.data
        : catRes.data?.categories || catRes.categories || [];
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(
        "Lỗi tải dữ liệu. Vui lòng kiểm tra lại kết nối hoặc đăng nhập lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 3. XỬ LÝ MODAL TỪ URL ---
  const showCreateModal = searchParams.get("action") === "create";
  const editId = searchParams.get("edit");
  const showEditModal = !!editId;
  const editingProduct = editId ? products.find((p) => p._id === editId) : null;

  const handleAddNew = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("action", "create");
    setSearchParams(newParams);
  };

  const handleEdit = (product) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("edit", product._id);
    setSearchParams(newParams);
  };

  const handleCloseModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("action");
    newParams.delete("edit");
    setSearchParams(newParams);
  };

  // --- 4. LOGIC CRUD ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productApi.delete(id);
        setProducts(products.filter((p) => p._id !== id));
        if (selectedProduct?._id === id) setSelectedProduct(null);
        alert("Xóa thành công!");
      } catch (error) {
        console.error("Delete error:", error);
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          alert("Bạn không có quyền xóa sản phẩm này (Unauthorized).");
        } else {
          alert("Xóa thất bại!");
        }
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      let savedProduct;
      if (formData.id) {
        const res = await productApi.update(formData.id, formData);
        savedProduct = res.data?.data || res.data;
      } else {
        const res = await productApi.create(formData);
        savedProduct = res.data?.data || res.data;
      }
      const categoryIdToFind = savedProduct.categoryId;
      const categoryObj = categories.find((c) => c._id === categoryIdToFind);
      if (categoryObj)
        savedProduct = { ...savedProduct, categoryId: categoryObj };

      if (formData.id) {
        setProducts((prev) =>
          prev.map((p) => (p._id === savedProduct._id ? savedProduct : p)),
        );
        if (selectedProduct?._id === savedProduct._id)
          setSelectedProduct(savedProduct);
        alert("Cập nhật thành công!");
      } else {
        setProducts((prev) => [savedProduct, ...prev]);
        alert("Thêm mới thành công!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Save error:", error);
      if (error.response && error.response.status === 401) {
        alert("Lỗi xác thực: Vui lòng đăng nhập lại.");
      } else {
        alert("Lưu thất bại! " + (error.response?.data?.message || ""));
      }
    }
  };

  // --- 5. FILTER & PAGINATION ---
  const filteredProducts = products.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const catName = item.categoryId?.name || "N/A";
    const matchCategory =
      filterCategory === "All" || catName === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // --- 6. URL UPDATERS ---
  const handlePageChange = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", pageNumber);
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("search", e.target.value);
    newParams.set("page", 1);
    setSearchParams(newParams);
  };

  const handleCategoryChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("category", e.target.value);
    newParams.set("page", 1);
    setSearchParams(newParams);
  };

  const uniqueBrands = React.useMemo(() => {
    const brands = products
      .map((p) => p.brand)
      .filter((b) => b && b.trim() !== "" && b !== "Khác");
    return [...new Set(brands)];
  }, [products]);

  const panelOpen = !!selectedProduct;

  /* ── RENDER ── */
  return (
    <div className="pm-root animate-fade-in">
      {/* inject styles once */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Page header (outside the split-view card) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--pm-font)",
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              color: "var(--pm-text)",
              letterSpacing: "-.4px",
            }}
          >
            Quản Lý Sản Phẩm
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--pm-muted)",
              margin: "2px 0 0",
            }}
          >
            {filteredProducts.length} sản phẩm
          </p>
        </div>
        <button className="pm-btn-add" onClick={handleAddNew}>
          <FaPlus style={{ fontSize: 11 }} />
          Thêm mới
        </button>
      </div>

      {/* Split-view shell */}
      <div className={`pm-layout`}>
        {/* ──────── LEFT: list pane ──────── */}
        <div className={`pm-left ${panelOpen ? "panel-open" : ""}`}>
          {/* Toolbar */}
          <div className="pm-toolbar">
            <div className="pm-filters">
              <div className="pm-search-wrap">
                <FaSearch />
                <input
                  className="pm-input"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <select
                className="pm-select"
                value={filterCategory}
                onChange={handleCategoryChange}
              >
                <option value="All">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="pm-table-wrap">
            {loading ? (
              <div className="pm-loading">
                <div className="pm-spinner" />
              </div>
            ) : (
              <table className="pm-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 16 }}>Sản phẩm</th>
                    {!panelOpen && (
                      <>
                        <th>Danh mục</th>
                        <th>Thương hiệu</th>
                      </>
                    )}
                    <th>Giá bán</th>
                    <th>Kho</th>
                    {!panelOpen && <th>Tình trạng</th>}
                    <th style={{ textAlign: "right", paddingRight: 16 }}>
                      •••
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => {
                      const currentStock =
                        item.variants?.length > 0
                          ? item.variants.reduce((sum, v) => sum + v.stock, 0)
                          : item.stock || 0;
                      const isOutOfStock =
                        currentStock <= 0 || item.is_active === false;
                      const isSelected = selectedProduct?._id === item._id;

                      return (
                        <tr
                          key={item._id}
                          className={isSelected ? "pm-row-active" : ""}
                          onClick={() =>
                            setSelectedProduct(isSelected ? null : item)
                          }
                        >
                          <td style={{ paddingLeft: isSelected ? 11 : 14 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <img
                                src={
                                  item.images?.[0]?.imageUrl ||
                                  "https://placehold.co/40"
                                }
                                alt={item.name}
                                className="pm-prod-thumb"
                                onError={(e) =>
                                  (e.target.src = "https://placehold.co/40")
                                }
                              />
                              <div style={{ minWidth: 0 }}>
                                <div className="pm-prod-name">{item.name}</div>
                                <div className="pm-prod-sku">
                                  {item.variants?.[0]?.sku || item.sku || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          {!panelOpen && (
                            <>
                              <td>
                                <span className="pm-badge pm-badge-cat">
                                  {item.categoryId?.name || "N/A"}
                                </span>
                              </td>
                              <td>
                                <span className="pm-badge pm-badge-brand">
                                  {item.brand || "Khác"}
                                </span>
                              </td>
                            </>
                          )}
                          <td>
                            <span className="pm-price">
                              {item.price_cents?.toLocaleString()} đ
                            </span>
                          </td>
                          <td>
                            <span className="pm-stock-num">{currentStock}</span>
                          </td>
                          {!panelOpen && (
                            <td>
                              <span
                                className={`pm-badge ${isOutOfStock ? "pm-badge-out" : "pm-badge-in"}`}
                              >
                                {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                              </span>
                            </td>
                          )}
                          <td>
                            <div
                              className="pm-row-actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="pm-action-btn edit"
                                title="Chỉnh sửa"
                                onClick={() => handleEdit(item)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="pm-action-btn del"
                                title="Xóa"
                                onClick={() => handleDelete(item._id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="pm-empty">
                          <div className="pm-empty-icon">
                            <FaBox />
                          </div>
                          <div className="pm-empty-text">
                            Không tìm thấy sản phẩm
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pm-pagination">
              <button
                className="pm-page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  className={`pm-page-btn ${idx + 1 === currentPage ? "active" : ""}`}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="pm-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* ──────── RIGHT: detail panel ──────── */}
        <div className={`pm-panel ${panelOpen ? "open" : ""}`}>
          <DetailPanel
            product={selectedProduct}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setSelectedProduct(null)}
          />
        </div>
      </div>

      {/* MODAL — unchanged */}
      <ProductModal
        key={editingProduct ? editingProduct._id : "create-new"}
        show={showCreateModal || showEditModal}
        handleClose={handleCloseModal}
        product={editingProduct}
        onSave={handleSave}
        categories={categories}
        availableBrands={uniqueBrands}
      />
    </div>
  );
};

export default ProductManager;
