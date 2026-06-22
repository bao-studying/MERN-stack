# CartPage Variant Display - Visual Summary

## Multi-Variant Product Display

### Example: Nike Sport Shoes in Cart with 3 Variants

```
┌─────────────────────────────────────────────────────────────────┐
│                        GIỎ HÀNG                                  │
├──────────────────────────────────────────────────────┬──────────┤
│                                                      │          │
│ ☑ Chọn tất cả (7 biến thể)         [🗑 Xóa (2)]    │ TỔNG KẾT │
│                                                      │          │
│ ┌─────────────────────────────────────────────────┐  │          │
│ │  [IMG] Nike Sport Shoes          Giày & Dép   │  │  Tạm tính│
│ │                          🏷 3 biến thể        │  │  (7) xxxxxx│
│ ├─────────────────────────────────────────────────┤  │          │
│                                                      │          │
│ ┌─────────────────────────────────────────────────┐  │  Vận chuyển
│ │ ☑ [●Red] Size: M                                │  │  Freeship│
│ │    Giày thể thao đỏ                            │  │          │
│ │    1.299.000 đ / sản phẩm                      │  │  Voucher │
│ │    ✓ Còn 25 sản phẩm                          │  │  [Nhập]  │
│ │                                                │  │          │
│ │    [−] 2  [+]  ────────────── 2.598.000 đ [×]│  │  ─────── │
│ ├─────────────────────────────────────────────────┤  │ TOTAL    │
│                                                      │ 10.000.000│
│ ┌─────────────────────────────────────────────────┐  │    đ     │
│ │ ☑ [●Blue] Size: L                              │  │          │
│ │    Giày thể thao xanh                          │  │ [Thanh toán]
│ │    1.499.000 đ / sản phẩm                      │  │          │
│ │    ⚠ Còn 3 sản phẩm                           │  │          │
│ │                                                │  │          │
│ │    [−] 1  [+]  ────────────── 1.499.000 đ [×]│  │          │
│ ├─────────────────────────────────────────────────┤  │          │
│                                                      │          │
│ ┌─────────────────────────────────────────────────┐  │          │
│ │ ☑ [●Black] Size: S  [Tổng 4] Attributes       │  │          │
│ │    Giày thể thao đen nhỏ                       │  │          │
│ │    899.000 đ / sản phẩm                        │  │          │
│ │    ❌ Hết hàng                                  │  │          │
│ │                                                │  │          │
│ │    [−] 0  [+]  ────────────── 0 đ        [×]│  │          │
│ └─────────────────────────────────────────────────┘  │          │
│                                                      │          │
│  ← Tiếp tục khám phá                                │          │
│                                                      │          │
└──────────────────────────────────────────────────────┴──────────┘
```

## Key Features Implemented

### 1. **Product Grouping**

- Sản phẩm hiển thị một lần (header với ảnh + tên)
- Các biến thể liệt kê bên dưới
- Badge "X biến thể" khi sản phẩm có >1 variant

### 2. **Per-Variant Details**

✓ Tên/thuộc tính variant (Màu, Size, etc.)
✓ Giá riêng cho từng variant
✓ Stock status per variant (✓ Còn, ⚠ Còn ít, ❌ Hết)
✓ Subtotal động (qty × price)

### 3. **Independent Controls**

✓ Qty +/− buttons riêng cho mỗi variant
✓ Delete button xóa chỉ variant đó
✓ Checkbox chọn riêng lẻ
✓ "Chọn tất cả" = chọn tất cả variants

### 4. **Smart Summary**

✓ Tính toán tạm tính dựa trên variants chọn
✓ Kiểm tra freeship per selection
✓ Áp voucher trên selected items
✓ Hiển thị số lượng variants/items được chọn

### 5. **Stock Management**

- ✓ Green: Đủ stock
- ⚠ Amber: Stock thấp (≤5)
- ❌ Red: Hết hàng (qty disabled)
- QtyMax = variant.stock

## Behind-the-Scenes Logic

### Line Key Generation

```javascript
// Mỗi biến thể = 1 line duy nhất
lineKey = `${productId}__${variantId}`;

// Ví dụ
line1 = "nike001__red_m"; // 2 cái
line2 = "nike001__blue_l"; // 1 cái
line3 = "nike001__black_s"; // 0 cái (hết)
```

### Selection System

```javascript
// Mảng selectedItems chứa lineKeys
selectedItems = ["nike001__red_m", "nike001__blue_l"]

// Tính toán tạm tính
subtotal =
  (1299000 × 2) +  // Red M
  (1499000 × 1)    // Blue L
  = 4.297.000 đ
```

### API Communication

```javascript
// Add to cart (từ QuickViewModal)
POST /api/cart/add {
  productId: "nike001",
  quantity: 2,
  variantId: "red_m",
  variant: {
    name: "Red - Medium",
    attributes: { color: "Red", size: "M" },
    price_cents: 1299000,
    stock: 25
  }
}

// Update qty của 1 variant
PUT /api/cart/update {
  productId: "nike001",
  quantity: 3,
  variantId: "red_m"  ← IMPORTANT: Chỉ cập nhật variant này
}

// Delete 1 variant
DELETE /api/cart/remove/nike001?variantId=red_m
```

## User Experience Improvements

### Before Update

❌ Tất cả variants cùng 1 product merge thành 1 line
❌ Không biết variant nào là nào
❌ Qty control ảnh hưởng toàn bộ product
❌ Khó quản lý stock per variant

### After Update

✅ Mỗi variant = 1 line riêng (dễ quản lý)
✅ Tên/thuộc tính rõ ràng
✅ Qty/delete độc lập per variant
✅ Stock status chính xác
✅ Tính toán giá đúng (mỗi variant giá khác)
✅ UX gần như store lớn (Amazon, Shopee)

## Browser Console Logs for Debugging

```javascript
// CartPage renders
console.log("Grouped items:", groupedItems);
// Output: [{product: {...}, lines: [{variant: "Red M", qty: 2}, ...]}]

console.log("All line keys:", allLineKeys);
// Output: ["nike001__red_m", "nike001__blue_l", "nike001__black_s"]

console.log("Selected items:", selectedItems);
// Output: ["nike001__red_m", "nike001__blue_l"]

console.log("Subtotal:", subtotal);
// Output: 4297000
```

## Responsive Design

- Desktop (1200px+): Full 2-column layout (items + summary)
- Tablet (768px-1199px): Stacked, summary below items
- Mobile (<768px): Single column, summary sticky at bottom

---

**Status:** ✅ **Ready to Use - Fully Functional Cart with Multi-Variant Support**
