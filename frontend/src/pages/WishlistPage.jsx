// src/pages/WishlistPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { Heart, X, ShoppingBag, ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BACKEND_URL = "http://localhost:5000";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCartWishlist();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const dragData = useRef({ startX: 0, dragged: false });

  // Normalize wishlist to include images array, currentImageIndex, and averageRating
  useEffect(() => {
    const normalized = wishlist.map((p) => ({
      ...p,
      images: Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : p.image
          ? [p.image]
          : [],
      currentImageIndex: 0,
      averageRating: p.averageRating || 0, // ✅ Add correct average rating
    }));
    setProducts(normalized);
  }, [wishlist]);

  // Auto-slide images every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.images.length > 1) {
            const nextIndex = (p.currentImageIndex + 1) % p.images.length;
            return { ...p, currentImageIndex: nextIndex };
          }
          return p;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`🛒 Added ${product.name} to cart!`);
  };

  const handleRemove = (productId) => removeFromWishlist(productId);

  const handleMouseDown = (e) => {
    dragData.current = { startX: e.clientX, dragged: false };
  };
  const handleMouseMove = (e, product) => { /* optional swipe logic */ };
  const handleMouseUp = (product) => { /* optional swipe logic */ };

  return (
    <>
      <Navbar />
      <div style={{ padding: "60px 40px", background: "#f9f9fa", minHeight: "100vh" }}>
        {/* Back button */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "30px", color: "#1a2a6c", cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} /> Continue Shopping
        </div>

        {/* Page heading */}
        <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 600, color: "#1a2a6c", marginBottom: "40px" }}>
          <Heart size={28} style={{ color: "#1a2a6c", marginRight: "8px" }} /> My Wishlist ({wishlist.length})
        </h2>

        {/* Empty wishlist */}
        {products.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "80px", color: "#666" }}>
            <Heart size={80} style={{ color: "#1a2a6c" }} />
            <h3>Your wishlist is empty</h3>
            <p>Start adding products you love to keep track of them!</p>
            <div
              onClick={() => navigate("/user")}
              style={{ display: "inline-block", marginTop: "20px", padding: "10px 20px", background: "#1a2a6c", color: "#fff", borderRadius: "12px", cursor: "pointer" }}
            >
              <ShoppingBag size={20} style={{ marginRight: "6px" }} /> Start Shopping
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "25px", justifyContent: "center" }}>
            {products.map((prod) => {
              const images = prod.images.length
                ? prod.images.map((img) => (img.startsWith("http") ? img : `${BACKEND_URL}/${img}`))
                : ["https://via.placeholder.com/300x300?text=No+Image"];
              const currentImage = images[prod.currentImageIndex];

              return (
                <div
                  key={prod._id}
                  style={{
                    width: "250px",
                    background: "#fff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Image container */}
                  <div
                    style={{ position: "relative", width: "100%", height: "320px", overflow: "hidden", borderRadius: "20px", userSelect: "none", cursor: "pointer" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={(e) => handleMouseMove(e, prod)}
                    onMouseUp={() => handleMouseUp(prod)}
                    onMouseLeave={() => handleMouseUp(prod)}
                    onTouchStart={(e) => handleMouseDown({ clientX: e.touches[0].clientX })}
                    onTouchMove={(e) => handleMouseMove({ clientX: e.touches[0].clientX }, prod)}
                    onTouchEnd={() => handleMouseUp(prod)}
                    onClick={() => navigate(`/designs/${prod._id}`)}
                  >
                    <img
                      src={currentImage}
                      alt={prod.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px", transition: "transform 0.4s" }}
                    />

                    {/* Discount badge */}
                    {prod.discount && (
                      <span style={{ position: "absolute", top: "12px", left: "12px", background: "#1a2a6c", color: "#fff", padding: "4px 10px", borderRadius: "15px", fontSize: "12px", fontWeight: 600 }}>
                        {prod.discount}% off
                      </span>
                    )}

                    {/* Carousel dots */}
                    {images.length > 1 && (
                      <div style={{ position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
                        {images.map((_, idx) => (
                          <span
                            key={idx}
                            style={{ width: "8px", height: "8px", borderRadius: "50%", background: idx === prod.currentImageIndex ? "#1a2a6c" : "#ccc", transition: "background 0.3s" }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Rating badge */}
                    <div style={{ position: "absolute", bottom: "12px", left: "12px", display: "flex", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#e6edf8", color: "#1a2a6c", fontSize: "12px", fontWeight: 500, padding: "4px 8px", borderRadius: "12px" }}>
                        <Star size={14} fill="#00a82d" stroke="none" /> <span>{prod.averageRating?.toFixed(1) || "4.5"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product info */}
                  <div style={{ padding: "12px 15px", textAlign: "center" }}>
                    <h5>{prod.name}</h5>
                    <span style={{ fontSize: "15px", fontWeight: 500, color: "#1a2a6c" }}>₹{prod.price}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px 12px 12px" }}>
                    <button
                      style={{ width: "36px", height: "36px", borderRadius: "50%", border: "none", background: "#1a2a6c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => handleRemove(prod._id)}
                    >
                      <X size={18} />
                    </button>
                    <button
                      style={{ width: "36px", height: "36px", borderRadius: "50%", border: "none", background: "#1a2a6c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => handleAddToCart(prod)}
                    >
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
