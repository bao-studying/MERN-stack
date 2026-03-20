import React from "react";
import { Container } from "react-bootstrap";
import ProfileInfo from "../../components/profile/ProfileInfo";
import OrderHistory from "../../components/profile/OrderHistory";
import AddressList from "../../components/profile/AddressList";
import WishlistTab from "../../components/profile/WishlistTab";
import NotificationTab from "../../components/profile/NotificationTab";
import MyVouchers from "../../components/profile/MyVouchers";
import "../../assets/styles/auth-profile.css";
import { useAuth } from "../../hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import {
  FaUser,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaHeart,
  FaTicketAlt,
  FaBell,
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,300;0,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

  .up-root {
    --bg:    #f5f3ef;
    --surf:  #ffffff;
    --bd:    #e2ded6;
    --tx:    #1c1917;
    --mu:    #78716c;
    --su:    #a8a29e;
    --ac:    #c8490c;
    --font:  'DM Sans', sans-serif;
    --serif: 'Fraunces', serif;
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font);
    color: var(--tx);
  }

  /* ── HERO BAND ── */
  .up-hero {
    background: #1c1917;
    position: relative;
    overflow: hidden;
    padding-bottom: 0;
  }
  .up-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent, transparent 32px,
      rgba(255,255,255,.025) 32px, rgba(255,255,255,.025) 33px
    );
  }
  .up-hero-blob {
    position: absolute; border-radius: 50%;
    background: var(--ac); opacity: .12;
  }
  .up-hero-blob.b1 { width:260px; height:260px; top:-80px; right:-60px; }
  .up-hero-blob.b2 { width:140px; height:140px; bottom:-40px; left:10%; opacity:.07; background:#d4af37; }

  .up-hero-inner {
    position: relative; z-index: 1;
    padding: 36px 0 0;
    display: flex;
    align-items: flex-end;
    gap: 20px;
  }

  /* Avatar */
  .up-avatar-wrap { position: relative; flex-shrink: 0; }
  .up-avatar {
    width: 80px; height: 80px; border-radius: 20px;
    object-fit: cover;
    border: 3px solid rgba(255,255,255,.15);
    box-shadow: 0 4px 16px rgba(0,0,0,.3);
    display: block;
  }
  .up-avatar-ring {
    position: absolute; inset: -3px; border-radius: 23px;
    border: 1.5px solid rgba(200,73,12,.5);
    pointer-events: none;
  }

  /* Hero text */
  .up-hero-text { flex: 1; min-width: 0; padding-bottom: 4px; }
  .up-hero-greeting {
    font-size: 11px; font-weight: 600;
    letter-spacing: .6px; text-transform: uppercase;
    color: rgba(255,255,255,.4); margin: 0 0 4px;
  }
  .up-hero-name {
    font-family: var(--serif);
    font-size: 24px; font-weight: 400; font-style: italic;
    color: #fff; margin: 0 0 4px; letter-spacing: -.3px;
  }
  .up-hero-email { font-size: 12px; color: rgba(255,255,255,.45); margin: 0; }

  /* ── TAB NAVIGATION ── */
  .up-nav {
    position: relative; z-index: 2;
    display: flex; gap: 0;
    margin-top: 24px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .up-nav::-webkit-scrollbar { display: none; }

  .up-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 12px 18px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,.45);
    background: none; border: none;
    border-bottom: 2.5px solid transparent;
    cursor: pointer; white-space: nowrap;
    font-family: var(--font);
    transition: color .15s, border-color .15s, background .15s;
    position: relative;
  }
  .up-tab:hover { color: rgba(255,255,255,.75); }
  .up-tab.active {
    color: #fff;
    border-bottom-color: var(--ac);
  }
  .up-tab-icon { font-size: 13px; opacity: .8; }

  /* ── CONTENT AREA ── */
  .up-content {
    padding: 28px 0 48px;
  }

  /* ── LOADING STATE ── */
  .up-spin {
    width: 28px; height: 28px;
    border: 2.5px solid var(--bd); border-top-color: var(--ac);
    border-radius: 50%; animation: upSpin .7s linear infinite;
    margin: 60px auto; display: block;
  }
  @keyframes upSpin { to { transform: rotate(360deg); } }
`;

/* ─────────────────────────────────────────────────────────────────
   TAB CONFIG — tách ra ngoài để không re-create mỗi render
───────────────────────────────────────────────────────────────── */
const TABS = [
  { key: "info", label: "Thông tin", icon: <FaUser /> },
  { key: "orders", label: "Đơn hàng", icon: <FaShoppingBag /> },
  { key: "addresses", label: "Địa chỉ", icon: <FaMapMarkerAlt /> },
  { key: "wishlist", label: "Yêu thích", icon: <FaHeart /> },
  { key: "vouchers", label: "Voucher", icon: <FaTicketAlt /> },
  { key: "notifications", label: "Thông báo", icon: <FaBell /> },
];

const VALID_TABS = TABS.map((t) => t.key);

/* ─────────────────────────────────────────────────────────────────
   MAIN — 100% logic gốc giữ nguyên
───────────────────────────────────────────────────────────────── */
const UserProfilePage = () => {
  const { user } = useAuth();

  // useSearchParams (GIỮ NGUYÊN)
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : "info";

  // handleSwitchTab (GIỮ NGUYÊN)
  const handleSwitchTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // renderContent (GIỮ NGUYÊN)
  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return <ProfileInfo key={user?.email || "guest"} />;
      case "orders":
        return <OrderHistory />;
      case "addresses":
        return <AddressList />;
      case "wishlist":
        return <WishlistTab />;
      case "vouchers":
        return <MyVouchers />;
      case "notifications":
        return <NotificationTab />;
      default:
        return <ProfileInfo />;
    }
  };

  const avatarSrc =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=c8490c&color=fff&size=80&bold=true&format=png`;

  return (
    <div className="up-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── HERO BAND ── */}
      <div className="up-hero">
        <div className="up-hero-blob b1" />
        <div className="up-hero-blob b2" />

        <Container>
          {/* Avatar + Name */}
          <div className="up-hero-inner">
            <div className="up-avatar-wrap">
              <img src={avatarSrc} alt={user?.name} className="up-avatar" />
              <div className="up-avatar-ring" />
            </div>
            <div className="up-hero-text">
              <p className="up-hero-greeting">Tài khoản của bạn</p>
              <p className="up-hero-name">{user?.name || "Khách hàng"}</p>
              <p className="up-hero-email">{user?.email}</p>
            </div>
          </div>

          {/* Tab bar — nằm trong hero, sát đáy */}
          <nav className="up-nav">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`up-tab${activeTab === tab.key ? " active" : ""}`}
                onClick={() => handleSwitchTab(tab.key)}
              >
                <span className="up-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </Container>
      </div>

      {/* ── CONTENT ── */}
      <Container>
        <div className="up-content">{renderContent()}</div>
      </Container>
    </div>
  );
};

export default UserProfilePage;
