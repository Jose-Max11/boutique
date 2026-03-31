// src/pages/SharedWishlistPage.jsx
import React, { useEffect, useState } from "react";
import { Heart, ShoppingBag, Share2, ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCartWishlist } from "./CartWishlistContext";

const BACKEND_URL = "http://localhost:5000";

export default function SharedWishlistPage() {
  const { shareId } = useParams();
  const { addToCart } = useCartWishlist();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, [shareId]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BACKEND_URL}/api/shared-wishlist/${shareId}`
      );

      if (res.data.success) {
        setWishlist(res.data.wishlist);
      } else {
        setError("Wishlist not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`🛒 ${product.name} added to cart`);
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loader}></div>
        <p>Loading wishlist...</p>
      </div>
    );
  }

  // ---------------- ERROR ----------------
  if (error || wishlist.length === 0) {
    return (
      <div style={styles.center}>
        <Heart size={80} style={{ opacity: 0.5 }} />
        <h2>Wishlist Not Found</h2>
        <p>{error || "This wishlist is empty"}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Heart size={30} /> Shared Wishlist
          </h1>

          <button
            onClick={() =>
              navigator.clipboard.writeText(window.location.href)
            }
            style={styles.shareBtn}
          >
            <Share2 size={18} /> Copy Link
          </button>
        </div>

        {/* GRID */}
        <div style={styles.grid}>
          {wishlist.map((product) => {
            const image =
              product.images?.[0]
                ? product.images[0].startsWith("http")
                  ? product.images[0]
                  : `${BACKEND_URL}/${product.images[0]}`
                : product.image
                ? `${BACKEND_URL}/${product.image}`
                : "https://via.placeholder.com/300";

            return (
              <div key={product._id} style={styles.card}>
                {/* IMAGE */}
                <div style={styles.imageBox}
                >
                  <img src={image} alt={product.name} style={styles.image} />
                </div>




                {/* INFO */}
                <div style={styles.info}>
                  <h3>{product.name}</h3>
                  <p style={styles.price}>
                    ₹{product.price?.toLocaleString() || "N/A"}
                  </p>

                  {/* ACTIONS */}
                  <div style={styles.actions}>
                    <button
                      onClick={() =>
                        window.open(`/designs/${product._id}`, "_blank")
                      }
                      style={styles.viewBtn}
                    >
                      <ExternalLink size={16} /> View
                    </button>

                    {localStorage.getItem("token") && (
                      <button
                        onClick={() => handleAddToCart(product)}
                        style={styles.cartBtn}
                      >
                        <ShoppingBag size={16} /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
}

const styles = {
  container: {
    padding: "60px 30px",
    background: "#ffffff",
    minHeight: "100vh",
  },

  header: {
    textAlign: "center",
    marginBottom: "40px",
  },

  title: {
    color: "#000000",
    fontSize: "30px",
    marginBottom: "10px",
    fontWeight: "700",
  },

  shareBtn: {
    padding: "12px 24px",
    background: "linear-gradient(90deg, #c95f7b, #c95f7b)",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(201,95,123,0.3)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))",
    gap: "25px",
  },

  card: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(201,95,123,0.2)",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },

  /* ✅ IMAGE CONTAINER */
  imageBox: {
    height: "280px",
    background: "#fff5f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    cursor: "pointer",
  },

  /* ✅ SINGLE IMAGE (FULL VISIBLE) */
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "10px",
  },

  /* ✅ MULTI IMAGE GRID (FLOATING STYLE) */
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    gap: "2px",
    width: "100%",
    height: "100%",
  },

  multiImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  info: {
    padding: "15px",
    textAlign: "center",
  },

  price: {
    color: "#c95f7b",
    fontWeight: "700",
    margin: "10px 0",
    fontSize: "18px",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },

  viewBtn: {
    padding: "8px 12px",
    background: "#c95f7b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  cartBtn: {
    padding: "8px 12px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  center: {
    textAlign: "center",
    padding: "80px",
    color: "#c95f7b",
  },

  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #eee",
    borderTop: "4px solid #c95f7b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "auto",
  },
};