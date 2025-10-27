// src/pages/Category.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, Star, ShoppingCart, Heart, Truck } from "lucide-react";
import { useCartWishlist } from "./CartWishlistContext";

const BACKEND_URL = "http://localhost:5000";

export default function Category() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCartWishlist();

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [hovered, setHovered] = useState(false);
  const [clickedHeartId, setClickedHeartId] = useState(null);
  const [popupText, setPopupText] = useState(null);

  // Fetch products for category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/categories/${id}/products`, { withCredentials: true });
        if (res.data) {
          const productsWithImages = (res.data.products || []).map((p) => ({
            ...p,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
            currentImageIndex: 0,
            averageRating: p.averageRating || 0, // ✅ normalize average rating
          }));
          setProducts(productsWithImages);
          setCategoryName(res.data.categoryName || "Category");
        }
      } catch (err) {
        console.error("Error fetching category products:", err);
      }
    };
    if (id) fetchCategoryProducts();
  }, [id]);

  // Auto-slide images every 3s
  useEffect(() => {
    if (hovered) return;
    const interval = setInterval(() => {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.images.length > 1) {
            const nextIndex = (product.currentImageIndex + 1) % product.images.length;
            return { ...product, currentImageIndex: nextIndex };
          }
          return product;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [hovered]);

  // Heart button animation + popup
  const handleWishListToggle = (product) => {
    if (wishlist.some((item) => item._id === product._id)) {
      removeFromWishlist(product._id);
      setPopupText("Removed from Wishlist ❌");
    } else {
      addToWishlist(product);
      setPopupText("Added to Wishlist ❤️");
    }
    setClickedHeartId(product._id);
    setTimeout(() => setClickedHeartId(null), 500);
    setTimeout(() => setPopupText(null), 1000);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`🛒 Added ${product.name} to cart!`);
  };

  // Swipe/drag support
  const dragData = useRef({ startX: 0, isDragging: false });
  const handleMouseDown = (e, productId) => { dragData.current = { startX: e.clientX, isDragging: true, productId }; };
  const handleMouseMove = (e) => {
    if (!dragData.current.isDragging) return;
    const deltaX = e.clientX - dragData.current.startX;
    if (Math.abs(deltaX) > 50) {
      const direction = deltaX > 0 ? -1 : 1;
      setProducts((prev) =>
        prev.map((p) => {
          if (p._id === dragData.current.productId && p.images.length > 1) {
            const nextIndex = (p.currentImageIndex + direction + p.images.length) % p.images.length;
            return { ...p, currentImageIndex: nextIndex };
          }
          return p;
        })
      );
      dragData.current.startX = e.clientX;
    }
  };
  const handleMouseUp = () => { dragData.current.isDragging = false; };

  const styles = {
    container: { padding: "60px 40px", background: "#f9f9fa", fontFamily: "'Poppins', sans-serif", color: "#13142b" },
    heading: { fontSize: "32px", fontWeight: 600, color: "#050c27ff", marginBottom: "40px", textAlign: "center" },
    backBtn: { display: "flex", alignItems: "center", cursor: "pointer", marginBottom: "20px", gap: "6px", color: "#c95f7b", fontWeight: 500 },
    productGrid: { display: "flex", flexWrap: "wrap", gap: "25px", justifyContent: "center" },
    productCard: { position: "relative", width: "250px", background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 25px rgba(0,0,0,0.1)", cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s" },
    imageBox: { position: "relative", width: "100%", height: "320px", overflow: "hidden", borderRadius: "20px", userSelect: "none" },
    productImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", borderRadius: "20px" },
    offerBadge: { position: "absolute", top: "12px", left: "12px", background: "#1a2a6c", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "15px", zIndex: 5 },
    carouselIndicator: { position: "absolute", bottom: "10px", right: "12px", background: "rgba(26,42,108,0.8)", color: "#fff", fontSize: "12px", padding: "2px 8px", borderRadius: "12px", zIndex: 5 },
    floatingBadges: { position: "absolute", bottom: "12px", left: "12px", display: "flex", gap: "8px", zIndex: 5 },
    badge: { display: "flex", alignItems: "center", gap: "4px", background: "#e6edf8", color: "#1a2a6c", fontSize: "12px", fontWeight: 500, padding: "4px 8px", borderRadius: "12px" },
    productInfo: { padding: "12px 15px", textAlign: "center" },
    productPrice: { fontSize: "15px", fontWeight: 500, color: "#09102fff" },
    productActions: { display: "flex", justifyContent: "space-between", padding: "8px 12px 12px 12px" },
    actionBtn: { width: "36px", height: "36px", borderRadius: "50%", border: "none", background: "#c95f7b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.3s, transform 0.3s" },
    noProducts: { fontSize: "16px", color: "#666", textAlign: "center", width: "100%", marginTop: "50px" },
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </div>
        <h2 style={styles.heading}>{categoryName ? `${categoryName} Products` : "Category Products"}</h2>

        {products.length === 0 ? (
          <p style={styles.noProducts}>No products found in this category.</p>
        ) : (
          <div style={styles.productGrid}>
            {products.map((prod) => {
              const images = prod.images.length
                ? prod.images.map((img) => (img.startsWith("http") ? img : `${BACKEND_URL}/${img}`))
                : ["https://via.placeholder.com/300x450?text=No+Image"];
              const currentImage = images[prod.currentImageIndex];
              const inWishlist = wishlist.some((item) => item._id === prod._id);

              return (
                <div
                  key={prod._id}
                  style={styles.productCard}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div
                    style={styles.imageBox}
                    onClick={() => navigate(`/designs/${prod._id}`)}
                    onMouseDown={(e) => handleMouseDown(e, prod._id)}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={(e) => handleMouseDown({ clientX: e.touches[0].clientX }, prod._id)}
                    onTouchMove={(e) => handleMouseMove({ clientX: e.touches[0].clientX })}
                    onTouchEnd={handleMouseUp}
                  >
                    <img src={currentImage} alt={prod.name} style={styles.productImage} />
                    {prod.discount && <span style={styles.offerBadge}>{prod.discount}% off</span>}
                    {images.length > 1 && <div style={styles.carouselIndicator}>{images.length} images</div>}
                    <div style={styles.floatingBadges}>
                      <div style={styles.badge}>
                        <Star size={14} fill="#00a82d" stroke="none" />
                        <span>{prod.averageRating?.toFixed(1) || "4.5"}</span>
                      </div>
                      <div style={styles.badge}>
                        <Truck size={14} />
                        <span>Free Delivery</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.productInfo}>
                    <h5>{prod.name}</h5>
                    <span style={styles.productPrice}>₹{prod.price}</span>
                  </div>

                  <div style={styles.productActions}>
                    <button
                      style={{
                        ...styles.actionBtn,
                        transform: clickedHeartId === prod._id ? "scale(1.4)" : "scale(1)",
                      }}
                      onClick={() => handleWishListToggle(prod)}
                    >
                      <Heart size={20} fill={inWishlist ? "white" : "none"} stroke="white" />
                    </button>
                    <button style={styles.actionBtn} onClick={() => handleAddToCart(prod)}>
                      <ShoppingCart size={20} />
                    </button>
                  </div>

                  {clickedHeartId === prod._id && popupText && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-25px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#c95f7b",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        zIndex: 10,
                      }}
                    >
                      {popupText}
                    </div>
                  )}
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
