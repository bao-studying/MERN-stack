/**
 * components/profile/MyVouchers.jsx
 * Thay thế file cũ hoàn toàn — kết nối API thật
 * Logic tabs: active | lịch sử (used + expired) — giữ nguyên như gốc
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaTicketAlt,
  FaShippingFast,
  FaPercent,
  FaTag,
  FaArrowRight,
} from "react-icons/fa";
import axiosClient from "../../services/axiosClient";

/* ── STYLES ── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
.mv{font-family:'DM Sans',sans-serif;color:#1c1917}
.mv-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.mv-title{font-size:18px;font-weight:600;margin:0;letter-spacing:-.3px}
.mv-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:#c8490c;text-decoration:none;transition:gap .15s}
.mv-link:hover{gap:8px;color:#a83a08}

/* tabs */
.mv-tabs{display:flex;gap:0;border-bottom:0.5px solid #e2ded6;margin-bottom:20px}
.mv-tab{padding:9px 18px;font-size:13px;font-weight:500;color:#78716c;background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;transition:.15s;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:6px;white-space:nowrap}
.mv-tab.on{color:#c8490c;border-bottom-color:#c8490c}
.mv-cnt{font-size:10px;padding:1px 6px;border-radius:10px;background:#f5f3ef;color:#78716c;font-family:'DM Mono',monospace}
.mv-tab.on .mv-cnt{background:#fff0eb;color:#c8490c}

/* grid */
.mv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}

/* card */
.mv-card{display:flex;border:0.5px solid #e2ded6;border-radius:12px;overflow:hidden;background:#fff;transition:border-color .15s,transform .12s;position:relative}
.mv-card.alive:hover{border-color:#c8490c;transform:translateY(-1px)}
.mv-card.dead{opacity:.6}

/* left strip */
.mv-strip{width:72px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px 8px}
.mv-strip.s-active  {background:#c8490c}
.mv-strip.s-used    {background:#94a3b8}
.mv-strip.s-expired {background:#9ca3af}
.mv-strip-ico{font-size:20px;color:rgba(255,255,255,.9)}
.mv-strip-tag{font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.65);writing-mode:vertical-rl;transform:rotate(180deg)}

/* right info */
.mv-info{flex:1;padding:12px 14px;min-width:0;display:flex;flex-direction:column;gap:6px}
.mv-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.mv-code{font-family:'DM Mono',monospace;font-size:14px;font-weight:500;letter-spacing:.6px;color:#1c1917}
.mv-sbadge{font-size:10px;padding:2px 8px;border-radius:20px;font-weight:500;white-space:nowrap}
.mv-s-active {background:#dcfce7;color:#15803d}
.mv-s-used   {background:#f4f2ee;color:#78716c}
.mv-s-expired{background:#fee2e2;color:#dc2626}
.mv-desc{font-size:12px;font-weight:500;color:#1c1917}
.mv-meta{font-size:11px;color:#a8a29e;font-family:'DM Mono',monospace;display:flex;flex-direction:column;gap:2px}
.mv-footer{display:flex;justify-content:flex-end;margin-top:2px}
.mv-usebtn{display:inline-flex;align-items:center;gap:5px;padding:5px 13px;background:#c8490c;color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:500;font-family:'DM Sans',sans-serif;text-decoration:none;transition:background .12s;cursor:pointer}
.mv-usebtn:hover{background:#a83a08;color:#fff}

/* dashed separator */
.mv-dash{position:absolute;top:0;bottom:0;left:72px;width:0;border-left:1.5px dashed #e2ded6}

/* empty */
.mv-empty{padding:48px 20px;text-align:center;color:#a8a29e;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:8px}
.mv-empty-ico{font-size:32px;opacity:.2}

/* spinner */
.mv-spin{width:24px;height:24px;border:2px solid #e2ded6;border-top-color:#c8490c;border-radius:50%;animation:mvs .7s linear infinite;margin:40px auto;display:block}
@keyframes mvs{to{transform:rotate(360deg)}}
`;

/* ── HELPERS ── */
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);

const StripIcon = ({ type, status }) => {
  const ico =
    type === "freeship" ? (
      <FaShippingFast />
    ) : type === "percent" ? (
      <FaPercent />
    ) : (
      <FaTag />
    );
  const tag = type === "freeship" ? "ship" : type === "percent" ? "%" : "đ";
  const cls =
    status === "active"
      ? "s-active"
      : status === "used"
        ? "s-used"
        : "s-expired";
  return (
    <div className={`mv-strip ${cls}`}>
      <div className="mv-strip-ico">{ico}</div>
      <div className="mv-strip-tag">{tag}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  if (status === "active")
    return <span className="mv-sbadge mv-s-active">Sẵn sàng</span>;
  if (status === "used")
    return <span className="mv-sbadge mv-s-used">Đã dùng</span>;
  return <span className="mv-sbadge mv-s-expired">Hết hạn</span>;
};

const VoucherCard = ({ v, status }) => (
  <div className={`mv-card ${status === "active" ? "alive" : "dead"}`}>
    <div className="mv-dash" />
    <StripIcon type={v.type} status={status} />
    <div className="mv-info">
      <div className="mv-top">
        <span className="mv-code">{v.code}</span>
        <StatusBadge status={status} />
      </div>
      <div className="mv-desc">{v.description}</div>
      <div className="mv-meta">
        <span>HSD: {new Date(v.expiryDate).toLocaleDateString("vi-VN")}</span>
        <span>Đơn tối thiểu: {fmt(v.minOrder)}đ</span>
        {v.type === "percent" && (
          <span>
            Giảm: {v.value}%
            {v.maxDiscount > 0 ? ` (tối đa ${fmt(v.maxDiscount)}đ)` : ""}
          </span>
        )}
        {v.type === "fixed" && <span>Giảm: {fmt(v.value)}đ</span>}
        {v.type === "freeship" && <span>Miễn phí vận chuyển</span>}
      </div>
      {status === "active" && (
        <div className="mv-footer">
          <Link to="/products" className="mv-usebtn">
            Dùng ngay <FaArrowRight style={{ fontSize: 9 }} />
          </Link>
        </div>
      )}
    </div>
  </div>
);

/* ── MAIN ── */
const MyVouchers = () => {
  const [tab, setTab] = useState("active"); // "active" | "history"
  const [data, setData] = useState({ active: [], used: [], expired: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await axiosClient.get("/vouchers/my");
        if (r.success)
          setData({ active: r.active, used: r.used, expired: r.expired });
      } catch {
        /* silent — user sẽ thấy empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Render list — logic tabs giữ nguyên như gốc */
  const renderList = (filterTab) => {
    const list =
      filterTab === "active" ? data.active : [...data.used, ...data.expired];

    if (loading) return <div className="mv-spin" />;

    if (list.length === 0)
      return (
        <div className="mv-empty">
          <div className="mv-empty-ico">
            <FaTicketAlt />
          </div>
          <span>Không có voucher nào ở mục này.</span>
          {filterTab === "active" && (
            <Link to="/offers" className="mv-link" style={{ marginTop: 4 }}>
              Tìm thêm mã giảm giá <FaArrowRight style={{ fontSize: 10 }} />
            </Link>
          )}
        </div>
      );

    return (
      <div className="mv-grid">
        {list.map((v) => {
          const status =
            filterTab === "active"
              ? "active"
              : data.used.find((x) => x._id === v._id)
                ? "used"
                : "expired";
          return <VoucherCard key={v._id} v={v} status={status} />;
        })}
      </div>
    );
  };

  return (
    <div className="mv">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="mv-hd">
        <h4 className="mv-title">Kho Voucher</h4>
        <Link to="/offers" className="mv-link">
          Tìm thêm mã giảm giá <FaArrowRight style={{ fontSize: 10 }} />
        </Link>
      </div>

      {/* Tabs — giống gốc nhưng đẹp hơn */}
      <div className="mv-tabs">
        <button
          className={`mv-tab${tab === "active" ? " on" : ""}`}
          onClick={() => setTab("active")}
        >
          Có hiệu lực
          <span className="mv-cnt">{loading ? "—" : data.active.length}</span>
        </button>
        <button
          className={`mv-tab${tab === "history" ? " on" : ""}`}
          onClick={() => setTab("history")}
        >
          Lịch sử (Hết hạn / Đã dùng)
          <span className="mv-cnt">
            {loading ? "—" : data.used.length + data.expired.length}
          </span>
        </button>
      </div>

      {renderList(tab)}
    </div>
  );
};

export default MyVouchers;
