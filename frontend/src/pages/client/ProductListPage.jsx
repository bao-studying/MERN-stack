import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Pagination,
  Offcanvas,
  Spinner,
  Form,
  Badge,
} from "react-bootstrap";
import {
  FaFilter,
  FaThLarge,
  FaSearch,
  FaChevronRight,
  FaLeaf,
} from "react-icons/fa";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import ProductFilter from "../../components/product/ProductFilter";
import QuickViewModal from "../../components/product/QuickViewModal";
import productApi from "../../services/product.service";
import "../../assets/styles/products.css";

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "default",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const itemsPerPage = 8;

  // --- LOGIC GIỮ NGUYÊN ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll();
        const productList = response.data || [];
        const formattedProducts = productList.map((item) => ({
          ...item,
          id: item._id,
          price: item.price_cents,
          salePrice: item.compareAtPriceCents || null,
          image:
            item.images?.[0]?.imageUrl ||
            "https://placehold.co/300x300?text=No+Image",
          categoryId: item.categoryId,
          brand: item.brand || "Khác",
        }));
        setAllProducts(formattedProducts);
        const brands = [
          ...new Set(
            formattedProducts
              .map((p) => p.brand)
              .filter((b) => b && b !== "Khác"),
          ),
        ];
        setAvailableBrands(brands);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;
    let result = [...allProducts];
    const catIds = searchParams.getAll("category");
    const brands = searchParams.getAll("brand");
    const prices = searchParams.getAll("price");
    const sort = searchParams.get("sort") || "default";
    const page = parseInt(searchParams.get("page") || "1");
    const searchTerm = searchParams.get("search");

    if (searchTerm)
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    if (catIds.length > 0)
      result = result.filter((p) =>
        catIds.includes(
          String(
            typeof p.categoryId === "object" ? p.categoryId._id : p.categoryId,
          ),
        ),
      );
    if (brands.length > 0)
      result = result.filter((p) => brands.includes(p.brand));
    if (prices.length > 0) {
      result = result.filter((p) =>
        prices.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return p.price >= min && p.price <= max;
        }),
      );
    }
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc")
      result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "name-desc")
      result.sort((a, b) => b.name.localeCompare(a.name));

    setDisplayProducts(result);
    setSortOption(sort);
    setCurrentPage(page);
  }, [searchParams, allProducts]);

  const handleFilterChange = (filters) => {
    const params = {};
    if (sortOption !== "default") params.sort = sortOption;
    if (filters.categoryIds.length > 0) params.category = filters.categoryIds;
    if (filters.brands.length > 0) params.brand = filters.brands;
    if (filters.priceRanges.length > 0) params.price = filters.priceRanges;
    params.page = "1";
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e) => {
    const type = e.target.value;
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("sort", type);
      newParams.set("page", "1");
      return newParams;
    });
  };

  const handleReset = () => {
    setSearchParams({ page: "1" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const paginate = (pageNumber) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", pageNumber);
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

  const initialFilters = useMemo(
    () => ({
      categoryIds: searchParams.getAll("category"),
      brands: searchParams.getAll("brand"),
      priceRanges: searchParams.getAll("price"),
    }),
    [searchParams],
  );

  // --- STYLES ---
  const customStyles = `
    .luxury-page { background: #080808; color: #fff; }
    .hero-banner { 
        height: 400px; 
        background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://lichvietpro.com/images/dc/wallpaper/pokemon/1bPpTfC.jpg');
        background-attachment: fixed;
        display: flex; align-items: center; justify-content: center;
        border-bottom: 1px solid #d4af3733;
    }
    .glass-card { 
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        transition: 0.3s;
    }
    .glass-card:hover { border-color: #d4af37; }
    .text-gold { color: #d4af37; }
    .btn-luxury { 
        background: linear-gradient(45deg, #b8860b, #ffd700); 
        color: #000; border: none; font-weight: 700; border-radius: 30px;
        padding: 10px 25px; transition: 0.3s;
    }
    .btn-luxury:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(212,175,55,0.3); }
    .filter-sidebar { position: sticky; top: 100px; }
    .sort-select { 
        background: #1a1a1a !important; color: #fff !important; 
        border: 1px solid #333 !important; border-radius: 50px !important;
        padding-left: 15px;
    }
    .pagination-luxury .page-link { 
        background: transparent; border: 1px solid #333; color: #fff; 
        margin: 0 5px; border-radius: 10px; width: 45px; height: 45px;
        display: flex; align-items: center; justify-content: center;
    }
    .pagination-luxury .page-item.active .page-link { background: #d4af37; border-color: #d4af37; color: #000; }
    .breadcrumb-item + .breadcrumb-item::before { color: #666; content: "→"; }
    .loading-container { height: 400px; display: flex; align-items: center; justify-content: center; }
  `;

  return (
    <div className="luxury-page min-vh-100 pb-5">
      <style>{customStyles}</style>

      {/* Hero Header Section */}
      <div className="hero-banner mb-5">
        <Container className="text-center">
          <Badge
            bg=""
            className="border border-gold text-gold px-3 py-2 rounded-pill mb-3"
          >
            <FaLeaf className="me-2" /> BỘ SƯU TẬP CAO CẤP 2026
          </Badge>
          <h1
            className="display-3 fw-bold luxury-serif mb-3"
            style={{ letterSpacing: "2px" }}
          >
            HỘP BÀI POKEMON{" "}
          </h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center bg-transparent">
              <li className="breadcrumb-item">
                <Link to="/" className="text-secondary text-decoration-none">
                  Trang chủ
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-gold"
                aria-current="page"
              >
                Sản phẩm
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container>
        <Row className="gy-4">
          {/* Sidebar Filter - Desktop */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="filter-sidebar glass-card p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-gold">
                <FaFilter size={16} /> BỘ LỌC TÌM KIẾM
              </h5>
              <ProductFilter
                onFilter={handleFilterChange}
                onReset={handleReset}
                availableBrands={availableBrands}
                initialFilters={initialFilters}
              />
            </div>
          </Col>

          {/* Main Product List */}
          <Col lg={9}>
            {/* Toolbar */}
            <div className="glass-card p-3 mb-4 d-flex justify-content-between align-items-center border-0 shadow-lg">
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="outline-warning"
                  className="d-lg-none rounded-pill"
                  onClick={() => setShowFilter(true)}
                >
                  <FaFilter /> Lọc
                </Button>
                <div className="text-secondary small d-none d-md-block">
                  Hiển thị{" "}
                  <span className="text-white fw-bold">
                    {currentItems.length}
                  </span>{" "}
                  của {displayProducts.length} tuyệt phẩm
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="position-relative d-none d-sm-block">
                  <FaThLarge className="text-gold me-2" />
                </div>
                <Form.Select
                  size="sm"
                  className="sort-select shadow-none"
                  value={sortOption}
                  onChange={handleSortChange}
                  style={{ width: "200px" }}
                >
                  <option value="default">Sắp xếp: Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A đến Z</option>
                  <option value="name-desc">Tên: Z đến A</option>
                </Form.Select>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="loading-container">
                <Spinner animation="grow" variant="warning" />
              </div>
            ) : (
              <>
                <Row xs={2} md={3} lg={3} xl={4} className="g-4">
                  {currentItems.length > 0 ? (
                    currentItems.map((product) => (
                      <Col key={product.id}>
                        <div className="h-100 transition-all hover-up">
                          <ProductCard
                            product={product}
                            onQuickView={handleQuickView}
                          />
                        </div>
                      </Col>
                    ))
                  ) : (
                    <Col xs={12} className="text-center py-5">
                      <div className="p-5 glass-card">
                        <FaSearch
                          size={50}
                          className="text-muted mb-4 opacity-25"
                        />
                        <h4 className="text-white">Không tìm thấy sản phẩm</h4>
                        <p className="text-secondary mb-4">
                          Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
                        </p>
                        <Button className="btn-luxury" onClick={handleReset}>
                          LÀM MỚI BỘ LỌC
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>

                {/* Pagination Nâng Cấp */}
                {!loading && totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                    <Pagination className="pagination-luxury">
                      <Pagination.Prev
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Mobile Filter Drawer */}
      <Offcanvas
        show={showFilter}
        onHide={() => setShowFilter(false)}
        placement="start"
        className="bg-dark text-white border-end border-gold"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="fw-bold text-gold">
            TÙY CHỌN BỘ LỌC
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ProductFilter
            onFilter={handleFilterChange}
            onReset={handleReset}
            availableBrands={availableBrands}
            initialFilters={initialFilters}
          />
        </Offcanvas.Body>
      </Offcanvas>

      <QuickViewModal
        show={showQuickView}
        handleClose={() => setShowQuickView(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductListPage;
