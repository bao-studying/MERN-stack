import React, { useState, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Nav,
  Tab,
} from "react-bootstrap";
import {
  FaSave,
  FaTimes,
  FaDollarSign,
  FaBoxOpen,
  FaImage,
  FaCloudUploadAlt,
  FaTag,
  FaBarcode,
  FaWeightHanging,
  FaTrash,
  FaPlus,
  FaLayerGroup,
} from "react-icons/fa";
import imageCompression from "browser-image-compression";

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES — scoped to .pmm-root, never bleeds into host app
───────────────────────────────────────────────────────────────────────────── */
const MODAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  /* ── reset bootstrap modal shell ── */
  .pmm-eco-modal .modal-dialog { max-width: 740px; margin: auto; }
  .pmm-eco-modal .modal-content {
    border-radius: 16px !important;
    border: 1px solid #e2ded6 !important;
    box-shadow: 0 4px 6px rgba(0,0,0,.04), 0 16px 48px rgba(0,0,0,.12) !important;
    overflow: hidden;
    padding: 0 !important;
  }
  .pmm-eco-modal .modal-header,
  .pmm-eco-modal .modal-body,
  .pmm-eco-modal .modal-footer {
    border: none !important;
    padding: 0 !important;
    background: transparent !important;
    margin: 0 !important;
  }

  /* ── CSS VARS ── */
  .pmm-root {
    --c-bg:      #f5f3ef;
    --c-surf:    #ffffff;
    --c-border:  #e2ded6;
    --c-accent:  #c8490c;
    --c-green:   #1a6b3c;
    --c-text:    #1c1917;
    --c-muted:   #78716c;
    --c-subtle:  #a8a29e;
    --c-info:    #1d4ed8;
    --c-r:       9px;
    --c-font:    'DM Sans', sans-serif;
    --c-mono:    'DM Mono', monospace;
    font-family: var(--c-font);
    background: var(--c-surf);
    display: flex;
    flex-direction: column;
  }

  /* ══════════════════════ HEADER ══════════════════════ */
  .pmm-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 22px;
    border-bottom: 1px solid var(--c-border);
    background: var(--c-surf);
  }
  .pmm-header-pip {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--c-accent);
    flex-shrink: 0;
  }
  .pmm-header-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--c-text);
    letter-spacing: -.25px;
    margin: 0;
    flex: 1;
  }
  .pmm-header-pill {
    font-size: 10px;
    font-family: var(--c-mono);
    font-weight: 500;
    letter-spacing: .5px;
    padding: 2px 8px;
    border-radius: 20px;
    border: 1px solid var(--c-border);
    color: var(--c-muted);
    background: var(--c-bg);
  }
  .pmm-xbtn {
    width: 28px; height: 28px;
    border-radius: 7px;
    border: 1px solid var(--c-border);
    background: transparent;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: var(--c-muted);
    transition: background .12s, color .12s, border-color .12s;
  }
  .pmm-xbtn:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

  /* ══════════════════════ BODY — two columns ══════════════════════ */
  .pmm-body {
    display: flex;
    min-height: 0;
    max-height: calc(100vh - 180px);
  }

  /* ── LEFT col: images ── */
  .pmm-img-col {
    width: 210px;
    flex-shrink: 0;
    border-right: 1px solid var(--c-border);
    background: var(--c-bg);
    display: flex;
    flex-direction: column;
    padding: 18px 14px;
    gap: 12px;
    overflow-y: auto;
  }
  .pmm-img-col::-webkit-scrollbar { width: 3px; }
  .pmm-img-col::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 2px; }

  .pmm-col-heading {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .6px;
    text-transform: uppercase;
    color: var(--c-subtle);
    margin: 0;
  }

  /* thumbs */
  .pmm-thumbs { display: flex; flex-direction: column; gap: 7px; }
  .pmm-thumb {
    position: relative;
    border-radius: 9px;
    overflow: hidden;
    border: 1px solid var(--c-border);
    aspect-ratio: 3/2;
    background: var(--c-surf);
  }
  .pmm-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pmm-thumb-del {
    position: absolute; top: 5px; right: 5px;
    width: 20px; height: 20px;
    border-radius: 5px;
    background: rgba(220,38,38,.88);
    border: none; color: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 9px;
    opacity: 0;
    transition: opacity .12s;
  }
  .pmm-thumb:hover .pmm-thumb-del { opacity: 1; }
  .pmm-thumb-empty {
    border: 1.5px dashed var(--c-border);
    border-radius: 9px;
    aspect-ratio: 3/2;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--c-subtle);
    background: var(--c-surf);
  }

  .pmm-img-counter {
    font-size: 10px;
    font-family: var(--c-mono);
    color: var(--c-muted);
    text-align: center;
  }

  /* tab pills */
  .pmm-pills {
    display: flex;
    gap: 3px;
    background: var(--c-surf);
    border-radius: 7px;
    padding: 3px;
    border: 1px solid var(--c-border);
  }
  .pmm-pill {
    flex: 1;
    padding: 5px 0;
    font-size: 11px;
    font-weight: 500;
    font-family: var(--c-font);
    border: none;
    border-radius: 5px;
    background: transparent;
    color: var(--c-muted);
    cursor: pointer;
    transition: background .12s, color .12s;
  }
  .pmm-pill.on { background: var(--c-accent); color: #fff; }

  /* url input */
  .pmm-url-inp {
    width: 100%;
    padding: 7px 9px;
    border: 1px solid var(--c-border);
    border-radius: 7px;
    font-size: 11.5px;
    font-family: var(--c-font);
    color: var(--c-text);
    background: var(--c-surf);
    outline: none;
    transition: border-color .15s;
  }
  .pmm-url-inp:focus { border-color: var(--c-accent); }
  .pmm-url-addbtn {
    width: 100%;
    padding: 7px;
    border-radius: 7px;
    border: 1px solid var(--c-border);
    background: var(--c-surf);
    font-size: 11.5px;
    font-weight: 500;
    font-family: var(--c-font);
    color: var(--c-text);
    cursor: pointer;
    transition: background .12s, border-color .12s, color .12s;
  }
  .pmm-url-addbtn:hover:not(:disabled) { border-color: var(--c-accent); color: var(--c-accent); background: #fff8f5; }
  .pmm-url-addbtn:disabled { opacity: .38; cursor: not-allowed; }

  /* drop zone */
  .pmm-dropzone {
    border: 1.5px dashed var(--c-border);
    border-radius: 9px;
    padding: 14px 8px;
    text-align: center;
    cursor: pointer;
    transition: border-color .15s, background .15s;
    background: var(--c-surf);
  }
  .pmm-dropzone:hover { border-color: var(--c-accent); background: #fff8f5; }
  .pmm-dropzone svg { font-size: 18px; color: var(--c-accent); display: block; margin: 0 auto 5px; }
  .pmm-dropzone-txt { font-size: 11px; font-weight: 500; color: var(--c-muted); line-height: 1.45; }

  .pmm-hint { font-size: 10.5px; color: var(--c-subtle); margin: 0; line-height: 1.4; }

  /* ── RIGHT col: form ── */
  .pmm-form-col {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 18px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .pmm-form-col::-webkit-scrollbar { width: 3px; }
  .pmm-form-col::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 2px; }

  /* section */
  .pmm-section-hd {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .6px;
    text-transform: uppercase;
    color: var(--c-subtle);
    margin: 0 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--c-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* field grid */
  .pmm-grid { display: grid; gap: 9px; }
  .pmm-grid-2 { grid-template-columns: 1fr 1fr; }
  .pmm-grid-1 { grid-template-columns: 1fr; }

  /* field */
  .pmm-field { display: flex; flex-direction: column; gap: 4px; }
  .pmm-lbl {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--c-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
  }
  .pmm-req { color: var(--c-accent); }

  /* inputs */
  .pmm-inp {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--c-border);
    border-radius: 7px;
    font-size: 13px;
    font-family: var(--c-font);
    color: var(--c-text);
    background: var(--c-bg);
    outline: none;
    transition: border-color .15s, background .15s;
    -webkit-appearance: none;
    appearance: none;
  }
  .pmm-inp:focus { border-color: var(--c-accent); background: #fff; }
  .pmm-inp:disabled { color: var(--c-subtle); cursor: not-allowed; }

  .pmm-icon-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--c-border);
    border-radius: 7px;
    background: var(--c-bg);
    overflow: hidden;
    transition: border-color .15s, background .15s;
  }
  .pmm-icon-wrap:focus-within { border-color: var(--c-accent); background: #fff; }
  .pmm-icon-pfx {
    padding: 0 9px;
    color: var(--c-subtle);
    font-size: 11px;
    flex-shrink: 0;
    pointer-events: none;
  }
  .pmm-icon-wrap .pmm-inp {
    border: none !important;
    background: transparent !important;
    padding-left: 0;
    border-radius: 0;
  }
  .pmm-icon-wrap .pmm-inp:focus { background: transparent !important; }

  .pmm-sel {
    width: 100%;
    padding: 8px 26px 8px 10px;
    border: 1px solid var(--c-border);
    border-radius: 7px;
    font-size: 13px;
    font-family: var(--c-font);
    color: var(--c-text);
    background: var(--c-bg);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='6'%3E%3Cpath d='M0 0l4.5 6L9 0z' fill='%2378716c'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 9px center;
    appearance: none;
    -webkit-appearance: none;
    outline: none;
    cursor: pointer;
    transition: border-color .15s;
  }
  .pmm-sel:focus { border-color: var(--c-accent); }

  .pmm-textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--c-border);
    border-radius: 7px;
    font-size: 13px;
    font-family: var(--c-font);
    color: var(--c-text);
    background: var(--c-bg);
    outline: none;
    resize: vertical;
    min-height: 70px;
    line-height: 1.6;
    transition: border-color .15s, background .15s;
  }
  .pmm-textarea:focus { border-color: var(--c-accent); background: #fff; }

  .pmm-toggle-link {
    font-size: 11px;
    color: var(--c-accent);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--c-font);
    font-weight: 500;
  }
  .pmm-toggle-link:hover { text-decoration: underline; }

  /* ══════════════════════ VARIANTS ══════════════════════ */
  .pmm-variant-card {
    border: 1px solid var(--c-border);
    border-radius: 9px;
    background: var(--c-bg);
    padding: 12px;
    margin-bottom: 10px;
    position: relative;
  }
  .pmm-variant-card:last-child { margin-bottom: 0; }
  .pmm-variant-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .pmm-variant-tag {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--c-accent);
    background: rgba(200,73,12,.08);
    border: 1px solid rgba(200,73,12,.2);
    border-radius: 20px;
    padding: 2px 9px;
    font-family: var(--c-mono);
  }
  .pmm-variant-del {
    width: 24px; height: 24px;
    border-radius: 6px;
    border: 1px solid var(--c-border);
    background: var(--c-surf);
    color: var(--c-muted);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 10px;
    transition: background .12s, color .12s, border-color .12s;
  }
  .pmm-variant-del:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
  .pmm-variant-del:disabled { opacity: .3; cursor: not-allowed; }

  .pmm-attr-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
  .pmm-attr-row { display: flex; gap: 6px; align-items: center; }
  .pmm-attr-inp {
    padding: 6px 8px;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    font-size: 12px;
    font-family: var(--c-font);
    color: var(--c-text);
    background: var(--c-surf);
    outline: none;
    transition: border-color .15s;
  }
  .pmm-attr-inp:focus { border-color: var(--c-accent); }
  .pmm-attr-key { flex: 0 0 38%; }
  .pmm-attr-val { flex: 1; }
  .pmm-attr-del {
    width: 22px; height: 22px;
    border-radius: 5px;
    border: 1px solid var(--c-border);
    background: var(--c-surf);
    color: var(--c-subtle);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 9px;
    flex-shrink: 0;
    transition: background .12s, color .12s, border-color .12s;
  }
  .pmm-attr-del:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

  .pmm-attr-addbtn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    color: var(--c-muted);
    background: var(--c-surf);
    border: 1px dashed var(--c-border);
    border-radius: 6px;
    padding: 5px 10px;
    cursor: pointer;
    transition: border-color .12s, color .12s;
  }
  .pmm-attr-addbtn:hover { border-color: var(--c-accent); color: var(--c-accent); }

  .pmm-variant-name-preview {
    font-size: 11.5px;
    color: var(--c-muted);
    margin-bottom: 8px;
    padding: 5px 9px;
    background: var(--c-surf);
    border-radius: 6px;
    border: 1px solid var(--c-border);
  }
  .pmm-variant-name-preview b { color: var(--c-text); font-weight: 600; }

  .pmm-sku-preview {
    font-family: var(--c-mono);
    font-size: 10.5px;
    color: var(--c-subtle);
  }

  .pmm-add-variant-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px;
    border-radius: 8px;
    border: 1.5px dashed var(--c-border);
    background: var(--c-surf);
    color: var(--c-muted);
    font-size: 12.5px;
    font-weight: 500;
    font-family: var(--c-font);
    cursor: pointer;
    transition: border-color .15s, color .15s, background .15s;
  }
  .pmm-add-variant-btn:hover { border-color: var(--c-accent); color: var(--c-accent); background: #fff8f5; }

  .pmm-variant-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11.5px;
    color: var(--c-muted);
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--c-border);
  }
  .pmm-variant-total b { color: var(--c-green); font-family: var(--c-mono); font-size: 13px; }

  /* ══════════════════════ FOOTER ══════════════════════ */
  .pmm-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 13px 22px;
    border-top: 1px solid var(--c-border);
    background: var(--c-surf);
  }
  .pmm-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--c-font);
    cursor: pointer;
    transition: background .15s, transform .1s;
    border: 1px solid transparent;
  }
  .pmm-btn:active { transform: scale(.98); }
  .pmm-btn-ghost {
    background: transparent;
    border-color: var(--c-border);
    color: var(--c-muted);
  }
  .pmm-btn-ghost:hover { background: var(--c-bg); color: var(--c-text); }
  .pmm-btn-primary {
    background: var(--c-green);
    color: #fff;
    border-color: var(--c-green);
  }
  .pmm-btn-primary:hover { background: #145c31; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

// Tạo 1 id tạm cho biến thể mới (chỉ dùng để React key + thao tác UI,
// không gửi lên backend — backend tự sinh _id và SKU thật)
let tempIdCounter = 0;
const makeTempId = () => `tmp-${Date.now()}-${tempIdCounter++}`;

// Biến thể trống mặc định: 1 cặp attribute trống để user điền ngay
const createEmptyVariant = () => ({
  _tempId: makeTempId(),
  attributes: [{ key: "", value: "" }],
  price_cents: "",
  stock: "",
});

// Ghép tên hiển thị (preview) từ danh sách attributes — giống logic backend
const buildVariantNamePreview = (attributes) => {
  const parts = attributes
    .filter((a) => a.key.trim() && a.value.trim())
    .map((a) => `${a.key.trim()}: ${a.value.trim()}`);
  return parts.length > 0 ? parts.join(", ") : null;
};

// Chuyển attributes dạng [{key,value}] (UI) -> object {key: value} (gửi backend)
const attributesArrayToObject = (attributes) => {
  const obj = {};
  attributes.forEach((a) => {
    if (a.key.trim()) obj[a.key.trim()] = a.value.trim();
  });
  return obj;
};

// Chuyển object {key: value} (từ backend) -> [{key,value}] (UI)
const attributesObjectToArray = (attrObj) => {
  if (!attrObj || typeof attrObj !== "object") return [{ key: "", value: "" }];
  const entries = Object.entries(attrObj).map(([key, value]) => ({
    key,
    value: String(value ?? ""),
  }));
  return entries.length > 0 ? entries : [{ key: "", value: "" }];
};

/* ─────────────────────────────────────────────────────────────────────────────
   DEFAULT_VALUES
───────────────────────────────────────────────────────────────────────────── */
const DEFAULT_VALUES = {
  name: "",
  category: "",
  brand: "",
  price_cents: "",
  description: "",
  images: [],
  variants: [createEmptyVariant()],
};

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const ProductModal = ({
  show,
  handleClose,
  product,
  onSave,
  categories = [],
  availableBrands = [],
}) => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("url");
  const [tempUrl, setTempUrl] = useState("");

  const getCategoryId = (prod) => {
    if (!prod || !prod.categoryId) return "";
    return typeof prod.categoryId === "object"
      ? prod.categoryId._id
      : prod.categoryId;
  };

  const [formData, setFormData] = useState(() => {
    if (product) {
      const existingImages =
        product.images?.map((img) => ({
          url: img.imageUrl,
          preview: img.imageUrl || "https://placehold.co/300x300?text=No+Image",
        })) || [];

      // Map các biến thể đã có (từ DB) sang format UI (_tempId + attributes dạng array)
      const existingVariants =
        product.variants?.length > 0
          ? product.variants.map((v) => ({
              _tempId: makeTempId(),
              _id: v._id, // giữ lại _id thật nếu là biến thể cũ (để backend biết là update, không phải tạo mới)
              sku: v.sku || "",
              attributes: attributesObjectToArray(v.attributes),
              price_cents: v.price_cents ?? "",
              stock: v.stock ?? "",
            }))
          : [createEmptyVariant()];

      return {
        id: product._id || product.id,
        name: product.name,
        category: getCategoryId(product),
        brand:
          product.brand && typeof product.brand === "object"
            ? product.brand._id
            : product.brand || "",
        price_cents: product.price_cents,
        description: product.description || "",
        images: existingImages.slice(0, 3),
        variants: existingVariants,
      };
    }
    return DEFAULT_VALUES;
  });

  /* ── basic field handlers ── */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ── image handlers (unchanged) ── */
  const handleAddUrl = () => {
    if (tempUrl && formData.images.length < 3) {
      const newImage = {
        url: tempUrl,
        preview: tempUrl || "https://placehold.co/300x300?text=No+Image",
      };
      setFormData({ ...formData, images: [...formData.images, newImage] });
      setTempUrl("");
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];

    for (const file of files) {
      if (formData.images.length + newImages.length < 3) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);

          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push({
              url: reader.result,
              preview: reader.result,
            });

            if (newImages.length === files.length) {
              setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...newImages],
              }));
            }
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error("Compress error:", error);
        }
      }
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  /* ── VARIANT handlers ── */
  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  };

  const handleRemoveVariant = (tempId) => {
    setFormData((prev) => {
      if (prev.variants.length <= 1) return prev; // luôn giữ ít nhất 1 biến thể
      return {
        ...prev,
        variants: prev.variants.filter((v) => v._tempId !== tempId),
      };
    });
  };

  const handleVariantFieldChange = (tempId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v._tempId === tempId ? { ...v, [field]: value } : v,
      ),
    }));
  };

  const handleAddAttribute = (tempId) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v._tempId === tempId
          ? { ...v, attributes: [...v.attributes, { key: "", value: "" }] }
          : v,
      ),
    }));
  };

  const handleRemoveAttribute = (tempId, attrIndex) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v._tempId !== tempId) return v;
        const newAttrs = v.attributes.filter((_, i) => i !== attrIndex);
        // luôn giữ ít nhất 1 dòng attribute để user có thể nhập lại
        return {
          ...v,
          attributes: newAttrs.length > 0 ? newAttrs : [{ key: "", value: "" }],
        };
      }),
    }));
  };

  const handleAttributeChange = (tempId, attrIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v._tempId !== tempId) return v;
        const newAttrs = v.attributes.map((a, i) =>
          i === attrIndex ? { ...a, [field]: value } : a,
        );
        return { ...v, attributes: newAttrs };
      }),
    }));
  };

  // Tổng stock hiển thị live trong modal (chỉ để người dùng xem trước —
  // giá trị THẬT SỰ lưu trong DB luôn được backend tính lại khi save)
  const totalStockPreview = formData.variants.reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0,
  );

  /* ── SUBMIT ── */
  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.brand) {
      alert("Vui lòng điền tên, danh mục và thương hiệu!");
      return;
    }

    const hasInvalidVariant = formData.variants.some(
      (v) => !v.price_cents || Number(v.price_cents) <= 0,
    );
    if (hasInvalidVariant) {
      alert("Vui lòng nhập giá bán cho tất cả các biến thể!");
      return;
    }

    // Chuyển variants từ format UI -> format gửi backend
    // Lưu ý: KHÔNG gửi field "sku" tự nhập — để backend tự sinh nếu thiếu,
    // trừ khi đây là biến thể cũ đã có sku sẵn (giữ nguyên để không đổi SKU mỗi lần sửa)
    const variantsPayload = formData.variants.map((v) => ({
      ...(v._id ? { _id: v._id } : {}),
      sku: v.sku || undefined,
      attributes: attributesArrayToObject(v.attributes),
      price_cents: Number(v.price_cents) || 0,
      stock: Number(v.stock) || 0,
    }));

    const payload = {
      name: formData.name,
      categoryId: formData.category,
      brand: formData.brand,
      description: formData.description,
      images: formData.images.map((img) => ({ imageUrl: img.url })),
      variants: variantsPayload,
    };
    if (formData.id) payload.id = formData.id;
    onSave(payload);
  };

  /* ── RENDER ── */
  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      className="eco-modal pmm-eco-modal"
      scrollable
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Body>
          <Modal.Footer>
            <style dangerouslySetInnerHTML={{ __html: MODAL_STYLES }} />

            <div className="pmm-root">
              {/* ════════ HEADER ════════ */}
              <div className="pmm-header">
                <div className="pmm-header-pip" />
                <p className="pmm-header-title">
                  {product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                </p>
                <span className="pmm-header-pill">
                  {product ? "EDIT" : "NEW"}
                </span>
                <button className="pmm-xbtn" onClick={handleClose} title="Đóng">
                  <FaTimes />
                </button>
              </div>

              {/* ════════ BODY ════════ */}
              <div className="pmm-body">
                {/* ── LEFT: images ── */}
                <div className="pmm-img-col">
                  <p className="pmm-col-heading">Hình ảnh</p>

                  <div className="pmm-thumbs">
                    {formData.images.map((img, index) => (
                      <div key={index} className="pmm-thumb">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/300x300?text=No+Image")
                          }
                        />
                        <button
                          className="pmm-thumb-del"
                          onClick={() => handleRemoveImage(index)}
                          title="Xóa ảnh"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {formData.images.length === 0 && (
                      <div className="pmm-thumb-empty">Chưa có ảnh</div>
                    )}
                  </div>

                  <div className="pmm-img-counter">
                    {formData.images.length} / 3 ảnh
                  </div>

                  <div className="pmm-pills">
                    <button
                      className={`pmm-pill ${activeTab === "url" ? "on" : ""}`}
                      onClick={() => setActiveTab("url")}
                    >
                      Link URL
                    </button>
                    <button
                      className={`pmm-pill ${activeTab === "file" ? "on" : ""}`}
                      onClick={() => setActiveTab("file")}
                    >
                      Tải lên
                    </button>
                  </div>

                  {activeTab === "url" ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <input
                        className="pmm-url-inp"
                        type="text"
                        placeholder="Dán link ảnh..."
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                      />
                      <button
                        className="pmm-url-addbtn"
                        onClick={handleAddUrl}
                        disabled={formData.images.length >= 3 || !tempUrl}
                      >
                        + Thêm URL
                      </button>
                      <p className="pmm-hint">Dùng link ảnh từ internet</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        className="pmm-dropzone"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <FaCloudUploadAlt />
                        <div className="pmm-dropzone-txt">
                          Chọn ảnh từ máy
                          <br />
                          (chọn nhiều file)
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                        />
                      </div>
                      <p className="pmm-hint" style={{ textAlign: "center" }}>
                        Ảnh sẽ được nén. Tối đa 3 hình.
                      </p>
                    </div>
                  )}
                </div>

                {/* ── RIGHT: form ── */}
                <div className="pmm-form-col">
                  {/* Section 1: Thông tin cơ bản */}
                  <div>
                    <p className="pmm-section-hd">Thông tin cơ bản</p>
                    <div
                      className="pmm-grid pmm-grid-1"
                      style={{ marginBottom: 9 }}
                    >
                      <div className="pmm-field">
                        <label className="pmm-lbl">
                          Tên sản phẩm
                          <span className="pmm-req">*</span>
                        </label>
                        <input
                          className="pmm-inp"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Nhập tên sản phẩm..."
                        />
                      </div>
                    </div>
                    <div className="pmm-grid pmm-grid-2">
                      <div className="pmm-field">
                        <label className="pmm-lbl">
                          Danh mục
                          <span className="pmm-req">*</span>
                        </label>
                        <select
                          className="pmm-sel"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="">-- Chọn danh mục --</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pmm-field">
                        <label className="pmm-lbl">
                          Thương hiệu <span className="pmm-req">*</span>
                        </label>
                        <select
                          className="pmm-sel"
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                        >
                          <option value="">-- Chọn thương hiệu --</option>
                          {availableBrands.map((brand) => (
                            <option key={brand._id} value={brand._id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                        {availableBrands.length === 0 && (
                          <small className="text-muted d-block mt-2">
                            Chưa có thương hiệu. Vui lòng thêm thương hiệu
                            trước.
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Biến thể */}
                  <div>
                    <p className="pmm-section-hd">
                      <span>Biến thể & kho hàng</span>
                      <FaLayerGroup style={{ fontSize: 11, opacity: 0.6 }} />
                    </p>

                    {formData.variants.map((variant, vIdx) => {
                      const namePreview = buildVariantNamePreview(
                        variant.attributes,
                      );
                      return (
                        <div className="pmm-variant-card" key={variant._tempId}>
                          <div className="pmm-variant-head">
                            <span className="pmm-variant-tag">
                              Biến thể #{vIdx + 1}
                            </span>
                            <button
                              className="pmm-variant-del"
                              onClick={() =>
                                handleRemoveVariant(variant._tempId)
                              }
                              disabled={formData.variants.length <= 1}
                              title="Xóa biến thể này"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          {/* Preview tên ghép từ attributes */}
                          <div className="pmm-variant-name-preview">
                            Tên hiển thị:{" "}
                            <b>{namePreview || "(chưa có thuộc tính nào)"}</b>
                          </div>

                          {/* Danh sách thuộc tính key-value */}
                          <div className="pmm-attr-list">
                            {variant.attributes.map((attr, aIdx) => (
                              <div className="pmm-attr-row" key={aIdx}>
                                <input
                                  className="pmm-attr-inp pmm-attr-key"
                                  type="text"
                                  placeholder="Thuộc tính (VD: Màu)"
                                  value={attr.key}
                                  onChange={(e) =>
                                    handleAttributeChange(
                                      variant._tempId,
                                      aIdx,
                                      "key",
                                      e.target.value,
                                    )
                                  }
                                />
                                <input
                                  className="pmm-attr-inp pmm-attr-val"
                                  type="text"
                                  placeholder="Giá trị (VD: Đỏ)"
                                  value={attr.value}
                                  onChange={(e) =>
                                    handleAttributeChange(
                                      variant._tempId,
                                      aIdx,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                />
                                <button
                                  className="pmm-attr-del"
                                  onClick={() =>
                                    handleRemoveAttribute(variant._tempId, aIdx)
                                  }
                                  title="Xóa thuộc tính"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            className="pmm-attr-addbtn"
                            onClick={() => handleAddAttribute(variant._tempId)}
                            style={{ marginBottom: 10 }}
                          >
                            <FaPlus size={9} /> Thêm thuộc tính
                          </button>

                          {/* Giá & tồn kho riêng cho biến thể này */}
                          <div className="pmm-grid pmm-grid-2">
                            <div className="pmm-field">
                              <label className="pmm-lbl">
                                Giá bán (VNĐ) <span className="pmm-req">*</span>
                              </label>
                              <div className="pmm-icon-wrap">
                                <span className="pmm-icon-pfx">
                                  <FaDollarSign />
                                </span>
                                <input
                                  className="pmm-inp"
                                  type="number"
                                  value={variant.price_cents}
                                  onChange={(e) =>
                                    handleVariantFieldChange(
                                      variant._tempId,
                                      "price_cents",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="pmm-field">
                              <label className="pmm-lbl">Tồn kho</label>
                              <div className="pmm-icon-wrap">
                                <span className="pmm-icon-pfx">
                                  <FaBoxOpen />
                                </span>
                                <input
                                  className="pmm-inp"
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) =>
                                    handleVariantFieldChange(
                                      variant._tempId,
                                      "stock",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* SKU: chỉ xem trước, tự sinh ở backend */}
                          <div style={{ marginTop: 8 }}>
                            <span className="pmm-sku-preview">
                              <FaBarcode style={{ marginRight: 4 }} />
                              SKU: {variant.sku || "Sẽ tự sinh khi lưu"}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      className="pmm-add-variant-btn"
                      onClick={handleAddVariant}
                    >
                      <FaPlus size={11} /> Thêm biến thể (màu sắc, size...)
                    </button>

                    <div className="pmm-variant-total">
                      <span>Tổng tồn kho (xem trước)</span>
                      <b>{totalStockPreview} sản phẩm</b>
                    </div>
                  </div>

                  {/* Section 3: Mô tả */}
                  <div>
                    <p className="pmm-section-hd">Mô tả</p>
                    <div className="pmm-field">
                      <textarea
                        className="pmm-textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Mô tả ngắn về sản phẩm..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ════════ FOOTER ════════ */}
              <div className="pmm-footer">
                <button className="pmm-btn pmm-btn-ghost" onClick={handleClose}>
                  <FaTimes style={{ fontSize: 10 }} /> Hủy bỏ
                </button>
                <button
                  className="pmm-btn pmm-btn-primary"
                  onClick={handleSubmit}
                >
                  <FaSave style={{ fontSize: 10 }} /> Lưu sản phẩm
                </button>
              </div>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </Modal.Header>
    </Modal>
  );
};

export default ProductModal;
