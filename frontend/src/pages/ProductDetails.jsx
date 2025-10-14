import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    alert(`Added ${quantity} x ${product.name} (Size: ${size}, Color: ${color}) to cart!`);
    // You can later call backend API to save cart
  };

  const handleBuyNow = () => {
    alert(`Order placed for ${quantity} x ${product.name} (Size: ${size}, Color: ${color})!`);
    // Redirect to checkout page if implemented
    navigate("/checkout");
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!product) return <p style={{ textAlign: "center" }}>Product not found</p>;

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", maxWidth: "900px", margin: "40px auto", gap: "30px" }}>
        <div>
          <img
            src={`http://localhost:5000/${product.image}`}
            alt={product.name}
            style={{ width: "400px", height: "500px", objectFit: "cover", borderRadius: "8px" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h2>{product.name}</h2>
          <p><strong>Category:</strong> {product.category?.name || "Uncategorized"}</p>
          <p><strong>Price:</strong> ₹{product.price}</p>
          <p><strong>Description:</strong> {product.description || "No description available"}</p>
          <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>

          <div style={{ marginTop: "20px" }}>
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ width: "100%", padding: "6px", marginBottom: "10px" }}
            />

            <label>Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              style={{ width: "100%", padding: "6px", marginBottom: "10px" }}
            >
              <option value="">Select Size</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>

            <label>Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: "100%", padding: "6px", marginBottom: "10px" }}
            >
              <option value="">Select Color</option>
              <option value="Red">Red</option>
              <option value="Black">Black</option>
              <option value="Blue">Blue</option>
              <option value="White">White</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
            <button
              style={{ padding: "10px 20px", background: "#c95f7b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              style={{ padding: "10px 20px", background: "#13142b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
