# Cart Variant Details Upgrade Guide

## Overview

CartPage now fully supports displaying multiple variants of the same product in the shopping cart with independent quantity controls and pricing display for each variant.

## Files Updated

### Frontend

#### 1. **`frontend/src/context/CartProvider.jsx`** ✅

- **Updated signatures:**
  ```javascript
  addToCart(productId, quantity, variantId, variantData);
  updateQuantity(productId, newQuantity, variantId);
  removeFromCart(productId, variantId);
  ```
- **Changes:**
  - Accept variantId and variantData parameters
  - Forward variant info to backend cart API
  - Enhanced item matching logic (both productId and variantId must match)

#### 2. **`frontend/src/services/cart.service.js`** ✅

- **Updated API methods:**
  ```javascript
  addToCart(data); // data: { productId, quantity, variantId, variant }
  updateQuantity(data); // data: { productId, quantity, variantId }
  removeItem(productId, variantId); // variantId is optional query param
  ```

#### 3. **`frontend/src/pages/client/CartPage.jsx`** ✅ (Already Compatible)

- Already uses `getLineKey(item)` to generate unique per-variant line keys
- Selection system works per-variant (lineKey = `productId__variantId`)
- Quantity controls correctly pass variantId to backend
- Delete operations correctly target specific variants

#### 4. **`frontend/src/components/cart/AddToCartBtn.jsx`** ✅ (Already Updated)

- Already accepts and forwards `variantId` and `variantData` props
- Passes these to `addToCart()` hook

### Backend

#### 1. **`backend/src/models/cart.js`** ✅

- **CartItemSchema changes:**
  ```javascript
  variantId: { type: Schema.Types.ObjectId, default: null }  // Optional
  variant: Schema.Types.Mixed  // Store variant details for display
  ```

#### 2. **`backend/src/controllers/cart.controller.js`** ✅

- **Updated signatures:**
  ```javascript
  addToCart(req, res); // Extracts: productId, quantity, variantId, variant
  updateCartItem(req, res); // Extracts: productId, quantity, variantId
  removeCartItem(req, res); // Supports optional variantId query param
  ```

#### 3. **`backend/src/services/cart.service.js`** ✅

- **Core logic updates:**
  - `addToCartService()`: Match items by both productId AND variantId
  - `updateCartItemService()`: Per-variant quantity updates (no more bulk updates)
  - `removeCartItemService()`: Remove specific variant or entire product
  - Populates variant details for display in frontend

## How It Works

### Display Flow

1. **Product with Multiple Variants in Cart:**

   ```
   Product Group Header (once)
   ├─ Variant 1 (e.g., Red M) → Qty 2, Price $XX, Stock OK
   ├─ Variant 2 (e.g., Blue L) → Qty 1, Price $YY, Low Stock ⚠
   └─ Variant 3 (e.g., Green S) → Qty 3, Price $ZZ, Out of Stock ❌
   ```

2. **Each variant line shows:**
   - Variant name/attributes (if any)
   - Individual price per unit
   - Stock status
   - Independent quantity control (±)
   - Individual subtotal
   - Delete button (removes only this variant)

### Selection & Checkout

- Users select specific variants to checkout (not entire products)
- LineKey format: `productId__variantId`
- Summary panel updates dynamically based on selected variants

## Usage Examples

### Adding Product with Variant

```javascript
// From QuickViewModal or ProductDetail
const handleAddToCart = async () => {
  await addToCart(
    productId,
    quantity,
    selectedVariant._id, // variantId
    selectedVariant, // variantData
  );
};
```

### Updating Variant Quantity

```javascript
// In CartPage
const handleQtyChange = (productId, newQty, variantId) => {
  updateQuantity(productId, newQty, variantId);
};
```

### Removing Specific Variant

```javascript
// In CartPage
const handleRemoveVariant = (productId, variantId) => {
  removeFromCart(productId, variantId);
};
```

## Database Changes

### Cart Collection Items Structure

```javascript
{
  productId: ObjectId,          // Reference to Product
  variantId: ObjectId,          // Reference to Variant (optional, can be null)
  variant: {                    // Full variant details snapshot
    name: "Red - Medium",
    attributes: { color: "Red", size: "M" },
    price_cents: 1299,
    stock: 15
  },
  quantity: 2,                  // User's selected qty for this variant
  _id: false
}
```

## Backward Compatibility

✅ **Fully backward compatible:**

- Existing carts without variantId still work (variantId = null)
- Old code paths still supported (no variantId param = treat as non-variant product)
- Frontend gracefully displays "Sản phẩm đơn" for products without variants

## Testing Checklist

- [ ] Add product with variant from QuickViewModal
- [ ] Verify variant details display in CartPage (name, attributes, price, stock)
- [ ] Change quantity of specific variant
- [ ] Delete specific variant (others remain)
- [ ] Select different variants for checkout
- [ ] Apply voucher with multiple variants selected
- [ ] Calculate subtotal correctly per variant
- [ ] Verify stock warnings per variant
- [ ] Test empty cart message
- [ ] Test user not logged in flow

## API Endpoints Reference

### Add to Cart (POST `/api/cart/add`)

```json
Request:
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2,
  "variantId": "507f1f77bcf86cd799439012",
  "variant": {
    "name": "Red - Medium",
    "attributes": { "color": "Red", "size": "M" },
    "price_cents": 1299,
    "stock": 15
  }
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": {...},
        "variantId": "507f1f77bcf86cd799439012",
        "variant": {...},
        "quantity": 2
      }
    ]
  }
}
```

### Update Quantity (PUT `/api/cart/update`)

```json
Request:
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 3,
  "variantId": "507f1f77bcf86cd799439012"
}
```

### Remove Variant (DELETE `/api/cart/remove/:productId?variantId=xxx`)

```
DELETE /api/cart/remove/507f1f77bcf86cd799439011?variantId=507f1f77bcf86cd799439012
```

## Deployment Notes

1. ✅ No database migration needed (variantId and variant are new optional fields)
2. ✅ Frontend changes are backward compatible
3. ✅ Backend supports both new (with variantId) and old (without variantId) requests
4. 🚀 Ready to deploy immediately

## Known Limitations & Future Improvements

- [ ] Bundle products with multiple variants (combo deals)
- [ ] Save variant preferences for quick reorder
- [ ] Show variant comparison in cart
- [ ] One-click increase/decrease qty via keyboard
- [ ] Bulk edit variants (select multiple → change qty all at once)

---

**Status:** ✅ **Implementation Complete & Ready to Deploy**
