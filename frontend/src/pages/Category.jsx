import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, Star } from "lucide-react";
import "./Category.css";

const BACKEND_URL = "http://localhost:5000";

export default function Category() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/categories/${id}/products`);
        if (res.data) {
          // Normalize products to always have an images array
          const productsWithImages = (res.data.products || []).map((p) => ({
            ...p,
            images: Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : p.image
                ? [p.image]
                : [],
            currentImageIndex: 0,
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

  return (
    <>
      <Navbar />

      <div className="category-page">
        <div className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </div>

        <h2 className="category-title">
          {categoryName ? `${categoryName} Products` : "Category Products"}
        </h2>

        {products.length === 0 ? (
          <p className="no-products">No products found in this category.</p>
        ) : (
          <div className="category-grid">
            {products.map((prod) => {
              const images = prod.images.length
                ? prod.images.map((img) =>
                    img.startsWith("http") ? img : `${BACKEND_URL}/${img}`
                  )
                : ["https://via.placeholder.com/300x450?text=No+Image"];

              const currentImage = images[prod.currentImageIndex] || images[0];

              return (
                <div
                  className="category-card"
                  key={prod._id}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div className="image-wrapper">
                    <img
                      src={currentImage}
                      alt={prod.name}
                      className="category-img fade-animation"
                    />

                    {prod.discount && (
                      <span className="offer-badge">{prod.discount}% off</span>
                    )}

                    {images.length > 1 && (
                      <div className="carousel-indicator">{images.length} images</div>
                    )}
                  </div>

                  <h3 className="category-name">{prod.name}</h3>

                  <p className="category-price">
                    ₹{prod.price}{" "}
                    {prod.originalPrice && (
                      <span className="old-price">₹{prod.originalPrice}</span>
                    )}
                  </p>

                  <div className="product-info">
                    <div className="rating-badge">
                      <Star size={14} fill="#00a82d" stroke="none" />
                      <span>{prod.rating || "4.3"}</span>
                    </div>
                    <span className="free-delivery">Free Delivery</span>
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
