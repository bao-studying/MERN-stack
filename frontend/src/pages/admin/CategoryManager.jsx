import React, { useState, useEffect, useCallback } from "react";
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
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLayerGroup,
} from "react-icons/fa";
import CategoryModal from "../../components/admin/CategoryModal";
import axiosClient from "../../services/axiosClient";
import "../../assets/styles/admin.css";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- 1. FETCH DATA ---
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/categories", {
        params: { page, limit: 10, search },
      });
      setCategories(res.categories);
      setTotalPages(res.totalPages);
      setTotalDocs(res.totalCategories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCategories(), 500);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  // --- 2. ACTIONS ---
  const handleAdd = () => {
    setSelectedCategory(null); // Null = Thêm mới
    setShowModal(true);
  };

  const handleEdit = (cat) => {
    setSelectedCategory(cat); // Có object = Sửa
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await axiosClient.delete(`/categories/${id}`);
        fetchCategories(); // Reload lại bảng
      } catch {
        alert("Lỗi khi xóa danh mục");
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0" style={{ color: "var(--admin-text)" }}>
            Quản Lý Danh Mục
          </h2>
          <p className="text-muted small m-0">
            <FaLayerGroup className="me-1" />
            Tổng số: {totalDocs} danh mục
          </p>
        </div>
        <Button
          variant="success"
          onClick={handleAdd}
          className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
        >
          <FaPlus /> Thêm Danh Mục
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="table-card p-3 mb-4">
        <Row>
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm danh mục..."
                className="border-start-0 shadow-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </InputGroup>
          </Col>
        </Row>
      </div>

      {/* TABLE */}
      <div className="table-card overflow-hidden">
        <Table hover responsive className="custom-table align-middle mb-0">
          <thead>
            <tr>
              <th className="ps-4">Tên Danh Mục</th>
              <th>Mô Tả</th>
              <th>Trạng Thái</th>
              <th className="text-end pe-4">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                </td>
              </tr>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="bg-light rounded border d-flex align-items-center justify-content-center"
                        style={{ width: 45, height: 45 }}
                      >
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt=""
                            className="w-100 h-100 object-fit-cover rounded"
                          />
                        ) : (
                          <FaLayerGroup className="text-secondary opacity-50" />
                        )}
                      </div>
                      <span className="fw-bold text-dark">{cat.name}</span>
                    </div>
                  </td>
                  <td
                    className="text-muted text-truncate"
                    style={{ maxWidth: "250px" }}
                  >
                    {cat.description || "Không có mô tả"}
                  </td>
                  <td>
                    {cat.isActive ? (
                      <Badge
                        bg="success"
                        className="rounded-pill bg-opacity-75 px-3"
                      >
                        Hiển thị
                      </Badge>
                    ) : (
                      <Badge
                        bg="secondary"
                        className="rounded-pill bg-opacity-75 px-3"
                      >
                        Đã ẩn
                      </Badge>
                    )}
                  </td>
                  <td className="text-end pe-4">
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-pill border shadow-sm text-primary hover-scale me-2"
                      onClick={() => handleEdit(cat)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-pill border shadow-sm text-danger hover-scale"
                      onClick={() => handleDelete(cat._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-5 text-muted">
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-center">
            <Pagination className="eco-pagination mb-0">
              <Pagination.Prev
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === page}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              />
            </Pagination>
          </div>
        )}
      </div>

      {/* MODAL */}
      <CategoryModal
        key={selectedCategory ? selectedCategory._id : "create-new"} // <--- THÊM DÒNG NÀY
        show={showModal}
        handleClose={() => setShowModal(false)}
        category={selectedCategory}
        refreshData={fetchCategories}
      />
    </div>
  );
};

export default CategoryManager;
