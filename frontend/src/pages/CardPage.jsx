// src/pages/CartPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";
import "./CardPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, fetchCart } = useCartWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const dragData = useRef({ startX: 0, isDragging: false, dragged: false });

  // Normalize cart items to include images array and currentImageIndex
  useEffect(() => {
    const normalized = cart.map((item) => {
      const product = item.product || item;
      return {
        ...item,
        product: {
          ...product,
          images: Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : product.image
              ? [product.image]
              : [],
          currentImageIndex: 0,
        },
      };
    });
    setProducts(normalized);
  }, [cart]);

  // Auto-slide carousel every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setProducts((prev) =>
        prev.map((item) => {
          const prod = item.product;
          if (prod.images.length > 1) {
            const nextIndex = (prod.currentImageIndex + 1) % prod.images.length;
            return { ...item, product: { ...prod, currentImageIndex: nextIndex } };
          }
          return item;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getTotalPrice = () => {
    return products.reduce((total, item) => {
      const price = parseFloat(item.product?.price || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + price * quantity;
    }, 0);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemove(productId);
      return;
    }
    try {
      await updateCartQuantity(productId, newQuantity);
      await fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      await fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      await fetchCart();
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  // Drag/swipe for carousel
  const handleMouseDown = (e, productId) => {
    dragData.current = { startX: e.clientX, isDragging: true, dragged: false, productId };
  };

  const handleMouseMove = (e) => {
    if (!dragData.current.isDragging) return;
    const deltaX = e.clientX - dragData.current.startX;
    if (Math.abs(deltaX) > 20) {
      dragData.current.dragged = true;
      const direction = deltaX > 0 ? -1 : 1;
      setProducts((prev) =>
        prev.map((item) => {
          if (item.product._id === dragData.current.productId && item.product.images.length > 1) {
            const nextIndex = (item.product.currentImageIndex + direction + item.product.images.length) % item.product.images.length;
            return { ...item, product: { ...item.product, currentImageIndex: nextIndex } };
          }
          return item;
        })
      );
      dragData.current.startX = e.clientX;
    }
  };

  const handleMouseUp = (productId) => {
    dragData.current.isDragging = false;
    if (!dragData.current.dragged) {
      navigate(`/designs/${productId}`);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="cart-page-container">
        <div className="cart-header">
          <div className="cart-title-section">
            <h2 className="cart-title">
              <ShoppingCart size={28} /> Shopping Cart ({products.length})
            </h2>
            <div className="continue-shopping-link" onClick={() => navigate("/user")}>
              ← Continue Shopping
            </div>
          </div>

          {products.length > 0 && (
            <button onClick={handleClearCart} className="clear-cart-btn">
              <Trash2 size={18} /> Clear Cart
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={80} className="empty-cart-icon" />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <div className="shop-now-btn" onClick={() => navigate("/user")}>
              <ShoppingCart size={20} /> Start Shopping
            </div>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {products.map((item) => {
                const product = item.product;
                const images = product.images.length
                  ? product.images.map((img) => (img.startsWith("http") ? img : `${BACKEND_URL}/${img}`))
                  : ["https://via.placeholder.com/150x150?text=No+Image"];
                const currentImage = images[product.currentImageIndex];
                const quantity = parseInt(item.quantity) || 1;
                const price = parseFloat(product.price) || 0;

                return (
                  <div className="cart-item" key={product._id}>
                    {/* Image Carousel */}
                    <div
                      className="item-image"
                      onMouseDown={(e) => handleMouseDown(e, product._id)}
                      onMouseMove={handleMouseMove}
                      onMouseUp={() => handleMouseUp(product._id)}
                      onMouseLeave={() => handleMouseUp(product._id)}
                      onTouchStart={(e) => handleMouseDown({ clientX: e.touches[0].clientX }, product._id)}
                      onTouchMove={(e) => handleMouseMove({ clientX: e.touches[0].clientX })}
                      onTouchEnd={() => handleMouseUp(product._id)}
                      style={{ cursor: "pointer", position: "relative" }}
                    >
                      <img
                        src={currentImage}
                        alt={product.name}
                        onError={(e) => (e.target.src = "https://via.placeholder.com/150x150?text=No+Image")}
                      />

                      {/* Carousel dots */}
                      {images.length > 1 && (
                        <div style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "4px" }}>
                          {images.map((_, idx) => (
                            <span
                              key={idx}
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: idx === product.currentImageIndex ? "#1a2a6c" : "#ccc",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="item-details">
                      <h4 className="item-name">{product.name}</h4>
                      <p className="item-price">₹{price.toFixed(2)}</p>
                    </div>

                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(product._id, quantity - 1)} disabled={quantity <= 1} className="quantity-btn">
                        <Minus size={16} />
                      </button>
                      <span className="quantity-display">{quantity}</span>
                      <button onClick={() => handleQuantityChange(product._id, quantity + 1)} className="quantity-btn">
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="item-total">
                      <p className="total-price">₹{(price * quantity).toFixed(2)}</p>
                    </div>

                    <button onClick={() => handleRemove(product._id)} className="remove-item-btn">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal ({products.length} items)</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>
                  <hr className="summary-divider" />
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div onClick={() => navigate("/checkout")} className="checkout-btn">
                    <CreditCard size={20} /> Proceed to Checkout
                  </div>
                  <div onClick={() => navigate("/user")} className="continue-shopping-btn">
                    Continue Shopping
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
