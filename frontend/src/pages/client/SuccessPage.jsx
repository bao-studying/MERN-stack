import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaBoxOpen, FaCheckCircle, FaBox } from "react-icons/fa";
import "../../assets/styles/cart-checkout.css";

/* ─────────────────────────────────────────────────────────────
   STYLES — Bước 3/3 trong Twin Modal flow
   Palette & font giống hệt Cart + Checkout
───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .sp-root {
    --tx:    #1c1917;
    --mu:    #6b6560;
    --su:    #a09890;
    --bd:    #e8e4de;
    --bg:    #f5f2ed;
    --surf:  #ffffff;
    --ac:    #c8490c;
    --gn:    #15803d;
    --gnl:   #f0fdf4;
    --font:  'DM Sans', sans-serif;
    --serif: 'Cormorant Garamond', serif;
    --mono:  'DM Mono', monospace;
    min-height: 100vh;
    font-family: var(--font);
    position: relative;
    overflow-x: hidden;
  }

  /* ── PROGRESS BAR — Step 3 = 100% COMPLETE ── */
  .sp-progress {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 3px; background: var(--bd);
  }
  .sp-progress-fill {
    height: 100%; width: 100%;
    background: linear-gradient(90deg, var(--gn), #16a34a);
    position: relative;
    animation: spProgIn .8s .2s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes spProgIn {
    from { width: 66%; }
    to   { width: 100%; }
  }

  /* ── BACKDROP — identical DNA ── */
  .sp-backdrop {
    position: fixed; inset: 0; z-index: 0;
    background: var(--bg); overflow: hidden;
  }
  .sp-backdrop-grid {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 12px; padding: 60px 40px 40px;
    filter: blur(3px) saturate(.7);
    transform: scale(1.04); pointer-events: none;
  }
  .sp-backdrop-card {
    background: #fff; border-radius: 12px;
    border: 0.5px solid #e8e4de; overflow: hidden;
    aspect-ratio: 3/4; display: flex; flex-direction: column;
  }
  .sp-backdrop-img {
    flex: 1; background: linear-gradient(135deg, #f0ece6, #e8e4de);
    display: flex; align-items: center; justify-content: center;
  }
  .sp-backdrop-info { padding: 8px; }
  .sp-backdrop-name { height: 8px; background: #d6d1cb; border-radius: 2px; margin-bottom: 5px; }
  .sp-backdrop-price { height: 10px; width: 55%; background: #c8c3bc; border-radius: 2px; }
  /* SUCCESS: dim là xanh nhẹ thay vì kem — subtle signal */
  .sp-backdrop-dim {
    position: absolute; inset: 0;
    background: rgba(240,253,244,.82);
  }

  /* ── CONFETTI CANVAS ── */
  .sp-confetti {
    position: fixed; inset: 0; z-index: 5;
    pointer-events: none;
  }

  /* ── MODAL WRAPPER ── */
  .sp-modal-wrap {
    position: relative; z-index: 10; min-height: 100vh;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 52px 20px 60px;
  }

  /* ── MODAL CARD ── */
  .sp-modal {
    width: 100%; max-width: 620px;
    background: var(--surf); border-radius: 22px;
    box-shadow:
      0 0 0 0.5px rgba(0,0,0,.06),
      0 4px 16px rgba(0,0,0,.06),
      0 16px 48px rgba(0,0,0,.1),
      0 48px 96px rgba(0,0,0,.08);
    overflow: hidden;
    animation: spModalIn .5s .1s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes spModalIn {
    from { opacity:0; transform:translateY(24px) scale(.982); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* ── MODAL HEADER ── */
  .sp-modal-header {
    padding: 20px 32px 18px;
    border-bottom: 0.5px solid var(--bd);
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .sp-modal-title {
    font-family: var(--serif); font-size: 22px; font-weight: 500;
    color: var(--tx); margin: 0; letter-spacing: -.2px;
  }

  /* ── STEP WIZARD — Step 3 all completed ── */
  .sp-steps { display: flex; align-items: center; }
  .sp-step-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: var(--su); white-space: nowrap;
  }
  .sp-step-item.done   { color: var(--gn); }
  .sp-step-item.active { color: var(--tx); }
  .sp-step-count {
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--bd); color: var(--mu);
    font-size: 11px; font-weight: 600; font-family: var(--mono);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: background .3s, color .3s;
  }
  .sp-step-item.done   .sp-step-count { background: var(--gn); color: #fff; }
  .sp-step-item.active .sp-step-count { background: var(--tx); color: #fff; }
  .sp-step-line { width: 28px; height: 1px; background: var(--bd); margin: 0 6px; }
  .sp-step-line.done { background: var(--gn); }

  /* ── MODAL BODY ── */
  .sp-modal-body { padding: 36px 40px 40px; }

  /* ── SUCCESS ICON ── */
  .sp-icon-wrap {
    display: flex; justify-content: center; margin-bottom: 22px;
  }
  .sp-icon-ring {
    width: 76px; height: 76px; border-radius: 50%;
    background: var(--gnl); border: 1.5px solid #bbf7d0;
    display: flex; align-items: center; justify-content: center;
    animation: spRingIn .5s .35s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes spRingIn {
    from { opacity:0; transform:scale(.6); }
    to   { opacity:1; transform:scale(1); }
  }
  .sp-icon-inner {
    width: 54px; height: 54px; border-radius: 50%;
    background: var(--gn);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 22px;
    animation: spIconIn .4s .5s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes spIconIn {
    from { opacity:0; transform:scale(.5) rotate(-20deg); }
    to   { opacity:1; transform:scale(1)  rotate(0); }
  }

  /* ── HEADING ── */
  .sp-heading {
    font-family: var(--serif); font-size: 30px; font-weight: 500; font-style: italic;
    color: var(--tx); text-align: center; margin: 0 0 8px; letter-spacing: -.3px;
    animation: spFadeUp .4s .55s ease both;
  }
  .sp-sub {
    font-size: 13px; color: var(--mu); text-align: center;
    margin-bottom: 28px; line-height: 1.6;
    animation: spFadeUp .4s .62s ease both;
  }
  .sp-sub strong { color: var(--tx); font-weight: 600; font-family: var(--mono); }
  @keyframes spFadeUp {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── ORDER SUMMARY BOX ── */
  .sp-order-box {
    background: var(--bg); border-radius: 14px;
    border: 0.5px solid var(--bd); overflow: hidden;
    margin-bottom: 28px;
    animation: spFadeUp .4s .68s ease both;
  }
  .sp-order-box-header {
    padding: 12px 18px;
    border-bottom: 0.5px solid var(--bd);
    display: flex; align-items: center; justify-content: space-between;
  }
  .sp-order-label { font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--mu); }
  .sp-order-num { font-size: 12px; font-weight: 600; font-family: var(--mono); color: var(--tx); }

  .sp-order-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 18px; border-bottom: 0.5px solid var(--bd);
  }
  .sp-order-row:last-child { border-bottom: none; }
  .sp-order-row-lbl { font-size: 12px; color: var(--mu); }
  .sp-order-row-val { font-size: 12px; font-weight: 600; color: var(--tx); font-family: var(--mono); }
  .sp-order-row-val.total {
    font-family: var(--serif); font-size: 20px; font-weight: 600;
    color: var(--gn); letter-spacing: -.3px;
  }
  .sp-order-row-val.method {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; font-family: var(--font); font-weight: 600; color: var(--tx);
  }

  /* ── DIVIDER ── */
  .sp-divider { height: 0.5px; background: var(--bd); margin: 0; }

  /* ── CTA BUTTONS ── */
  .sp-cta-row {
    display: flex; gap: 10px;
    animation: spFadeUp .4s .78s ease both;
  }
  .sp-btn-outline {
    flex: 1; padding: 12px 16px; border-radius: 11px;
    border: 1px solid var(--bd); background: transparent;
    font-size: 12px; font-weight: 600; font-family: var(--font);
    color: var(--mu); cursor: pointer; text-decoration: none;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: border-color .12s, color .12s, background .12s;
  }
  .sp-btn-outline:hover { border-color: var(--tx); color: var(--tx); background: var(--bg); }
  .sp-btn-primary {
    flex: 1.4; padding: 12px 16px; border-radius: 11px;
    border: none; background: var(--tx);
    font-size: 12px; font-weight: 700; font-family: var(--font);
    letter-spacing: .4px; text-transform: uppercase;
    color: #fff; cursor: pointer; text-decoration: none;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: background .15s, transform .1s;
  }
  .sp-btn-primary:hover { background: #2f2a25; transform: translateY(-1px); color: #fff; }
  .sp-btn-primary:active { transform: translateY(0); }

  /* ── NOTE ── */
  .sp-note {
    text-align: center; font-size: 10px; color: var(--su);
    margin-top: 14px;
    animation: spFadeUp .4s .84s ease both;
  }
`;

/* ─────────────────────────────────────────────────────────────
   BACKDROP — same DNA, dim xanh nhẹ để signal success
───────────────────────────────────────────────────────────── */
const BackdropGrid = () => (
  <div className="sp-backdrop">
    <div className="sp-backdrop-grid">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="sp-backdrop-card">
          <div className="sp-backdrop-img">
            <FaBox size={20} color="#c8c3bc" />
          </div>
          <div className="sp-backdrop-info">
            <div
              className="sp-backdrop-name"
              style={{ width: `${55 + (i % 5) * 9}%` }}
            />
            <div className="sp-backdrop-price" />
          </div>
        </div>
      ))}
    </div>
    <div className="sp-backdrop-dim" />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   CONFETTI — lightweight canvas confetti (no lib needed)
───────────────────────────────────────────────────────────── */
const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#c8490c",
      "#15803d",
      "#b8860b",
      "#1d4ed8",
      "#e8e4de",
      "#f0fdf4",
    ];
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 4 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      r: Math.random() * Math.PI * 2,
      dr: (Math.random() - 0.5) * 0.15,
      dy: 1.5 + Math.random() * 2.5,
      dx: (Math.random() - 0.5) * 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.7 + Math.random() * 0.3,
    }));

    let frame;
    let elapsed = 0;
    const MAX = 220;

    const draw = () => {
      elapsed++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.y += p.dy;
        p.x += p.dx;
        p.r += p.dr;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.globalAlpha =
          elapsed > MAX
            ? Math.max(0, p.opacity - (elapsed - MAX) / 60)
            : p.opacity;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < MAX + 60) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className="sp-confetti" />;
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT — logic gốc giữ nguyên
───────────────────────────────────────────────────────────── */
const SuccessPage = () => {
  const location = useLocation();
  const orderData = location.state?.order;

  const paymentLabel =
    orderData?.paymentMethod === "cod"
      ? "Thanh toán khi nhận hàng (COD)"
      : orderData?.paymentMethod === "banking"
        ? "Chuyển khoản ngân hàng (VietQR)"
        : orderData?.paymentMethod || "—";

  return (
    <div className="sp-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Progress bar — 100% complete, green */}
      <div className="sp-progress">
        <div className="sp-progress-fill" />
      </div>

      {/* Confetti burst */}
      <Confetti />

      {/* Backdrop */}
      <BackdropGrid />

      {/* Modal */}
      <div className="sp-modal-wrap">
        <div className="sp-modal">
          {/* ── HEADER ── */}
          <div className="sp-modal-header">
            <h1 className="sp-modal-title">Xác nhận đơn hàng</h1>

            {/* STEP WIZARD — Step 3 active, 1 & 2 done */}
            <div className="sp-steps">
              <div className="sp-step-item done">
                <div className="sp-step-count">✓</div>
                <span>Giỏ hàng</span>
              </div>
              <div className="sp-step-line done" />
              <div className="sp-step-item done">
                <div className="sp-step-count">✓</div>
                <span>Thanh toán</span>
              </div>
              <div className="sp-step-line done" />
              <div className="sp-step-item active">
                <div className="sp-step-count">3</div>
                <span>Hoàn tất</span>
              </div>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="sp-modal-body">
            {/* Icon */}
            <div className="sp-icon-wrap">
              <div className="sp-icon-ring">
                <div className="sp-icon-inner">
                  <FaCheckCircle />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h2 className="sp-heading">Đặt hàng thành công!</h2>
            <p className="sp-sub">
              Cảm ơn bạn đã mua sắm tại{" "}
              <strong style={{ fontFamily: "var(--font)" }}>BAO Po_Box</strong>.
              <br />
              Mã đơn hàng của bạn là{" "}
              <strong>{orderData?.orderNumber || "—"}</strong>
            </p>

            {/* Order summary box */}
            <div className="sp-order-box">
              <div className="sp-order-box-header">
                <span className="sp-order-label">Chi tiết đơn hàng</span>
                {orderData?.orderNumber && (
                  <span className="sp-order-num">#{orderData.orderNumber}</span>
                )}
              </div>

              <div className="sp-order-row">
                <span className="sp-order-row-lbl">Phương thức thanh toán</span>
                <span className="sp-order-row-val method">{paymentLabel}</span>
              </div>

              {orderData?.shippingAddress && (
                <div className="sp-order-row">
                  <span className="sp-order-row-lbl">Địa chỉ giao hàng</span>
                  <span
                    className="sp-order-row-val"
                    style={{
                      maxWidth: 220,
                      textAlign: "right",
                      fontSize: 11,
                      fontFamily: "var(--font)",
                    }}
                  >
                    {orderData.shippingAddress}
                  </span>
                </div>
              )}

              {orderData?.discountAmount > 0 && (
                <div className="sp-order-row">
                  <span className="sp-order-row-lbl">Voucher giảm giá</span>
                  <span
                    className="sp-order-row-val"
                    style={{ color: "var(--gn)" }}
                  >
                    −{orderData.discountAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              <div className="sp-order-row">
                <span className="sp-order-row-lbl">Tổng thanh toán</span>
                <span className="sp-order-row-val total">
                  {orderData?.totalAmount_cents?.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="sp-cta-row">
              <Link to="/" className="sp-btn-outline">
                <FaHome style={{ fontSize: 12 }} /> Trang chủ
              </Link>
              <Link to="/profile" className="sp-btn-primary">
                <FaBoxOpen style={{ fontSize: 12 }} /> Xem đơn hàng
              </Link>
            </div>

            <div className="sp-note">
              Email xác nhận đơn hàng đã được gửi đến địa chỉ của bạn
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
