import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";
import { WishlistProvider } from "./context/WishlistProvider";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* AuthProvider bây giờ đã nằm TRONG Router của main.jsx */}
      <CartProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
