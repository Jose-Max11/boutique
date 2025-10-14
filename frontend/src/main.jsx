import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SearchProvider } from "./context/SearchContext";
import { CartWishlistProvider } from "./pages/CartWishlistContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
      <SearchProvider>
        <CartWishlistProvider>
          <App />
        </CartWishlistProvider>
      </SearchProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
