import React, { useEffect, useMemo, useState, useRef } from "react";
import { Nav, Form, Button, Badge, Dropdown, Offcanvas } from "react-bootstrap";
import {
  FaShoppingCart,
  FaUserCircle,
  FaSearch,
  FaCrown,
  FaBars,
  FaSignOutAlt,
  FaBoxOpen,
  FaBell,
  FaCommentDots,
  FaTag,
  FaTimes,
} from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import orderApi from "../../services/order.service";
import axiosClient from "../../services/axiosClient";

/* ─── Constants (giữ nguyên 100%) ─── */
const CHAT_UNREAD_STORAGE_KEY = "header_chat_unread";
const CHAT_UNREAD_EVENT = "header-chat-unread-changed";
const HEADER_READ_NOTI_KEY_PREFIX = "header_read_notifications_";

/* ─── Inline styles object (Đã nâng cấp UI) ─── */
const S = {
  // navWrap sẽ được xử lý style động ở dưới component để làm hiệu ứng Smart Scroll
  navPill: {
    height: "64px",
    borderRadius: "999px",
    // Hiệu ứng Liquid Glass (Kính lỏng)
    background: "linear-gradient(135deg, rgba(20,20,20,0.5), rgba(5,5,5,0.7))",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.5), 
      inset 0 1px 0 rgba(212,175,55,0.15),
      inset 0 -1px 0 rgba(0,0,0,0.4)
    `,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
    position: "relative",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    flexShrink: 0,
  },
  logoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d4af37, #f9e297, #d4af37)",
    boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    color: "#fff", // Đổi màu trắng kết hợp text-shadow vàng để sang hơn
    textShadow: "0 2px 10px rgba(212,175,55,0.4)",
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: "1.2rem",
    letterSpacing: "1.5px",
    whiteSpace: "nowrap",
  },
  navLinksWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },
  navLink: {
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    padding: "8px 18px",
    borderRadius: "999px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  },
  navLinkActive: {
    color: "#0a0a0a",
    backgroundColor: "#d4af37",
    boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d4af37",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    flexShrink: 0,
    outline: "none",
  },
  searchOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    backgroundColor: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    animation: "fadeIn 0.3s ease",
  },
  searchInput: {
    width: "100%",
    maxWidth: 700,
    background: "transparent",
    border: "none",
    borderBottom: "2px solid rgba(212,175,55,0.5)",
    outline: "none",
    color: "#fff",
    fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
    fontFamily: "'Playfair Display', serif",
    textAlign: "center",
    padding: "16px 0",
    caretColor: "#d4af37",
    transition: "border-color 0.3s ease",
  },
  dropMenu: {
    backgroundColor: "rgba(15,15,15,0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(212,175,55,0.15)",
    borderRadius: "20px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
    padding: "12px",
    minWidth: 260,
    marginTop: 12,
  },
  offcanvasBg: {
    backgroundColor: "rgba(10,10,10,0.95)",
    backdropFilter: "blur(20px)",
    color: "#fff",
    borderLeft: "1px solid rgba(212,175,55,0.1)",
  },
};

/* ─── Pokéball SVG ─── */
const Pokeball = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    style={{ display: "block" }}
  >
    <circle
      cx="16"
      cy="16"
      r="15"
      fill="#fff"
      stroke="#1a1a1a"
      strokeWidth="2"
    />
    <path d="M1.5 16 A14.5 14.5 0 0 1 30.5 16 Z" fill="#e53e3e" />
    <line x1="1.5" y1="16" x2="30.5" y2="16" stroke="#1a1a1a" strokeWidth="2" />
    <circle
      cx="16"
      cy="16"
      r="5"
      fill="#fff"
      stroke="#1a1a1a"
      strokeWidth="2"
    />
    <circle cx="16" cy="16" r="2.5" fill="#1a1a1a" />
  </svg>
);

/* ─── Icon badge helper ─── */
const NotiIcon = ({ type }) => {
  if (type === "order")
    return <FaBoxOpen style={{ color: "#d4af37", flexShrink: 0 }} />;
  if (type === "voucher")
    return <FaTag style={{ color: "#f59e0b", flexShrink: 0 }} />;
  return <FaCommentDots style={{ color: "#38bdf8", flexShrink: 0 }} />;
};

/* ─── Hover utility ─── */
const hoverIcon = (e, enter) => {
  e.currentTarget.style.backgroundColor = enter
    ? "rgba(212,175,55,0.15)"
    : "rgba(255,255,255,0.03)";
  e.currentTarget.style.borderColor = enter
    ? "rgba(212,175,55,0.4)"
    : "rgba(255,255,255,0.08)";
  e.currentTarget.style.transform = enter
    ? "translateY(-2px)"
    : "translateY(0)";
  e.currentTarget.style.boxShadow = enter
    ? "0 8px 20px rgba(212,175,55,0.15)"
    : "none";
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const Header = () => {
  /* ── state giữ nguyên 100% ── */
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user?.role === "admin";
  const userAvatar = user?.avatarUrl;
  const userName = user?.name || "User";
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [chatUnread, setChatUnread] = useState(0);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  /* ── UI-only state (Đã thêm logic Smart Scroll) ── */
  const [showSearch, setShowSearch] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const searchInputRef = useRef(null);

  const readStorageKey = `${HEADER_READ_NOTI_KEY_PREFIX}${user?._id || "guest"}`;

  /* ── Smart Scroll Logic ── */
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          // Cuộn xuống -> Ẩn Header
          setIsVisible(false);
        } else {
          // Cuộn lên -> Hiện Header
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", controlNavbar, { passive: true });
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  /* ── focus search ── */
  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 80);
  }, [showSearch]);

  /* ── ESC to close search ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── readNotificationIds (100% original) ── */
  useEffect(() => {
    if (!isLoggedIn) {
      setReadNotificationIds([]);
      return;
    }
    try {
      const raw = localStorage.getItem(readStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setReadNotificationIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [isLoggedIn, readStorageKey]);

  /* ── fetch notifications (100% original) ── */
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setChatUnread(0);
      return;
    }
    let cancelled = false;
    const fetchNotifications = async () => {
      try {
        const [ordersRes, voucherRes] = await Promise.all([
          orderApi.getMyOrders(),
          axiosClient.get("/vouchers/my"),
        ]);
        if (cancelled) return;

        const orderNotis = (ordersRes?.data || []).slice(0, 5).map((order) => ({
          id: `order-${order._id}`,
          type: "order",
          title: `Đơn #${order.orderNumber || order._id?.slice(-6)} - ${order.status || "pending"}`,
          desc: `Tổng: ${(order.totalAmount_cents || 0).toLocaleString("vi-VN")}đ`,
          link: "/profile?tab=orders",
          ts: new Date(
            order.updatedAt || order.createdAt || Date.now(),
          ).getTime(),
        }));

        const voucherNotis = (voucherRes?.active || [])
          .slice(0, 5)
          .map((v) => ({
            id: `voucher-${v._id}`,
            type: "voucher",
            title: `Voucher mới: ${v.code}`,
            desc: v.description || "Bạn có voucher mới khả dụng",
            link: "/offers",
            ts: new Date(v.updatedAt || v.createdAt || Date.now()).getTime(),
          }));

        setNotifications([...orderNotis, ...voucherNotis]);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    };
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isLoggedIn, user?._id]);

  /* ── chat unread (100% original) ── */
  useEffect(() => {
    if (!isLoggedIn) return;
    const syncChatUnread = () => {
      const count = Number(localStorage.getItem(CHAT_UNREAD_STORAGE_KEY));
      setChatUnread(Number.isFinite(count) && count > 0 ? count : 0);
    };
    syncChatUnread();
    const onCustomUnread = (e) => {
      const next = Number(e?.detail?.count);
      Number.isFinite(next)
        ? setChatUnread(next > 0 ? next : 0)
        : syncChatUnread();
    };
    window.addEventListener(CHAT_UNREAD_EVENT, onCustomUnread);
    window.addEventListener("storage", syncChatUnread);
    return () => {
      window.removeEventListener(CHAT_UNREAD_EVENT, onCustomUnread);
      window.removeEventListener("storage", syncChatUnread);
    };
  }, [isLoggedIn]);

  /* ── mergedNotifications (100% original) ── */
  const mergedNotifications = useMemo(() => {
    const chatNoti = chatUnread
      ? [
          {
            id: "chat-unread",
            type: "message",
            title: `${chatUnread} tin nhắn mới`,
            desc: "Bạn có tin nhắn chưa đọc từ hỗ trợ",
            link: "#chat",
            ts: Date.now(),
          },
        ]
      : [];
    return [...chatNoti, ...notifications].sort(
      (a, b) => (b.ts || 0) - (a.ts || 0),
    );
  }, [chatUnread, notifications]);

  const unreadCount = useMemo(() => {
    return mergedNotifications.reduce((count, item) => {
      if (item.id === "chat-unread") return count + 1;
      return readNotificationIds.includes(item.id) ? count : count + 1;
    }, 0);
  }, [mergedNotifications, readNotificationIds]);

  /* ── handlers (100% original) ── */
  const handleClickNotification = (noti) => {
    if (noti.id === "chat-unread") {
      localStorage.setItem(CHAT_UNREAD_STORAGE_KEY, "0");
      window.dispatchEvent(
        new CustomEvent(CHAT_UNREAD_EVENT, { detail: { count: 0 } }),
      );
      setChatUnread(0);
    } else if (!readNotificationIds.includes(noti.id)) {
      const nextReadIds = [noti.id, ...readNotificationIds].slice(0, 200);
      setReadNotificationIds(nextReadIds);
      localStorage.setItem(readStorageKey, JSON.stringify(nextReadIds));
    }
    const link = noti.link;
    if (link === "#chat") {
      window.dispatchEvent(new Event("open-floating-chat"));
      return;
    }
    if (link) navigate(link);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowMobileMenu(false);
      setShowSearch(false);
      setSearchTerm("");
    }
  };

  /* ── nav links config ── */
  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/products", label: "Sản phẩm" },
    { path: "/offers", label: "Ưu đãi" },
    { path: "/about", label: "Về chúng tôi" },
    ...(isAdmin ? [{ path: "/admin", label: "Dashboard" }] : []),
  ];

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0); } to { opacity: 1; backdrop-filter: blur(16px); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .pill-dropdown .dropdown-menu { animation: slideDown 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); border: none; }
        .nav-link-hover:hover { color: #d4af37 !important; background: rgba(255,255,255,0.05); } 
      `}</style>

      {/* ══════════════════════════════════
         FLOATING PILL NAVBAR (SMART SCROLL)
      ══════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${isVisible ? "0" : "-150%"})`,
          zIndex: 1050,
          width: "100%",
          padding: "0 16px",
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ ...S.navPill, maxWidth: "1280px", margin: "0 auto" }}>
          {/* Logo */}
          <Link to="/" style={S.logo}>
            <div style={S.logoIconWrap}>
              <img
                src="/images/logo.jpg"
                alt="Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // Đảm bảo ảnh luôn lấp đầy vòng tròn mà không bị méo
                }}
              />
            </div>
            <span style={S.logoText}>KAZOKU </span>
          </Link>

          {/* Desktop center nav */}
          <nav style={S.navLinksWrap} className="d-none d-lg-flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  !isActive ? "nav-link-hover" : ""
                }
                style={({ isActive }) => ({
                  ...S.navLink,
                  ...(isActive ? S.navLinkActive : {}),
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right action group */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search */}
            <button
              style={S.iconBtn}
              onClick={() => setShowSearch(true)}
              onMouseEnter={(e) => hoverIcon(e, true)}
              onMouseLeave={(e) => hoverIcon(e, false)}
              title="Tìm kiếm"
            >
              <FaSearch size={15} />
            </button>

            {/* Bell */}
            {isLoggedIn && (
              <Dropdown align="end" className="pill-dropdown">
                <Dropdown.Toggle as="div" bsPrefix=" ">
                  <button
                    style={S.iconBtn}
                    onMouseEnter={(e) => hoverIcon(e, true)}
                    onMouseLeave={(e) => hoverIcon(e, false)}
                  >
                    <FaBell size={15} />
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          fontSize: "0.6rem",
                          padding: "3px 6px",
                          boxShadow: "0 0 10px rgba(239,68,68,0.6)",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </button>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  style={{
                    ...S.dropMenu,
                    minWidth: 340,
                    maxHeight: 420,
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px 12px",
                      color: "#d4af37",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      marginBottom: 8,
                    }}
                  >
                    Thông báo mới
                  </div>
                  {mergedNotifications.length === 0 ? (
                    <div
                      style={{
                        padding: "20px 12px",
                        color: "#888",
                        fontSize: "0.9rem",
                        textAlign: "center",
                      }}
                    >
                      Bạn chưa có thông báo nào.
                    </div>
                  ) : (
                    mergedNotifications.slice(0, 8).map((noti) => {
                      const isUnread =
                        noti.id === "chat-unread" ||
                        !readNotificationIds.includes(noti.id);
                      return (
                        <Dropdown.Item
                          key={noti.id}
                          onClick={() => handleClickNotification(noti)}
                          style={{
                            backgroundColor: isUnread
                              ? "rgba(212,175,55,0.08)"
                              : "transparent",
                            borderRadius: 12,
                            marginBottom: 4,
                            padding: "12px 14px",
                            color: "#fff",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(212,175,55,0.15)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = isUnread
                              ? "rgba(212,175,55,0.08)"
                              : "transparent")
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "flex-start",
                            }}
                          >
                            <div style={{ paddingTop: 2, fontSize: "1.1rem" }}>
                              <NotiIcon type={noti.type} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: isUnread ? 700 : 500,
                                  fontSize: "0.85rem",
                                  lineHeight: 1.4,
                                }}
                              >
                                {noti.title}
                              </div>
                              <div
                                style={{
                                  color: "#aaa",
                                  fontSize: "0.75rem",
                                  marginTop: 4,
                                }}
                              >
                                {noti.desc}
                              </div>
                            </div>
                            {isUnread && noti.id !== "chat-unread" && (
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: "#ef4444",
                                  flexShrink: 0,
                                  marginTop: 6,
                                  boxShadow: "0 0 8px rgba(239,68,68,0.6)",
                                }}
                              />
                            )}
                          </div>
                        </Dropdown.Item>
                      );
                    })
                  )}
                </Dropdown.Menu>
              </Dropdown>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              style={{ ...S.iconBtn, textDecoration: "none" }}
              onMouseEnter={(e) => hoverIcon(e, true)}
              onMouseLeave={(e) => hoverIcon(e, false)}
            >
              <FaShoppingCart size={15} />
              {isLoggedIn && cartCount > 0 && (
                <Badge
                  bg="warning"
                  text="dark"
                  pill
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    fontSize: "0.6rem",
                    padding: "3px 6px",
                    fontWeight: 800,
                    boxShadow: "0 0 10px rgba(245,158,11,0.6)",
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Link>

            {/* Avatar Dropdown */}
            <Dropdown align="end" className="pill-dropdown">
              <Dropdown.Toggle as="div" bsPrefix=" ">
                <div
                  style={{
                    ...S.iconBtn,
                    overflow: "hidden",
                    borderColor: isLoggedIn
                      ? "rgba(212,175,55,0.5)"
                      : "rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => hoverIcon(e, true)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = isLoggedIn
                      ? "rgba(212,175,55,0.5)"
                      : "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {isLoggedIn && userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUserCircle size={18} />
                  )}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu style={S.dropMenu}>
                {isLoggedIn ? (
                  <>
                    <div
                      style={{
                        padding: "12px 16px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {userName}
                        {isAdmin && (
                          <Badge
                            bg="danger"
                            style={{
                              fontSize: "0.6rem",
                              padding: "3px 6px",
                              letterSpacing: "1px",
                            }}
                          >
                            ADMIN
                          </Badge>
                        )}
                      </div>
                      <div
                        style={{
                          color: "#aaa",
                          fontSize: "0.8rem",
                          marginTop: 4,
                        }}
                      >
                        {user?.email}
                      </div>
                    </div>

                    {[
                      {
                        to: "/profile",
                        icon: <FaUserCircle size={14} />,
                        label: "Tài khoản",
                        highlight: false,
                      },
                      ...(isAdmin
                        ? [
                            {
                              to: "/admin",
                              icon: <FaCrown size={14} />,
                              label: "Quản trị",
                              highlight: true,
                            },
                          ]
                        : []),
                      {
                        to: "/profile?tab=orders",
                        icon: <FaBoxOpen size={14} />,
                        label: "Đơn mua",
                        highlight: false,
                      },
                    ].map((item) => (
                      <Dropdown.Item
                        key={item.to}
                        as={Link}
                        to={item.to}
                        style={{
                          color: item.highlight ? "#f59e0b" : "#ddd",
                          borderRadius: 12,
                          padding: "10px 16px",
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontWeight: item.highlight ? 600 : 400,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(212,175,55,0.15)";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <span
                          style={{
                            color: item.highlight ? "#f59e0b" : "#d4af37",
                          }}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Dropdown.Item>
                    ))}

                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.07)",
                        margin: "8px 0",
                      }}
                    />

                    <Dropdown.Item
                      onClick={logout}
                      style={{
                        color: "#ef4444",
                        borderRadius: 12,
                        padding: "10px 16px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(239,68,68,0.15)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <FaSignOutAlt size={14} /> Đăng xuất
                    </Dropdown.Item>
                  </>
                ) : (
                  <div
                    style={{ padding: "16px 12px", display: "grid", gap: 12 }}
                  >
                    <Link
                      to="/login"
                      style={{
                        display: "block",
                        background: "linear-gradient(135deg, #d4af37, #f9e297)",
                        color: "#000",
                        borderRadius: 999,
                        padding: "12px 0",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                        boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                      }}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      style={{
                        display: "block",
                        border: "1px solid rgba(212,175,55,0.4)",
                        color: "#d4af37",
                        borderRadius: 999,
                        padding: "12px 0",
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "rgba(212,175,55,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* Mobile hamburger */}
            <button
              style={{ ...S.iconBtn, display: "none" }}
              className="d-lg-none"
              onClick={() => setShowMobileMenu(true)}
              onMouseEnter={(e) => hoverIcon(e, true)}
              onMouseLeave={(e) => hoverIcon(e, false)}
            >
              <FaBars size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
         SEARCH FULLSCREEN OVERLAY
      ══════════════════════════════════ */}
      {showSearch && (
        <div
          style={S.searchOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSearch(false);
          }}
        >
          <button
            onClick={() => setShowSearch(false)}
            style={{
              position: "absolute",
              top: 32,
              right: 40,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: 50,
              height: 50,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.transform = "rotate(0)";
            }}
          >
            <FaTimes size={20} />
          </button>

          <p
            style={{
              color: "#d4af37",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: 40,
            }}
          >
            Tìm kiếm vật phẩm hiếm
          </p>

          <form
            onSubmit={handleSearch}
            style={{ width: "100%", maxWidth: 700 }}
          >
            <input
              ref={searchInputRef}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#d4af37")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(212,175,55,0.5)")
              }
              placeholder="Nhập tên thẻ, bộ sưu tập..."
              style={S.searchInput}
            />
          </form>

          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.8rem",
              letterSpacing: "2px",
              marginTop: 30,
            }}
          >
            <kbd
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "4px 8px",
                borderRadius: 4,
              }}
            >
              Enter
            </kbd>{" "}
            để tìm ·{" "}
            <kbd
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "4px 8px",
                borderRadius: 4,
              }}
            >
              Esc
            </kbd>{" "}
            để đóng
          </p>
        </div>
      )}

      {/* ══════════════════════════════════
         MOBILE OFFCANVAS (Giữ nguyên logic)
      ══════════════════════════════════ */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        style={S.offcanvasBg}
      >
        <Offcanvas.Header
          closeButton
          closeVariant="white"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "20px",
          }}
        >
          <Offcanvas.Title>
            <span
              style={{
                color: "#d4af37",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                letterSpacing: "2px",
                fontSize: "1.3rem",
              }}
            >
              MENU
            </span>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px 20px",
          }}
        >
          {/* Mobile search */}
          <form onSubmit={handleSearch} style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 999,
                border: "1px solid rgba(212,175,55,0.3)",
                padding: "0 20px",
                gap: 12,
              }}
            >
              <FaSearch size={15} style={{ color: "#d4af37", flexShrink: 0 }} />
              <input
                type="search"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  padding: "14px 0",
                  fontSize: "1rem",
                }}
              />
            </div>
          </form>

          {/* Mobile links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Trang chủ", path: "/" },
              { label: "Sản phẩm", path: "/products" },
              { label: "Ưu đãi", path: "/offers" },
              { label: "Giới thiệu", path: "/about" },
              ...(isAdmin
                ? [{ label: "Quản trị Dashboard", path: "/admin/dashboard" }]
                : []),
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowMobileMenu(false)}
                style={{
                  color: item.label.includes("Quản trị")
                    ? "#f59e0b"
                    : "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                  fontWeight: item.label.includes("Quản trị") ? 700 : 500,
                  padding: "16px 8px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  letterSpacing: "0.5px",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile auth */}
          <div
            style={{
              marginTop: "auto",
              display: "grid",
              gap: 12,
              paddingBottom: 24,
              paddingTop: 20,
            }}
          >
            {isLoggedIn ? (
              <button
                onClick={logout}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#ef4444",
                  borderRadius: 999,
                  padding: "14px 0",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
              >
                Đăng xuất
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  style={{
                    display: "block",
                    background: "linear-gradient(135deg, #d4af37, #f9e297)",
                    color: "#000",
                    borderRadius: 999,
                    padding: "14px 0",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "1rem",
                    textDecoration: "none",
                  }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                  style={{
                    display: "block",
                    border: "1px solid rgba(212,175,55,0.5)",
                    color: "#d4af37",
                    borderRadius: 999,
                    padding: "14px 0",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                  }}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* spacer đã gỡ để header bay lơ lửng trực tiếp trên trang */}
    </>
  );
};

export default Header;
