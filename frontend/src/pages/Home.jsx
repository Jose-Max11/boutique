import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import "./Home.css";
import { ArrowRight, Brain, Book, Pencil, Eye, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Hero carousel
  const [hoveredProductId, setHoveredProductId] = useState(null); // Pause on hover
  const categoriesPerPage = 4;
  const navigate = useNavigate();

  const heroImages = [
    "/images/bg5.jpg",
    "/images/bg6.jpg",
    "/images/bg7.jpg",
    "/images/bg8.jpg",
    "/images/bg10.jpg",
    "/images/image.png",
    "/images/hero.jpg",
    "/images/bg.jpg",
    "/images/joy.png",
    "/images/bg1.jpg",
    "/images/bg2.jpg",
    "/images/bg3.jpg",
    "/images/bg4.jpg",
  ];

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/products`);
        const productsWithImages = res.data.map((prod) => ({
          ...prod,
          images: Array.isArray(prod.images) && prod.images.length > 0
            ? prod.images
            : prod.image
              ? [prod.image]
              : [],
          currentImageIndex: 0, // For auto-sliding product images
        }));
        setProducts(productsWithImages);

        // Build dynamic categories
        const map = new Map();
        productsWithImages.forEach((prod) => {
          if (prod.category) {
            if (!map.has(prod.category._id)) {
              map.set(prod.category._id, {
                id: prod.category._id,
                name: prod.category.name,
                image: prod.images[0]
                  ? prod.images[0].startsWith("http")
                    ? prod.images[0]
                    : `${BACKEND_URL}/${prod.images[0]}`
                  : "/images/default-category.jpg",
              });
            }
          }
        });
        setCategories(Array.from(map.values()));
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Hero auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Product images auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.images.length > 1 && hoveredProductId !== prod._id) {
            const nextIndex = (prod.currentImageIndex + 1) % prod.images.length;
            return { ...prod, currentImageIndex: nextIndex };
          }
          return prod;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [hoveredProductId, products]);

  // Pagination
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const handleCategoryClick = (catId) => navigate(`/category/${catId}`);
  const handleProductClick = (categoryId) => {
    if (categoryId) navigate(`/category/${categoryId}`);
  };

  return (
    <div className="app">
      <Navbar />

      {/* Hero Section */}
      <div className="hero-wrapper">
        <div
          className="home-hero fade-slide"
          style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
        >
          <div className="hero-content">
            <h1 className="home-title">Welcome to Jose Boutique 👗</h1>
            <p className="home-subtitle">
              Explore our latest designer collections and shop online with ease.
            </p>
            <Link to="/designs">
              <button className="home-btn">Shop Now</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="categories-section">
        <h2>Shop by Categories</h2>
        <div className="categories-carousel">
          {currentCategories.map((cat) => (
            <div
              className="category-card"
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <img src={cat.image} alt={cat.name} />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="sections-wrapper">
        <div className="section-card">
          <h2>Our Exclusive Designs</h2>
          <p>At Jose Boutique, we bring you a wide variety of premium designer outfits...</p>
          <Link to="/designs">
            <div className="section-icon"><Eye size={28} color="#fff" /></div>
          </Link>
        </div>
        <div className="section-card">
          <h2>Create Your Own Style ✨</h2>
          <p>Customize your dress the way you like...</p>
          <Link to="/customize">
            <div className="section-icon"><Brain size={28} color="#fff" /></div>
          </Link>
        </div>
        <div className="section-card">
          <h2>Meet Our Designers</h2>
          <p>Our talented designers bring creativity and craftsmanship together...</p>
          <Link to="/designers">
            <div className="section-icon"><User size={28} color="#fff" /></div>
          </Link>
        </div>
        <div className="section-card">
          <h2>What Our Customers Say 💬</h2>
          <p>Share your experience and read what others have to say.</p>
          <Link to="/review">
            <div className="section-icon">
              <Book size={28} color="#fff" />
              <Pencil size={18} color="#fff" className="pencil-icon" />
            </div>
          </Link>
        </div>
      </div>

      {/* Latest Products */}
      <div className="products-section">
        <h2><center>Latest Products</center></h2>
        <div className="products-grid">
          {products.length === 0 ? (
            <p className="no-products">No products available yet.</p>
          ) : (
            products.map((prod) => {
              const images = prod.images.length
                ? prod.images.map((img) =>
                    img.startsWith("http") ? img : `${BACKEND_URL}/${img}`
                  )
                : ["https://via.placeholder.com/300x450?text=No+Image"];

              const currentImage = images[prod.currentImageIndex] || images[0];

              return (
                <div
                  className="product-card"
                  key={prod._id}
                  onClick={() => handleProductClick(prod.category?._id)}
                  onMouseEnter={() => setHoveredProductId(prod._id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                  style={{ cursor: prod.category ? "pointer" : "default" }}
                >
                  <img src={currentImage} alt={prod.name} loading="lazy" />
                  <h3>{prod.name}</h3>
                  <p className="category">{prod.category?.name || "Uncategorized"}</p>
                  <p className="price">₹{prod.price}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
