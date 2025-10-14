import React from "react";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";
import "./CardPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function CartPage() {
  const {
    cart,
    setCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    fetchCart,
  } = useCartWishlist();

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
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
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product?._id === productId || item._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
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

  return (
    <div>
      <Navbar />

      <div className="cart-page-container">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-section">
            <h2 className="cart-title">
              <ShoppingCart size={28} /> Shopping Cart ({cart.length})
            </h2>
            <Link to="/user" className="continue-shopping-link">
              ← Continue Shopping
            </Link>
          </div>

          {cart.length > 0 && (
            <button onClick={handleClearCart} className="clear-cart-btn">
              <Trash2 size={18} /> Clear Cart
            </button>
          )}
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={80} className="empty-cart-icon" />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/user" className="shop-now-btn">
              <ShoppingCart size={20} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items">
              {cart.map((item) => {
                const product = item.product || item;
                const imageUrl = product.image?.startsWith("http")
                  ? product.image
                  : `${BACKEND_URL}/${product.image || ""}`;
                const price = parseFloat(product.price) || 0;
                const quantity = parseInt(item.quantity) || 1;

                return (
                  <div className="cart-item" key={product._id}>
                    <div className="item-image">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) =>
                          (e.target.src =
                            "https://dummyimage.com/150x150/ccc/fff&text=No+Image")
                        }
                      />
                    </div>

                    <div className="item-details">
                      <h4 className="item-name">{product.name}</h4>
                      <p className="item-price">₹{price.toFixed(2)}</p>
                    </div>

                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleQuantityChange(product._id, quantity - 1)
                        }
                        disabled={quantity <= 1}
                        className="quantity-btn"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity-display">{quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(product._id, quantity + 1)
                        }
                        className="quantity-btn"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="item-total">
                      <p className="total-price">
                        ₹{(price * quantity).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemove(product._id)}
                      className="remove-item-btn"
                    >
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
                    <span>Subtotal ({cart.length} items)</span>
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

                {/* 🔥 Added buttons here */}
                <Link to="/checkout" className="checkout-btn">
  <CreditCard size={20} /> Proceed to Checkout
</Link>
                <Link to="/user" className="continue-shopping-btn">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
