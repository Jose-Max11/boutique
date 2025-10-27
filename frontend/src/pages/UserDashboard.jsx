import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useCartWishlist } from "./CartWishlistContext";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [hovered, setHovered] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCartWishlist();
const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/user-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        const productsWithImages = res.data.map((p) => ({
          ...p,
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
          currentImageIndex: 0,
        }));
        setProducts(productsWithImages);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchUserData();
    fetchProducts();
  }, [navigate]);
  const fetchRecentlyViewed = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/user/recently-viewed", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecentlyViewed(res.data.data);
  } catch (err) {
    console.error("Error fetching recently viewed:", err);
  }
};

useEffect(() => {
  fetchRecentlyViewed();
}, []);


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

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`🛒 Added ${product.name} to cart!`);
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      alert(`❌ Removed ${product.name} from wishlist`);
    } else {
      addToWishlist(product);
      alert(`❤️ Added ${product.name} to wishlist!`);
    }
  };

  const isInWishlist = (id) => wishlist.some((item) => item._id === id);
  const goToProductPage = (product) => navigate(`/designs/${product._id}`);

  if (!user) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading user data...
      </p>
    );
  }

  return (
    <>
      <Navbar />

      <div style={{ paddingTop: "80px" }}>
        {/* Dashboard Header */}
        <div style={{
          background: 'url("/images/userbg.jpg") no-repeat center center',
          backgroundSize: 'cover',
          width: "80%",
          maxWidth: "600px",
          margin: "20px auto",
          borderRadius: "20px",
          padding: "80px 30px",
          minHeight: "300px",
          textAlign: "center",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}>
          <h1>Welcome, {user.name} 👋</h1>
          <p>{user.email}</p>
        </div>

        <h2 style={{ textAlign: "center", margin: "20px 0" }}>
          <strong>Your Recommended Products</strong>
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", padding: "0 20px 20px" }}>
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            products.map((prod) => {
              const images = prod.images.length
                ? prod.images.map((img) => (img.startsWith("http") ? img : `http://localhost:5000/${img}`))
                : ["https://via.placeholder.com/250x280?text=No+Image"];
              const currentImage = images[prod.currentImageIndex];
              const inWishlist = isInWishlist(prod._id);

              return (
                <div
                  key={prod._id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "15px",
                    width: "250px",
                    textAlign: "center",
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "transform 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div
                    style={{ position: "relative", width: "100%", height: "280px", overflow: "hidden" }}
                    onClick={() => goToProductPage(prod)}
                  >
                    <img
                      src={currentImage}
                      alt={prod.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    />
                    {images.length > 1 && (
                      <div style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        background: "rgba(26,42,108,0.8)",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "2px 6px",
                        borderRadius: "12px",
                        zIndex: 5,
                      }}>
                        {prod.currentImageIndex + 1}/{images.length}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "10px", flexGrow: 1 }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "5px", fontWeight: 600 }}>{prod.name}</h3>
                    <p>{prod.category?.name || "Uncategorized"}</p>
                    <p>₹{prod.price}</p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px 10px" }}>
                    <button
                      style={{
                        background: "linear-gradient(135deg, #c95f7b, #b95771ff)",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "30px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                      onClick={() => handleAddToCart(prod)}
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>

                    <button
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #c95f7b, #cf6783ff)",
                        boxShadow: "0 4px 10px rgba(201, 95, 123, 0.4)",
                        cursor: "pointer",
                        border: "none",
                        outline: "none",
                        transition: "transform 0.3s",
                      }}
                      onClick={() => handleWishlistToggle(prod)}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15) rotate(10deg)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <Heart size={18} fill={inWishlist ? "white" : "none"} stroke="white" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
       {recentlyViewed.length > 0 && (
  <>
    <h2 style={{ textAlign: "center", margin: "20px 0" }}>
      <strong>Recently Viewed Products</strong>
    </h2>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
        padding: "0 20px 20px",
      }}
    >
      {recentlyViewed.map((prod) => {
        const images = prod.images?.length
          ? prod.images.map((img) => (img.startsWith("http") ? img : `http://localhost:5000/${img}`))
          : prod.image
          ? [prod.image.startsWith("http") ? prod.image : `http://localhost:5000/${prod.image}`]
          : ["https://via.placeholder.com/250x280?text=No+Image"];
        const currentImage = images[0]; // single image for recently viewed
        const inWishlist = isInWishlist(prod.productId || prod._id);

        return (
          <div
            key={prod.productId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "15px",
              width: "250px",
              textAlign: "center",
              background: "#fff",
              overflow: "hidden",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onClick={() => goToProductPage({ _id: prod.productId })}
          >
            <div style={{ position: "relative", width: "100%", height: "280px", overflow: "hidden" }}>
              <img
                src={currentImage}
                alt={prod.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>

            <div style={{ padding: "10px", flexGrow: 1 }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "5px", fontWeight: 600 }}>{prod.name}</h3>
              <p>₹{prod.price}</p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 10px 10px",
              }}
            >
              <button
                style={{
                  background: "linear-gradient(135deg, #c95f7b, #b95771ff)",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                onClick={(e) => {
                  e.stopPropagation(); // prevent navigation
                  handleAddToCart({ _id: prod.productId, ...prod });
                }}
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #c95f7b, #cf6783ff)",
                  boxShadow: "0 4px 10px rgba(201, 95, 123, 0.4)",
                  cursor: "pointer",
                  border: "none",
                  outline: "none",
                  transition: "transform 0.3s",
                }}
                onClick={(e) => {
                  e.stopPropagation(); // prevent navigation
                  handleWishlistToggle({ _id: prod.productId, ...prod });
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15) rotate(10deg)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Heart size={18} fill={inWishlist ? "white" : "none"} stroke="white" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </>
)}

      </div>
    </>
  );
}

export default UserDashboard;
