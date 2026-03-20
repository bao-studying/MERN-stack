/**
 * pages/admin/AdminVoucherManager.jsx
 * Route: /admin/vouchers
 * Sidebar: { path:"/admin/vouchers", label:"Voucher", icon:<FaTicketAlt/>, roles:["admin","manager"] }
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  FaTicketAlt,
  FaPlus,
  FaUserCheck,
  FaTrash,
  FaRandom,
  FaSearch,
  FaTag,
  FaShippingFast,
  FaPercent,
  FaTimes,
} from "react-icons/fa";
import axiosClient from "../../services/axiosClient";
import toast from "react-hot-toast";

/* ─────────────────────────── STYLES ─────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
.avm{--bg:#f5f3ef;--surf:#fff;--bd:#e2ded6;--tx:#1c1917;--mu:#78716c;--su:#a8a29e;--ac:#c8490c;--gn:#15803d;--bl:#1d4ed8;--f:'DM Sans',sans-serif;--m:'DM Mono',monospace;font-family:var(--f);color:var(--tx)}

/* header */
.avm-ph{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:18px;gap:12px}
.avm-pt{font-size:20px;font-weight:600;letter-spacing:-.4px;margin:0 0 2px}
.avm-ps{font-size:13px;color:var(--mu);margin:0}
.avm-btns{display:flex;gap:8px}

/* buttons */
.ab{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:9px;font-size:13px;font-weight:500;font-family:var(--f);cursor:pointer;transition:.15s;border:0.5px solid transparent}
.ab:active{transform:scale(.98)}
.ab-primary{background:var(--ac);color:#fff}
.ab-primary:hover{background:#a83a08}
.ab-secondary{background:var(--surf);color:var(--tx);border-color:var(--bd)}
.ab-secondary:hover{background:var(--bg)}
.ab-ghost{background:transparent;color:var(--mu);border-color:var(--bd)}
.ab-ghost:hover{background:var(--bg);color:var(--tx)}
.ab:disabled{opacity:.4;cursor:not-allowed}

/* stats */
.avm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.avm-stat{background:var(--surf);border:0.5px solid var(--bd);border-radius:12px;padding:14px 16px}
.avm-sl{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--su);margin:0 0 5px}
.avm-sv{font-size:24px;font-weight:600;font-family:var(--m);color:var(--tx);margin:0}

/* table card */
.avm-tc{background:var(--surf);border:0.5px solid var(--bd);border-radius:12px;overflow:hidden;margin-bottom:16px}
.avm-t{width:100%;border-collapse:collapse;font-size:13px}
.avm-t thead th{padding:9px 14px;font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--su);border-bottom:0.5px solid var(--bd);background:var(--bg);white-space:nowrap}
.avm-t tbody tr{border-bottom:0.5px solid var(--bd);transition:background .1s}
.avm-t tbody tr:last-child{border-bottom:none}
.avm-t tbody tr:hover{background:#faf9f7}
.avm-t td{padding:11px 14px;vertical-align:middle}

/* badges */
.vcode{font-family:var(--m);font-size:12px;font-weight:500;padding:3px 8px;background:var(--bg);border:0.5px solid var(--bd);border-radius:5px;letter-spacing:.5px}
.vtype{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500}
.vt-p{background:#dbeafe;color:#1d4ed8}
.vt-f{background:#dcfce7;color:#15803d}
.vt-s{background:#fef9c3;color:#a16207}
.vprice{font-family:var(--m);font-size:12px;color:var(--mu)}
.vok{font-family:var(--m);font-size:11px;color:#15803d}
.vbad{font-family:var(--m);font-size:11px;color:#dc2626}

/* assigned chips */
.achips{display:flex;flex-wrap:wrap;gap:4px;max-width:200px}
.achip{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;background:var(--bg);border:0.5px solid var(--bd);border-radius:20px;font-size:11px;color:var(--mu)}
.achip-x{background:none;border:none;padding:0;cursor:pointer;color:var(--su);font-size:11px;display:flex;align-items:center;line-height:1}
.achip-x:hover{color:#dc2626}

/* row actions */
.racts{display:flex;gap:5px;justify-content:flex-end}
.ract{width:30px;height:30px;border-radius:7px;border:0.5px solid var(--bd);background:var(--surf);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;color:var(--su);transition:.12s}
.ract.ra-assign:hover{color:var(--bl);border-color:#93c5fd;background:#eff6ff}
.ract.ra-del:hover{color:#dc2626;border-color:#fca5a5;background:#fef2f2}

/* empty */
.avm-empty{padding:48px;text-align:center;color:var(--su);font-size:13px}
.avm-empty-icon{font-size:28px;opacity:.25;margin-bottom:10px}

/* overlay + modal */
.avm-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px}
.avm-mo{background:var(--surf);border-radius:16px;border:0.5px solid var(--bd);box-shadow:0 8px 40px rgba(0,0,0,.18);width:100%;max-width:500px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;font-family:var(--f)}
.avm-mo::-webkit-scrollbar{width:3px}
.avm-mo::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}
.avm-mo.wide{max-width:560px}
.avm-mh{padding:15px 20px;border-bottom:0.5px solid var(--bd);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.avm-mt{font-size:14px;font-weight:600;margin:0;letter-spacing:-.2px}
.avm-mx{width:28px;height:28px;border-radius:7px;border:0.5px solid var(--bd);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--su)}
.avm-mx:hover{background:#fef2f2;color:#dc2626}
.avm-mb{padding:18px 20px;display:flex;flex-direction:column;gap:13px;flex:1}
.avm-mf{padding:13px 20px;border-top:0.5px solid var(--bd);display:flex;gap:8px;justify-content:flex-end;flex-shrink:0}

/* form fields */
.ff{display:flex;flex-direction:column;gap:4px}
.fl{font-size:12px;font-weight:500;color:var(--mu);margin:0}
.fr{color:var(--ac)}
.fi,.fs{padding:8px 11px;border:0.5px solid var(--bd);border-radius:8px;font-size:13px;font-family:var(--f);color:var(--tx);background:var(--bg);outline:none;transition:border-color .15s;width:100%}
.fi:focus,.fs:focus{border-color:var(--ac);background:#fff}
.fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='6'%3E%3Cpath d='M0 0l4.5 6L9 0z' fill='%2378716c'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fhint{font-size:11px;color:var(--su);margin:2px 0 0}
.finfo{font-size:12px;color:var(--mu);background:var(--bg);padding:8px 12px;border-radius:8px;border:0.5px solid var(--bd)}

/* assign modal */
.usearch{position:relative}
.usearch svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--su);font-size:12px;pointer-events:none}
.usinp{width:100%;padding:8px 12px 8px 30px;border:0.5px solid var(--bd);border-radius:8px;font-size:13px;font-family:var(--f);color:var(--tx);background:var(--bg);outline:none;transition:border-color .15s}
.usinp:focus{border-color:var(--ac)}
.ulist{display:flex;flex-direction:column;gap:3px;max-height:260px;overflow-y:auto}
.ulist::-webkit-scrollbar{width:3px}
.ulist::-webkit-scrollbar-thumb{background:var(--bd)}
.urow{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background .1s}
.urow:hover,.urow.sel{background:var(--bg)}
.urow.sel{background:#fff8f5}
.uavt{width:32px;height:32px;border-radius:50%;object-fit:cover;border:0.5px solid var(--bd);flex-shrink:0}
.uname{font-size:13px;font-weight:500;flex:1}
.umail{font-size:11px;color:var(--su)}
.uchk{width:18px;height:18px;border-radius:5px;border:1.5px solid var(--bd);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.12s}
.uchk.on{background:var(--ac);border-color:var(--ac);color:#fff;font-size:10px}

.spin{width:22px;height:22px;border:2.5px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:sp .7s linear infinite;margin:24px auto;display:block}
@keyframes sp{to{transform:rotate(360deg)}}
`;

/* ─────────────────────────── HELPERS ────────────────────────── */
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);

const TypeBadge = ({ type }) => {
  if (type === "percent")
    return (
      <span className="vtype vt-p">
        <FaPercent style={{ fontSize: 9 }} /> %
      </span>
    );
  if (type === "freeship")
    return (
      <span className="vtype vt-s">
        <FaShippingFast style={{ fontSize: 9 }} /> Freeship
      </span>
    );
  return (
    <span className="vtype vt-f">
      <FaTag style={{ fontSize: 9 }} /> Cố định
    </span>
  );
};

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  maxDiscount: "",
  minOrder: "1000000",
  expiryDate: "",
};
const EMPTY_GEN = {
  count: "5",
  type: "percent",
  value: "",
  minOrder_min: "1000000",
  minOrder_max: "10000000",
  expiryDate: "",
  prefix: "POKE",
};

/* ─────────────────────────── MAIN ───────────────────────────── */
const AdminVoucherManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [modal, setModal] = useState(null); // "create"|"generate"|"assign"
  const [form, setForm] = useState(EMPTY_FORM);
  const [gen, setGen] = useState(EMPTY_GEN);
  const [saving, setSaving] = useState(false);

  // assign
  const [target, setTarget] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [picked, setPicked] = useState([]);
  const [usearch, setUsearch] = useState("");
  const [aload, setAload] = useState(false);
  const [assigning, setAssigning] = useState(false);

  /* load */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosClient.get("/vouchers/admin");
      if (r.success) setVouchers(r.vouchers);
    } catch {
      toast.error("Lỗi tải voucher");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* stats */
  const now = new Date();
  const statActive = vouchers.filter(
    (v) => v.isActive && new Date(v.expiryDate) > now,
  ).length;
  const statExpired = vouchers.filter(
    (v) => new Date(v.expiryDate) <= now,
  ).length;
  const statAssigned = vouchers.reduce(
    (s, v) => s + (v.assignedTo?.length || 0),
    0,
  );
  const statUsed = vouchers.reduce((s, v) => s + (v.usedBy?.length || 0), 0);

  /* create */
  const handleCreate = async () => {
    if (!form.code || !form.description || !form.expiryDate) {
      toast.error("Điền đầy đủ thông tin");
      return;
    }
    setSaving(true);
    try {
      const r = await axiosClient.post("/vouchers/admin", {
        ...form,
        value: Number(form.value) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        minOrder: Number(form.minOrder),
      });
      if (r.success) {
        toast.success("Tạo voucher thành công!");
        setModal(null);
        setForm(EMPTY_FORM);
        load();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi tạo voucher");
    } finally {
      setSaving(false);
    }
  };

  /* generate */
  const handleGenerate = async () => {
    if (!gen.expiryDate) {
      toast.error("Chọn ngày hết hạn");
      return;
    }
    setSaving(true);
    try {
      const r = await axiosClient.post("/vouchers/admin/generate", {
        count: Number(gen.count),
        type: gen.type,
        value: gen.value ? Number(gen.value) : undefined,
        minOrder_min: Number(gen.minOrder_min),
        minOrder_max: Number(gen.minOrder_max),
        expiryDate: gen.expiryDate,
        prefix: gen.prefix || "POKE",
      });
      if (r.success) {
        toast.success(`Đã tạo ${r.count} voucher ngẫu nhiên!`);
        setModal(null);
        setGen(EMPTY_GEN);
        load();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi tạo hàng loạt");
    } finally {
      setSaving(false);
    }
  };

  /* delete */
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa voucher này?")) return;
    try {
      await axiosClient.delete(`/vouchers/admin/${id}`);
      toast.success("Đã xóa");
      setVouchers((v) => v.filter((x) => x._id !== id));
    } catch {
      toast.error("Lỗi xóa");
    }
  };

  /* open assign */
  const openAssign = async (v) => {
    setTarget(v);
    setPicked([]);
    setUsearch("");
    setModal("assign");
    setAload(true);
    try {
      const r = await axiosClient.get(
        `/vouchers/admin/${v._id}/eligible-users`,
      );
      if (r.success) setEligible(r.users);
    } catch {
      toast.error("Lỗi tải danh sách");
    } finally {
      setAload(false);
    }
  };

  const togglePick = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /* assign */
  const handleAssign = async () => {
    if (!picked.length) {
      toast.error("Chọn ít nhất 1 khách");
      return;
    }
    setAssigning(true);
    try {
      const r = await axiosClient.post(`/vouchers/admin/${target._id}/assign`, {
        userIds: picked,
      });
      if (r.success) {
        toast.success(`Đã tặng cho ${picked.length} khách!`);
        setModal(null);
        load();
      }
    } catch {
      toast.error("Lỗi tặng voucher");
    } finally {
      setAssigning(false);
    }
  };

  /* revoke */
  const handleRevoke = async (vid, uid, name) => {
    if (!window.confirm(`Thu hồi voucher của ${name}?`)) return;
    try {
      await axiosClient.delete(`/vouchers/admin/${vid}/assign/${uid}`);
      toast.success("Đã thu hồi");
      load();
    } catch {
      toast.error("Lỗi thu hồi");
    }
  };

  const filteredUsers = eligible.filter(
    (u) =>
      u.name.toLowerCase().includes(usearch.toLowerCase()) ||
      u.email.toLowerCase().includes(usearch.toLowerCase()),
  );

  const fc = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const gc = (e) => setGen({ ...gen, [e.target.name]: e.target.value });
  const closeModal = () => {
    setModal(null);
    setForm(EMPTY_FORM);
    setGen(EMPTY_GEN);
  };

  /* ─── RENDER ─── */
  return (
    <div className="avm">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* header */}
      <div className="avm-ph">
        <div>
          <h2 className="avm-pt">Quản Lý Voucher</h2>
          <p className="avm-ps">{vouchers.length} voucher trong hệ thống</p>
        </div>
        <div className="avm-btns">
          <button
            className="ab ab-secondary"
            onClick={() => setModal("generate")}
          >
            <FaRandom style={{ fontSize: 11 }} /> Tạo hàng loạt
          </button>
          <button className="ab ab-primary" onClick={() => setModal("create")}>
            <FaPlus style={{ fontSize: 11 }} /> Tạo voucher
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="avm-stats">
        {[
          ["Đang hoạt động", statActive],
          ["Hết hạn", statExpired],
          ["Lượt tặng", statAssigned],
          ["Lượt dùng", statUsed],
        ].map(([l, v]) => (
          <div className="avm-stat" key={l}>
            <p className="avm-sl">{l}</p>
            <p className="avm-sv">{v}</p>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="avm-tc">
        {loading ? (
          <div className="avm-empty">
            <div className="spin" />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="avm-empty">
            <div className="avm-empty-icon">
              <FaTicketAlt />
            </div>
            Chưa có voucher. Hãy tạo mới!
          </div>
        ) : (
          <table className="avm-t">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Mô tả</th>
                <th>Loại</th>
                <th>Giảm</th>
                <th>Min đơn</th>
                <th>Hết hạn</th>
                <th>Đã tặng</th>
                <th style={{ textAlign: "right", paddingRight: 14 }}>•••</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const exp = new Date(v.expiryDate) <= now;
                return (
                  <tr key={v._id}>
                    <td>
                      <span className="vcode">{v.code}</span>
                    </td>
                    <td
                      style={{
                        maxWidth: 150,
                        fontSize: 12,
                        color: "var(--mu)",
                      }}
                    >
                      {v.description}
                    </td>
                    <td>
                      <TypeBadge type={v.type} />
                    </td>
                    <td>
                      <span className="vprice">
                        {v.type === "freeship"
                          ? "Miễn ship"
                          : v.type === "percent"
                            ? `${v.value}%${v.maxDiscount ? ` ≤${fmt(v.maxDiscount)}đ` : ""}`
                            : `${fmt(v.value)}đ`}
                      </span>
                    </td>
                    <td>
                      <span className="vprice">{fmt(v.minOrder)}đ</span>
                    </td>
                    <td>
                      <span className={exp ? "vbad" : "vok"}>
                        {new Date(v.expiryDate).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td>
                      <div className="achips">
                        {!v.assignedTo?.length && (
                          <span style={{ fontSize: 11, color: "var(--su)" }}>
                            Chưa tặng
                          </span>
                        )}
                        {v.assignedTo?.slice(0, 3).map((u) => (
                          <span key={u._id} className="achip">
                            {u.name}
                            <button
                              className="achip-x"
                              onClick={() => handleRevoke(v._id, u._id, u.name)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {v.assignedTo?.length > 3 && (
                          <span className="achip">
                            +{v.assignedTo.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="racts">
                        <button
                          className="ract ra-assign"
                          title="Tặng cho khách"
                          onClick={() => openAssign(v)}
                        >
                          <FaUserCheck />
                        </button>
                        <button
                          className="ract ra-del"
                          title="Xóa"
                          onClick={() => handleDelete(v._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL: CREATE ── */}
      {modal === "create" && (
        <div
          className="avm-ov"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="avm-mo">
            <div className="avm-mh">
              <p className="avm-mt">Tạo voucher mới</p>
              <button className="avm-mx" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="avm-mb">
              <div className="ff">
                <label className="fl">
                  Mã voucher <span className="fr">*</span>
                </label>
                <input
                  className="fi"
                  name="code"
                  value={form.code}
                  onChange={fc}
                  placeholder="VD: POKEMON20"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              <div className="ff">
                <label className="fl">
                  Mô tả <span className="fr">*</span>
                </label>
                <input
                  className="fi"
                  name="description"
                  value={form.description}
                  onChange={fc}
                  placeholder="VD: Giảm 20% đơn từ 2 triệu"
                />
              </div>
              <div className="fg2">
                <div className="ff">
                  <label className="fl">
                    Loại giảm <span className="fr">*</span>
                  </label>
                  <select
                    className="fs"
                    name="type"
                    value={form.type}
                    onChange={fc}
                  >
                    <option value="percent">% Phần trăm</option>
                    <option value="fixed">Số tiền cố định</option>
                    <option value="freeship">Miễn phí vận chuyển</option>
                  </select>
                </div>
                <div className="ff">
                  <label className="fl">
                    {form.type === "percent"
                      ? "Phần trăm (%)"
                      : form.type === "fixed"
                        ? "Số tiền (đ)"
                        : "(không cần)"}
                  </label>
                  <input
                    className="fi"
                    name="value"
                    type="number"
                    value={form.value}
                    onChange={fc}
                    placeholder={
                      form.type === "percent" ? "VD: 15" : "VD: 50000"
                    }
                    disabled={form.type === "freeship"}
                  />
                </div>
              </div>
              {form.type === "percent" && (
                <div className="ff">
                  <label className="fl">
                    Giảm tối đa (đ) — 0 = không giới hạn
                  </label>
                  <input
                    className="fi"
                    name="maxDiscount"
                    type="number"
                    value={form.maxDiscount}
                    onChange={fc}
                    placeholder="VD: 300000"
                  />
                </div>
              )}
              <div className="fg2">
                <div className="ff">
                  <label className="fl">
                    Đơn tối thiểu (đ) <span className="fr">*</span>
                  </label>
                  <input
                    className="fi"
                    name="minOrder"
                    type="number"
                    value={form.minOrder}
                    onChange={fc}
                    min="1000000"
                    max="20000000"
                  />
                  <span className="fhint">1.000.000đ – 20.000.000đ</span>
                </div>
                <div className="ff">
                  <label className="fl">
                    Ngày hết hạn <span className="fr">*</span>
                  </label>
                  <input
                    className="fi"
                    name="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={fc}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>
            <div className="avm-mf">
              <button className="ab ab-ghost" onClick={closeModal}>
                Hủy
              </button>
              <button
                className="ab ab-primary"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  "Đang tạo..."
                ) : (
                  <>
                    <FaPlus style={{ fontSize: 10 }} /> Tạo voucher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: GENERATE ── */}
      {modal === "generate" && (
        <div
          className="avm-ov"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="avm-mo wide">
            <div className="avm-mh">
              <p className="avm-mt">Tạo voucher hàng loạt (ngẫu nhiên)</p>
              <button className="avm-mx" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="avm-mb">
              <div className="finfo">
                Hệ thống sẽ tự tạo mã ngẫu nhiên, giá trị giảm ngẫu nhiên và
                minOrder ngẫu nhiên trong khoảng bạn chọn (1tr–20tr).
              </div>
              <div className="fg2">
                <div className="ff">
                  <label className="fl">
                    Số lượng tạo <span className="fr">*</span>
                  </label>
                  <input
                    className="fi"
                    name="count"
                    type="number"
                    value={gen.count}
                    onChange={gc}
                    min="1"
                    max="20"
                  />
                  <span className="fhint">Tối đa 20 voucher / lần</span>
                </div>
                <div className="ff">
                  <label className="fl">Tiền tố mã</label>
                  <input
                    className="fi"
                    name="prefix"
                    value={gen.prefix}
                    onChange={gc}
                    placeholder="VD: POKE"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>
              <div className="fg2">
                <div className="ff">
                  <label className="fl">Loại giảm</label>
                  <select
                    className="fs"
                    name="type"
                    value={gen.type}
                    onChange={gc}
                  >
                    <option value="percent">% Phần trăm (random 5–30%)</option>
                    <option value="fixed">Cố định (random 250k–1tr)</option>
                    <option value="freeship">Miễn phí vận chuyển</option>
                  </select>
                </div>
                <div className="ff">
                  <label className="fl">
                    Giá trị cố định (để trống = random)
                  </label>
                  <input
                    className="fi"
                    name="value"
                    type="number"
                    value={gen.value}
                    onChange={gc}
                    placeholder={
                      gen.type === "percent" ? "VD: 20 (%)" : "VD: 100000 (đ)"
                    }
                    disabled={gen.type === "freeship"}
                  />
                </div>
              </div>
              <div className="fg2">
                <div className="ff">
                  <label className="fl">
                    minOrder từ (đ) <span className="fr">*</span>
                  </label>
                  <input
                    className="fi"
                    name="minOrder_min"
                    type="number"
                    value={gen.minOrder_min}
                    onChange={gc}
                    min="1000000"
                    max="20000000"
                  />
                </div>
                <div className="ff">
                  <label className="fl">
                    minOrder đến (đ) <span className="fr">*</span>
                  </label>
                  <input
                    className="fi"
                    name="minOrder_max"
                    type="number"
                    value={gen.minOrder_max}
                    onChange={gc}
                    min="1000000"
                    max="20000000"
                  />
                </div>
              </div>
              <span className="fhint" style={{ marginTop: -6 }}>
                minOrder mỗi voucher sẽ là số ngẫu nhiên trong khoảng trên (làm
                tròn 100k)
              </span>
              <div className="ff">
                <label className="fl">
                  Ngày hết hạn <span className="fr">*</span>
                </label>
                <input
                  className="fi"
                  name="expiryDate"
                  type="date"
                  value={gen.expiryDate}
                  onChange={gc}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="avm-mf">
              <button className="ab ab-ghost" onClick={closeModal}>
                Hủy
              </button>
              <button
                className="ab ab-primary"
                onClick={handleGenerate}
                disabled={saving}
              >
                {saving ? (
                  `Đang tạo...`
                ) : (
                  <>
                    <FaRandom style={{ fontSize: 10 }} /> Tạo {gen.count}{" "}
                    voucher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN ── */}
      {modal === "assign" && target && (
        <div
          className="avm-ov"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="avm-mo">
            <div className="avm-mh">
              <p className="avm-mt">
                Tặng{" "}
                <span className="vcode" style={{ marginLeft: 6 }}>
                  {target.code}
                </span>
              </p>
              <button className="avm-mx" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <div className="avm-mb">
              <div className="finfo">
                Khách chưa có voucher này. Chọn để tặng.
              </div>
              <div className="usearch">
                <FaSearch />
                <input
                  className="usinp"
                  placeholder="Tìm tên hoặc email..."
                  value={usearch}
                  onChange={(e) => setUsearch(e.target.value)}
                />
              </div>
              {aload ? (
                <div className="spin" />
              ) : filteredUsers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--su)",
                    fontSize: 13,
                    padding: 20,
                  }}
                >
                  {eligible.length === 0
                    ? "Không có khách đủ điều kiện"
                    : "Không tìm thấy"}
                </div>
              ) : (
                <div className="ulist">
                  {filteredUsers.map((u) => {
                    const sel = picked.includes(u._id);
                    return (
                      <div
                        key={u._id}
                        className={`urow${sel ? " sel" : ""}`}
                        onClick={() => togglePick(u._id)}
                      >
                        <img
                          src={u.avatarUrl || "https://via.placeholder.com/32"}
                          alt=""
                          className="uavt"
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="uname">{u.name}</div>
                          <div className="umail">{u.email}</div>
                        </div>
                        <div className={`uchk${sel ? " on" : ""}`}>
                          {sel && "✓"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {picked.length > 0 && (
                <div
                  style={{ fontSize: 12, color: "var(--ac)", fontWeight: 500 }}
                >
                  Đã chọn {picked.length} khách
                </div>
              )}
            </div>
            <div className="avm-mf">
              <button className="ab ab-ghost" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button
                className="ab ab-primary"
                onClick={handleAssign}
                disabled={assigning || !picked.length}
              >
                {assigning ? (
                  "Đang tặng..."
                ) : (
                  <>
                    <FaUserCheck style={{ fontSize: 11 }} /> Tặng (
                    {picked.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVoucherManager;
