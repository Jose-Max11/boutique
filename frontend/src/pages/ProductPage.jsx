import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart } from "lucide-react";
import Navbar from "../components/Navbar";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    alert(`Added ${product.name} to cart!`);
  };

  if (!product) return <p style={{ textAlign: "center", marginTop: "100px" }}>Loading...</p>;

  return (
    <>
      <style>{`
        .product-page { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          padding: 100px 20px 40px; 
          font-family: Poppins, sans-serif; 
        }
        .product-container {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          max-width: 1000px;
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .product-image {
          flex: 1;
          min-width: 300px;
          max-width: 450px;
        }
        .product-image img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          object-fit: cover;
        }
        .product-details {
          flex: 1;
          min-width: 280px;
        }
        .product-details h1 {
          font-size: 1.8rem;
          margin-bottom: 10px;
          color: #13142b;
        }
        .product-details .price {
          font-size: 1.4rem;
          font-weight: bold;
          color: #c95f7b;
          margin: 10px 0;
        }
        .product-details .category {
          font-size: 1rem;
          color: #666;
          margin-bottom: 10px;
        }
        .product-details .description {
          font-size: 0.95rem;
          margin-bottom: 20px;
          line-height: 1.6;
          color: #444;
        }
        .actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .add-to-cart {
          background: #c95f7b;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: 0.3s;
        }
        .add-to-cart:hover {
          background: #b04f6b;
        }
        .wishlist {
          cursor: pointer;
          transition: 0.3s;
        }
        .wishlist:hover {
          opacity: 0.7;
        }
        .back-btn {
          margin-top: 20px;
          background: none;
          border: none;
          color: #13142b;
          cursor: pointer;
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .product-container {
            flex-direction: column;
            align-items: center;
          }
          .product-details {
            text-align: center;
          }
        }
      `}</style>

      <Navbar />

      <div className="product-page">
        <div className="product-container">
          <div className="product-image">
            {product.image && (
              <img src={`http://localhost:5000/${product.image}`} alt={product.name} />
            )}
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>
            <p className="price">₹{product.price}</p>
            <p className="category">{product.category?.name || "Uncategorized"}</p>
            <p className="description">{product.description || "No description available."}</p>

            <div className="actions">
              <button className="add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
              <Heart
                size={28}
                color={favorited ? "red" : "gray"}
                className="wishlist"
                onClick={() => setFavorited(!favorited)}
              />
            </div>
          </div>
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Products</button>
      </div>
    </>
  );
}

export default ProductPage;
