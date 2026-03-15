import React, { useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Form,
  Button,
  Badge,
  Dropdown,
  Offcanvas,
} from "react-bootstrap";
import {
  FaShoppingCart,
  FaUserCircle,
  FaSearch,
  FaCrown,
  FaBars,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaBoxOpen,
  FaGem,
} from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { IoFootball } from "react-icons/io5"; // IoFootball có hình dạng rất giống Poké Ball

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user?.role === "admin"; // ← kiểm tra role admin

  const userAvatar = user?.avatarUrl;
  const userName = user?.name || "User";

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowMobileMenu(false);
      setSearchTerm("");
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        className="sticky-top py-3"
        style={{
          zIndex: 1020,
          backgroundColor: "#0a0a0a",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container style={{ padding: 0 }}>
          {/* LOGO */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="fw-bold fs-3 d-flex align-items-center gap-2 me-lg-5 luxury-serif"
          >
            <div
              className="p-2 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                background: "linear-gradient(135deg, #d4af37, #f9e297)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "32px",
                  height: "32px",
                }}
              >
                {/* Nửa trên màu đỏ */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "50%",
                    backgroundColor: "#FF0000",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    border: "2px solid #000",
                    borderBottom: "1px solid #000", // Đường kẻ ngang ở giữa
                  }}
                ></div>

                {/* Nửa dưới màu trắng */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "50%",
                    backgroundColor: "#fff",
                    borderBottomLeftRadius: "16px",
                    borderBottomRightRadius: "16px",
                    border: "2px solid #000",
                    borderTop: "none",
                  }}
                ></div>

                {/* Vòng tròn nút bấm ở giữa */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    border: "2px solid #000",
                    zIndex: 2,
                  }}
                ></div>
              </div>{" "}
            </div>
            <span style={{ color: "#d4af37", letterSpacing: "1px" }}>
              BAO Po_Box
            </span>
          </Navbar.Brand>

          {/* MOBILE BUTTONS */}
          <div className="d-flex align-items-center gap-3 d-lg-none ms-auto">
            <Link to="/cart" className="position-relative text-gold">
              <FaShoppingCart size={22} />
              {isLoggedIn && cartCount > 0 && (
                <Badge
                  bg="warning"
                  pill
                  className="position-absolute top-0 start-100 translate-middle text-dark fw-bold"
                  style={{ fontSize: "0.6rem" }}
                >
                  {cartCount}
                </Badge>
              )}
            </Link>
            <Button
              variant="link"
              className="text-gold border-0 p-0"
              onClick={() => setShowMobileMenu(true)}
            >
              <FaBars size={24} />
            </Button>
          </div>

          <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex">
            {/* SEARCH BAR */}
            <div
              className="mx-auto w-100 px-lg-5"
              style={{ maxWidth: "500px" }}
            >
              <Form
                className="d-flex position-relative w-100"
                onSubmit={handleSearch}
              >
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm vật phẩm hiếm..."
                  className="border-0 py-2 ps-4 pe-5 text-white"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    borderRadius: "25px",
                    fontSize: "0.9rem",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="link"
                  className="position-absolute top-50 end-0 translate-middle-y text-gold pe-3"
                >
                  <FaSearch />
                </Button>
              </Form>
            </div>

            <div className="d-flex align-items-center gap-4">
              <Nav
                className="d-flex gap-4 fw-medium text-uppercase"
                style={{ fontSize: "0.8rem", letterSpacing: "1.5px" }}
              >
                {[
                  { path: "/", label: "Trang chủ" },
                  { path: "/products", label: "Sản phẩm" },
                  { path: "/offers", label: "Ưu đãi" },
                  { path: "/about", label: "Về chúng tôi" },
                  ...(isAdmin ? [{ path: "/admin", label: "Dashboard" }] : []),
                ].map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      isActive
                        ? "text-gold text-decoration-none fw-bold border-bottom border-gold pb-1"
                        : "text-white text-decoration-none opacity-75 hover-gold pb-1 transition-all"
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </Nav>

              <div
                className="vr bg-gold opacity-25 mx-2"
                style={{ height: "25px" }}
              ></div>

              {/* USER & CART */}
              <div className="d-flex align-items-center gap-3">
                <Link
                  to="/cart"
                  className="position-relative d-flex align-items-center justify-content-center text-gold cart-hover"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  <FaShoppingCart size={18} />
                  {isLoggedIn && cartCount > 0 && (
                    <Badge
                      bg="warning"
                      pill
                      className="position-absolute top-0 start-100 translate-middle text-dark"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  )}
                </Link>

                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="transparent"
                    className="p-0 border-0 after-none"
                  >
                    <div
                      className="d-flex align-items-center justify-content-center border overflow-hidden user-avatar-frame"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        borderColor: "rgba(212,175,55,0.5)",
                      }}
                    >
                      {isLoggedIn && userAvatar ? (
                        <img
                          src={userAvatar}
                          alt="User"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <FaUserCircle size={24} className="text-gold" />
                      )}
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="border-0 shadow-lg p-2 mt-3 animate-slide-up"
                    style={{
                      minWidth: "240px",
                      backgroundColor: "#141414",
                      border: "1px solid #2a2a2a",
                    }}
                  >
                    {isLoggedIn ? (
                      <>
                        <div className="px-3 py-2 border-bottom border-secondary mb-2">
                          <div className="fw-bold text-gold">
                            Chào {userName}
                          </div>
                          <small className="text-muted">{user?.email}</small>
                          {isAdmin && (
                            <Badge bg="danger" className="mt-1">
                              Admin
                            </Badge>
                          )}
                        </div>

                        <Dropdown.Item
                          as={Link}
                          to="/profile"
                          className="text-white py-2 hover-dark-gold"
                        >
                          <FaUserCircle className="me-2 text-gold" /> Tài khoản
                        </Dropdown.Item>

                        {isAdmin && (
                          <Dropdown.Item
                            as={Link}
                            to="/admin"
                            className="text-warning py-2 hover-dark-gold fw-semibold"
                          >
                            <FaCrown className="me-2" /> Quản trị
                          </Dropdown.Item>
                        )}

                        <Dropdown.Item
                          as={Link}
                          to="/profile?tab=orders"
                          className="text-white py-2 hover-dark-gold"
                        >
                          <FaBoxOpen className="me-2 text-gold" /> Đơn mua
                        </Dropdown.Item>

                        <Dropdown.Divider className="bg-secondary" />

                        <Dropdown.Item
                          onClick={logout}
                          className="text-danger py-2 fw-bold"
                        >
                          <FaSignOutAlt className="me-2" /> Đăng xuất
                        </Dropdown.Item>
                      </>
                    ) : (
                      <div className="p-3 d-grid gap-2">
                        <Button
                          as={Link}
                          to="/login"
                          variant="warning"
                          className="fw-bold rounded-pill text-dark"
                        >
                          Đăng nhập
                        </Button>
                        <Button
                          as={Link}
                          to="/register"
                          variant="outline-warning"
                          className="fw-bold rounded-pill"
                        >
                          Đăng ký
                        </Button>
                      </div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* MOBILE MENU */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        style={{ backgroundColor: "#0a0a0a", color: "#fff" }}
      >
        <Offcanvas.Header
          closeButton
          closeVariant="white"
          className="border-bottom border-secondary"
        >
          <Offcanvas.Title className="fw-bold text-gold luxury-serif">
            MENU
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column px-4">
          <Form className="mb-4 mt-2" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Tìm kiếm..."
              className="bg-dark border-secondary text-white rounded-pill py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>

          <Nav className="flex-column gap-3 fs-5">
            {[
              { label: "Trang chủ", path: "/" },
              { label: "Sản phẩm", path: "/products" },
              { label: "Ưu đãi", path: "/offers" },
              { label: "Giới thiệu", path: "/about" },
              ...(isAdmin
                ? [{ label: "Quản trị", path: "/admin/dashboard" }]
                : []),
            ].map((item, idx) => (
              <Nav.Link
                key={idx}
                as={Link}
                to={item.path}
                onClick={() => setShowMobileMenu(false)}
                className={`border-bottom border-secondary pb-2 opacity-75 ${
                  item.label === "Quản trị"
                    ? "text-warning fw-bold"
                    : "text-white"
                }`}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="mt-auto mb-4 d-grid gap-3">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Button
                    as={Link}
                    to="/admin/dashboard"
                    variant="outline-warning"
                    className="rounded-pill fw-bold"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Quản trị Dashboard
                  </Button>
                )}
                <Button
                  variant="outline-warning"
                  onClick={logout}
                  className="rounded-pill"
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="warning"
                  className="rounded-pill fw-bold text-dark"
                >
                  Đăng nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="outline-warning"
                  className="rounded-pill"
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Header;
