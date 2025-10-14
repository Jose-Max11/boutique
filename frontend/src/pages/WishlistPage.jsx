import React, { useEffect, useState } from "react";
import { Heart, X, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";
import "./WishlistPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCartWishlist();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [wishlist]);

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optionally remove from wishlist:
    // removeFromWishlist(product._id);
  };

  if (loading) return <p>Loading wishlist...</p>;

  return (
    <div>
      <Navbar />
      <div className="wishlist-page-container">
        <div className="wishlist-header">
          <Link to="/user" className="back-link">
            <ArrowLeft size={20} /> Continue Shopping
          </Link>
          <h2 className="wishlist-title">
            <Heart size={28} className="heart-icon" /> My Wishlist ({wishlist.length})
          </h2>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <Heart size={80} className="empty-heart" />
            <h3>Your wishlist is empty</h3>
            <p>Start adding products you love to keep track of them!</p>
            <Link to="/user" className="continue-shopping-btn">
              <ShoppingBag size={20} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-items-grid">
            {wishlist.map((product) => {
              const prod = product.product || product; // backend or local fallback
              const imageUrl = prod.image
                ? prod.image.startsWith("http")
                  ? prod.image
                  : `${BACKEND_URL}/${prod.image}`
                : "https://via.placeholder.com/300x300?text=No+Image";

              return (
                <div className="wishlist-item-card" key={prod._id}>
                  <div className="item-image-container">
                    <img
                      src={imageUrl}
                      alt={prod.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                      }}
                    />
                    <button
                      onClick={() => removeFromWishlist(prod._id)}
                      className="remove-btn"
                      aria-label="Remove from wishlist"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="item-content">
                    <h5 className="item-name">{prod.name}</h5>
                    <p className="item-description">{prod.description || "No description available"}</p>
                    <div className="item-price">₹{prod.price}</div>

                    <div className="item-actions">
                      <button onClick={() => handleAddToCart(prod)} className="add-to-cart-btn">
                        <ShoppingBag size={16} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
