// src/pages/DesignsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";

const BACKEND_URL = "http://localhost:5000";

export default function DesignsPage() {
  const [products, setProducts] = useState([]);
  const [hovered, setHovered] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCartWishlist();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/products`, { withCredentials: true });
      const productsWithImages = res.data.map((p) => ({
        ...p,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
        currentImageIndex: 0,
      }));
      setProducts(productsWithImages);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  // Auto-rotate images every 3 seconds
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

  const handleAddToCart = (product) => addToCart(product);

  const handleWishListToggle = (product) => {
    if (wishlist.some((item) => item._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const inWishlist = (product) => wishlist.some((item) => item._id === product._id);

  const goToProductPage = (product) => navigate(`/designs/${product._id}`);

  // ===== Inline Styles =====
  const styles = {
    container: {
      padding: "60px 40px",
      background: "#f9f9fa",
      fontFamily: "'Poppins', sans-serif",
      color: "#c95f7b",
    },
    heading: {
      fontSize: "32px",
      fontWeight: 600,
      color: "#c95f7b",
      marginBottom: "40px",
      textAlign: "center",
    },
    productCardList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "25px",
      justifyContent: "center",
    },
    productCard: {
      position: "relative",
      width: "250px",
      background: "#fff",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
      cursor: "pointer",
      transition: "transform 0.3s, box-shadow 0.3s",
    },
    productImageBox: {
      position: "relative",
      width: "100%",
      height: "320px",
      overflow: "hidden",
      borderRadius: "20px",
    },
    productImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.4s ease",
      borderRadius: "20px",
    },
    offerBadge: {
      position: "absolute",
      top: "12px",
      left: "12px",
      background: "#c95f7b",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 600,
      padding: "4px 10px",
      borderRadius: "15px",
      zIndex: 5,
    },
    // Updated carousel indicator style (like UserDashboard)
    carouselIndicator: {
      position: "absolute",
      bottom: "8px",
      right: "8px",
      background: "rgba(26,42,108,0.8)",
      color: "#fff",
      fontSize: "12px",
      padding: "2px 6px",
      borderRadius: "12px",
      zIndex: 5,
    },
    floatingBadges: {
      position: "absolute",
      bottom: "12px",
      left: "12px",
      display: "flex",
      gap: "8px",
      zIndex: 5,
    },
    badge: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      background: "#e6edf8",
      color: "#c95f7b",
      fontSize: "12px",
      fontWeight: 500,
      padding: "4px 8px",
      borderRadius: "12px",
    },
    productInfo: { padding: "12px 15px", textAlign: "center" },
    productPrice: { fontSize: "15px", fontWeight: 500, color: "#c95f7b" },
    productActions: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 12px 12px 12px",
    },
    actionBtn: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      border: "none",
      background: "#c95f7b",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s",
    },
    noProducts: {
      fontSize: "16px",
      color: "#666",
      textAlign: "center",
      width: "100%",
      marginTop: "50px",
    },
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Showcase Designs</h2>
        <div style={styles.productCardList}>
          {products.length === 0 ? (
            <p style={styles.noProducts}>No products available yet.</p>
          ) : (
            products.map((product) => {
              const images = product.images.length
                ? product.images.map((img) =>
                    img.startsWith("http") ? img : `${BACKEND_URL}/${img}`
                  )
                : ["https://via.placeholder.com/300x450?text=No+Image"];

              const currentImage = images[product.currentImageIndex];
              const wishlisted = inWishlist(product);

              return (
                <div key={product._id} style={styles.productCard}>
                  <div
                    style={styles.productImageBox}
                    onClick={() => goToProductPage(product)}
                  >
                    <img
                      src={currentImage}
                      alt={product.name}
                      style={styles.productImage}
                    />
                    {product.discount && (
                      <span style={styles.offerBadge}>
                        {product.discount}% off
                      </span>
                    )}

                    {/* ✅ Image count like UserDashboard */}
                    {images.length > 1 && (
                      <div style={styles.carouselIndicator}>
                        {product.currentImageIndex + 1}/{images.length}
                      </div>
                    )}

                    <div style={styles.floatingBadges}>
                      <div style={styles.badge}>
                        <Star size={14} fill="#00a82d" stroke="none" />
                        <span>{product.averageRating?.toFixed(1) || "4.5"}</span>
                      </div>
                      <div style={styles.badge}>
                        <Truck size={14} />
                        <span>Free Delivery</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.productInfo}>
                    <h5>{product.name}</h5>
                    <span style={styles.productPrice}>₹{product.price}</span>
                  </div>

                  <div style={styles.productActions}>
                    <button
                      style={styles.actionBtn}
                      onClick={() => handleWishListToggle(product)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform =
                          "scale(1.15) rotate(10deg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <Heart
                        size={18}
                        fill={wishlisted ? "white" : "none"}
                        stroke="white"
                      />
                    </button>
                    <button
                      style={styles.actionBtn}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
