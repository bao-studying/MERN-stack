import React, { useEffect, useState } from "react";
import { Form, Button, Accordion, Spinner } from "react-bootstrap";
import { FaFilter, FaRedo, FaChevronDown } from "react-icons/fa";
import categoryApi from "../../services/category.service";

const PRICE_RANGES = [
  { label: "Dưới 100k", value: "0-100000" },
  { label: "100k - 300k", value: "100000-300000" },
  { label: "300k - 500k", value: "300000-500000" },
  { label: "Trên 500k", value: "500000-999999999" },
];

const ProductFilter = ({
  onFilter,
  onReset,
  availableBrands = [],
  initialFilters,
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);

  useEffect(() => {
    if (initialFilters) {
      setSelectedCats(initialFilters.categoryIds || []);
      setSelectedBrands(initialFilters.brands || []);
      setSelectedPrices(initialFilters.priceRanges || []);
    }
  }, [initialFilters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll({
          params: { is_active: true },
        });
        const list = response.categories || response.data || [];
        setCategories(list);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const triggerFilter = (newCats, newBrands, newPrices) => {
    onFilter({
      categoryIds: newCats ?? selectedCats,
      brands: newBrands ?? selectedBrands,
      priceRanges: newPrices ?? selectedPrices,
    });
  };

  const handleCatChange = (catId) => {
    const newCats = selectedCats.includes(catId)
      ? selectedCats.filter((id) => id !== catId)
      : [...selectedCats, catId];
    setSelectedCats(newCats);
    triggerFilter(newCats, null, null);
  };

  const handleBrandChange = (brandName) => {
    const newBrands = selectedBrands.includes(brandName)
      ? selectedBrands.filter((b) => b !== brandName)
      : [...selectedBrands, brandName];
    setSelectedBrands(newBrands);
    triggerFilter(null, newBrands, null);
  };

  const handlePriceChange = (rangeValue) => {
    const newPrices = selectedPrices.includes(rangeValue)
      ? selectedPrices.filter((p) => p !== rangeValue)
      : [...selectedPrices, rangeValue];
    setSelectedPrices(newPrices);
    triggerFilter(null, null, newPrices);
  };

  const handleResetFilter = () => {
    setSelectedCats([]);
    setSelectedBrands([]);
    setSelectedPrices([]);
    onReset();
  };

  // --- LUXURY STYLES ---
  const filterStyles = `
    .luxury-accordion .accordion-item {
        background: transparent !important;
        border: none !important;
        margin-bottom: 1rem;
    }
    .luxury-accordion .accordion-button {
        background: rgba(255,255,255,0.03) !important;
        color: #d4af37 !important;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.85rem;
        border-radius: 12px !important;
        border: 1px solid rgba(212, 175, 55, 0.1) !important;
        box-shadow: none !important;
        padding: 1rem;
    }
    .luxury-accordion .accordion-button::after {
        filter: sepia(100%) hue-rotate(10deg) saturate(500%);
    }
    .luxury-accordion .accordion-button:not(.collapsed) {
        border-color: rgba(212, 175, 55, 0.4) !important;
    }
    .luxury-accordion .accordion-body {
        padding: 1.2rem 0.5rem;
    }
    
    /* Custom Luxury Checkbox */
    .luxury-check .form-check-input {
        background-color: transparent;
        border: 1px solid rgba(255,255,255,0.2);
        cursor: pointer;
        transition: 0.3s;
        width: 1.1em;
        height: 1.1em;
    }
    .luxury-check .form-check-input:checked {
        background-color: #d4af37;
        border-color: #d4af37;
        box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
    }
    .luxury-check .form-check-label {
        color: rgba(255,255,255,0.7);
        font-size: 0.95rem;
        cursor: pointer;
        transition: 0.3s;
    }
    .luxury-check:hover .form-check-label {
        color: #fff;
    }
    .btn-reset-luxury {
        color: #666;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: 0.3s;
    }
    .btn-reset-luxury:hover {
        color: #d4af37;
    }
  `;

  return (
    <div className="filter-container">
      <style>{filterStyles}</style>

      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2">
          <FaFilter className="text-gold" />
          <h6 className="fw-bold m-0 text-white luxury-serif">BỘ LỌC</h6>
        </div>
        <Button
          variant="link"
          className="btn-reset-luxury text-decoration-none p-0"
          onClick={handleResetFilter}
        >
          <FaRedo className="me-1" size={10} /> Làm mới
        </Button>
      </div>

      <Accordion
        defaultActiveKey={["0", "1", "2"]}
        alwaysOpen
        className="luxury-accordion"
      >
        {/* DANH MỤC */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Danh Mục</Accordion.Header>
          <Accordion.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="warning" size="sm" />
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Form.Check
                      key={cat._id}
                      type="checkbox"
                      id={`cat-${cat._id}`}
                      label={cat.name}
                      checked={selectedCats.includes(cat._id)}
                      onChange={() => handleCatChange(cat._id)}
                      className="luxury-check"
                    />
                  ))
                ) : (
                  <p className="text-muted small italic">Đang cập nhật...</p>
                )}
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* KHOẢNG GIÁ */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Khoảng Giá</Accordion.Header>
          <Accordion.Body>
            <div className="d-flex flex-column gap-2">
              {PRICE_RANGES.map((range, idx) => (
                <Form.Check
                  key={idx}
                  type="checkbox"
                  id={`price-${idx}`}
                  label={range.label}
                  checked={selectedPrices.includes(range.value)}
                  onChange={() => handlePriceChange(range.value)}
                  className="luxury-check"
                />
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* THƯƠNG HIỆU */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Thương Hiệu</Accordion.Header>
          <Accordion.Body>
            <div className="d-flex flex-column gap-2">
              {availableBrands.length > 0 ? (
                availableBrands.map((brand, idx) => (
                  <Form.Check
                    key={idx}
                    type="checkbox"
                    id={`brand-${idx}`}
                    label={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="luxury-check"
                  />
                ))
              ) : (
                <p className="text-muted small italic">Chưa có thương hiệu</p>
              )}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ProductFilter;
