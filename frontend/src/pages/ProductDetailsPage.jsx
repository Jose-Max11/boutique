// src/pages/ProductDetailsPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCartWishlist } from "./CartWishlistContext";
import "./ProducDetailsPage.css";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } = useCartWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const carouselRef = useRef(null);

  const BACKEND_URL = "http://localhost:5000";

  const getImageUrl = (img) => {
    if (!img) return "";
    const path = img.startsWith("/") ? img.slice(1) : img;
    return `${BACKEND_URL}/${path}`;
  };

  const cleanColorLabels = (labels) => {
    if (!labels) return [];
    if (typeof labels === "string") {
      try {
        const parsed = JSON.parse(labels);
        if (Array.isArray(parsed)) return parsed.filter((l) => l && l.trim() !== "");
      } catch (e) {
        return labels
          .split(",")
          .map((l) => l.replace(/[[\]"]/g, "").trim())
          .filter((l) => l !== "");
      }
    }
    return labels
      .map((l) => (typeof l === "string" ? l.replace(/[[\]"]/g, "").trim() : l))
      .filter((l) => l !== "");
  };

  const addToRecentlyViewed = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5000/user/recently-viewed",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error adding recently viewed:", err);
    }
  };

  // ===== CORRECTED: moved inside the component =====
  useEffect(() => {
    if (product?._id) {
      addToRecentlyViewed(product._id);
    }
  }, [product?._id]);

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/products/${id}`);
        setProduct(res.data);
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (location.state?.product) {
          addToCart(res.data);
        }
      } catch (err) {
        console.error(err);
        alert("Product not found");
        navigate("/designs");
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (product && product.category?._id) {
      axios
        .get(`${BACKEND_URL}/api/products/category/${product.category._id}/exclude/${product._id}`)
        .then((res) => setRelated(res.data))
        .catch((err) => console.error(err));
    }
  }, [product]);

  // Auto-scroll related products carousel
  useEffect(() => {
    const speed = 1;
    let reqId;
    const autoScroll = () => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft += speed;
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth) {
          carouselRef.current.scrollLeft = 0;
        }
      }
      reqId = requestAnimationFrame(autoScroll);
    };
    reqId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(reqId);
  }, [related]);

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate("/checkout", { state: { product } });
  };

  const handleWishListToggle = () => {
    if (wishlist.some((item) => item._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  if (!product) return <p className="loading">Loading product details...</p>;

  const cleanedLabels = cleanColorLabels(product.colorLabels);

  return (
    <>
      <Navbar />
      {/* ... rest of your JSX remains unchanged ... */}
       <div className="product-details-page">
        <div className="back-arrow" onClick={() => navigate("/designs")}>
          <ChevronLeft size={28} />
        </div>

        <div className="details-container">
          {/* Image Section */}
          <div className="image-section">
            {product.images?.length > 0 ? (
              <>
                <div className="main-image-wrapper">
                  <img
                    src={getImageUrl(product.images[activeImage])}
                    alt={product.name}
                    className="main-image"
                  />
                </div>
                <div className="thumbnail-list">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={getImageUrl(img)}
                      alt="thumbnail"
                      className={`thumbnail ${activeImage === i ? "active" : ""}`}
                      onClick={() => setActiveImage(i)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <img
                src="https://via.placeholder.com/400x500?text=No+Image"
                alt="No Image"
                className="main-image"
              />
            )}
          </div>

          {/* Info Section */}
          <div className="info-section">
            <h1 className="product-name">{product.name}</h1>
            <p className="description">{product.description || "No description available."}</p>
            <p className="price">₹{product.price}</p>

            <div className="button-group">
              <button className="add-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
              <button className="buy-now-btn" onClick={handleBuyNow}>Buy Now</button>
              <button className="wish-btn" onClick={handleWishListToggle}>
                {wishlist.some((item) => item._id === product._id)
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>
            </div>

            <div className="divider"></div>

            <h3>Product Details</h3>
            <div className="details-grid">
              <p><strong>Category:</strong> {product.category?.name || "-"}</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>Status:</strong> {product.status}</p>
              <p><strong>Discount:</strong> {product.discount || "0"}%</p>
              <p><strong>Seller:</strong> {product.sellerName || "-"}</p>
            </div>

            <h3>Attributes</h3>
            <ul className="attributes-list">
              <li><strong>Dress Type:</strong> {product.dressType || "-"}</li>
              <li><strong>Fabric Type:</strong> {product.fabricType || "-"}</li>
              <li><strong>Neck Type:</strong> {product.neckType || "-"}</li>
              <li><strong>Sleeve Type:</strong> {product.sleeveType || "-"}</li>
              <li><strong>Pattern:</strong> {product.pattern || "-"}</li>
              <li><strong>Occasion:</strong> {product.occasion || "-"}</li>
              <li><strong>Fit Type:</strong> {product.fitType || "-"}</li>
              <li><strong>Transparency:</strong> {product.transparency || "-"}</li>
              <li><strong>Length:</strong> {product.length || "-"}</li>
              <li><strong>Wash Care:</strong> {product.washCare || "-"}</li>
            </ul>

            <h3>Available Sizes</h3>
            <div className="size-boxes">
              {product.sizes?.length > 0 ? (
                product.sizes.map((s, i) => (
                  <span key={i} className="size">
                    {s.size} (₹{s.price})
                  </span>
                ))
              ) : (
                <span>-</span>
              )}
            </div>

            {/* ===== Colors + Ratings Side by Side ===== */}
            <h3>Colors & Ratings</h3>
            <div className="colors-ratings-container">
              {/* Colors */}
              <div className="color-list">
                {product.color?.length > 0 ? (
                  product.color.map((c, i) => {
                    let label = Array.isArray(product.colorLabels) 
                      ? product.colorLabels[i] || c 
                      : c;
                    label = String(label).replace(/[[\]\\"]/g, "").trim();
                    return (
                      <div key={i} className="color-item" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span
                          className="color-box"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: c,
                            cursor: "pointer",
                            border: c.toLowerCase() === "#ffffff" ? "1px solid #ccc" : "none",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                            transition: "transform 0.2s",
                          }}
                          title={label}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        ></span>
                        <small style={{ fontSize: "12px", marginTop: "5px", color: "#555" }}>
                          {label}
                        </small>
                      </div>
                    );
                  })
                ) : (
                  <span>-</span>
                )}
              </div>

        {/* Ratings */}
<div className="ratings-summary">
  <div className="average-rating">
    <h2>{product.averageRating?.toFixed(1) || 0} <span>★</span></h2>
    <p>{product.totalReviews || 0} Reviews, {product.reviews?.length || 0} Ratings</p>
  </div>
  <div className="rating-bars">
    {["Excellent", "Very Good", "Good", "Average", "Poor"].map((label, index) => {
      const count = product.reviews?.filter(r => r.rating === 5 - index).length || 0;
      const barClass = [
        "bar-fill",
        index === 0 ? "bar-excellent" :
        index === 1 ? "bar-verygood" :
        index === 2 ? "bar-good" :
        index === 3 ? "bar-average" :
        "bar-poor"
      ].join(" ");

      return (
        <div key={index} className="rating-bar">
          <span className="rating-label">{label}</span>
          <div className="bar-container">
            <div className={barClass} style={{ width: `${Math.min(count * 20, 100)}%` }}></div>
          </div>
          <span className="rating-count">{count}</span>
        </div>
      );
    })}
  </div>
</div>

            </div>
            {/* ===== End Colors + Ratings ===== */}
            <h3>User Reviews</h3>
<div className="reviews-section reviews-section-scroll">
  {product.reviews?.length > 0 ? (
    product.reviews.map((review, i) => {
      // Get initials from user name
      const initials = review.user?.name
        ? review.user.name
            .split(" ")
            .map((n) => n[0].toUpperCase())
            .join("")
        : "AN";

      return (
        <div key={i} className="review-card">
          <div className="review-header">
            <div className="user-info">
              <div className="user-avatar">{initials}</div>
              <div className="user-name">{review.user?.name || "Anonymous"}</div>
            </div>
            <div className="review-rating">{review.rating || 0} ★</div>
          </div>
          <p className="review-comment">
            {review.comment || "No comment provided."}
          </p>
          <small className="review-date">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
          </small>
        </div>
      );
    })
  ) : (
    <p>No reviews yet for this product.</p>
  )}
</div>

            

          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="related-section">
            <h2 className="related-title">Related Designs</h2>
            <div className="carousel-container">
              <button
                className="carousel-btn left"
                onClick={() =>
                  carouselRef.current.scrollBy({ left: -250, behavior: "smooth" })
                }
              >
                &#10094;
              </button>

              <div className="related-carousel" ref={carouselRef}>
                {related.map((item) => (
                  <div
                    key={item._id}
                    className="related-card rounded-card"
                    onClick={() => navigate(`/designs/${item._id}`)}
                  >
                    <img
                      src={
                        getImageUrl(item.images?.[0]) ||
                        "https://via.placeholder.com/200x250"
                      }
                      alt={item.name}
                    />
                    <div className="overlay">
                      <h4>{item.name}</h4>
                      <p>₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="carousel-btn right"
                onClick={() =>
                  carouselRef.current.scrollBy({ left: 250, behavior: "smooth" })
                }
              >
                &#10095;
              </button>
            </div>
          </div>
        )}
      </div>

    </>
  );
}
