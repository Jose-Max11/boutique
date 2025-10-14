import { useEffect, useState } from "react";
import axios from "axios";
import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";
import "./DesignsPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function DesignsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCartWishlist();

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/products`);
        const productsWithImages = res.data.map((p) => ({
          ...p,
          images: Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : p.image
              ? [p.image]
              : [],
          currentImageIndex: 0,
        }));
        setProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Auto-slide images every 3s (pause on hover)
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
    wishlist.some((item) => item._id === product._id)
      ? removeFromWishlist(product._id)
      : addToWishlist(product);
  };

  const showProductModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleBuyNow = () => {
    navigate(`/designs/${selectedProduct._id}`);
    setShowModal(false);
  };

  const prevImage = () => {
    if (!selectedProduct?.images?.length) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    if (!selectedProduct?.images?.length) return;
    setActiveImageIndex((prev) =>
      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      <Navbar />
      <div className="designs-page-container">
        <h2 className="mb-4">Showcase Designs</h2>
        <div className="product-card-list">
          {products.length === 0 ? (
            <p className="no-products">No products available yet.</p>
          ) : (
            products.map((product) => {
              const images = product.images.length
                ? product.images.map((img) =>
                    img.startsWith("http") ? img : `${BACKEND_URL}/${img}`
                  )
                : ["https://via.placeholder.com/300x450?text=No+Image"];

              const currentImage =
                images[product.currentImageIndex] || images[0];

              const inWishlist = wishlist.some((item) => item._id === product._id);

              return (
                <div
                  className="product-card"
                  key={product._id}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div
                    className="product-image-box"
                    onClick={() => showProductModal(product)}
                  >
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="product-image fade-animation"
                    />

                    {product.discount && (
                      <span className="offer-badge">{product.discount}% off</span>
                    )}

                    {images.length > 1 && (
                      <div className="carousel-indicator">{images.length} images</div>
                    )}

                    {/* ⭐ Rating & 🚚 Free Delivery floating inside image */}
                    <div className="floating-badges">
                      <div className="badge rating-badge">
                        <Star size={14} fill="#00a82d" stroke="none" />
                        <span>{product.rating || "4.5"}</span>
                      </div>
                      <div className="badge delivery">
                        <Truck size={14} />
                        <span>Free Delivery</span>
                      </div>
                    </div>
                  </div>

                  <div className="product-info">
                    <h5>{product.name}</h5>
                    <span className="product-price">₹{product.price}</span>
                  </div>

                  <div className="product-actions">
                    <button
                      className="wish-btn"
                      onClick={() => handleWishListToggle(product)}
                    >
                      <Heart
                        size={20}
                        fill={inWishlist ? "white" : "none"}
                        stroke="white"
                      />
                    </button>
                    <button
                      className="cart-btn"
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

        {/* Modal */}
        {showModal && selectedProduct && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-carousel">
                {selectedProduct.images.length > 1 && (
                  <>
                    <button className="carousel-btn left" onClick={prevImage}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="carousel-btn right" onClick={nextImage}>
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <img
                  src={
                    selectedProduct.images[activeImageIndex]
                      ? selectedProduct.images[activeImageIndex].startsWith("http")
                        ? selectedProduct.images[activeImageIndex]
                        : `${BACKEND_URL}/${selectedProduct.images[activeImageIndex]}`
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={selectedProduct.name}
                  className="modal-image"
                />
              </div>
              <div className="modal-info">
                <h4>{selectedProduct.name}</h4>
                <p>{selectedProduct.description}</p>
                <p className="modal-price">₹{selectedProduct.price}</p>
                <div className="modal-buttons">
                  <button className="buy-now-btn" onClick={handleBuyNow}>
                    Buy it now
                  </button>
                  <button className="close-modal-btn" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
