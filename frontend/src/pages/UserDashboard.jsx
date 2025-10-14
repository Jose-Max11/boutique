import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useCartWishlist } from "./CartWishlistContext"; // import your context

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCartWishlist(); // include remove

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
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchUserData();
    fetchProducts();
  }, [navigate]);

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

  const goToProductPage = (product) => navigate(`/product/${product._id}`);

  if (!user) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading user data...
      </p>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Poppins:wght@300;400;600&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          font-family: Poppins, sans-serif;
          font-weight : 900;
          background-size: cover;
        }

        .dashboard-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          padding-top: 80px;
          box-sizing: border-box;
          overflow-y: auto;
          background: transparent;
        }

        .dashboard-header {
          background: url("/images/userbg.jpg") no-repeat center center;
          background-size: cover;
          position: relative;
          width: 80%;
          max-width: 600px;
          margin: 20px auto;
          border-radius: 20px;
          padding: 80px 30px;
          min-height: 300px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          font-family: 'Roboto Slab', 'Poppins', sans-serif;
          font-weight : 900;
          color: #fff;
        }

        .dashboard-header h1, .dashboard-header p {
          position: relative;
          z-index: 1;
        }

        .dashboard-header:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 0 3px 8px;
        }

        .dashboard-header p {
          font-size: 1rem;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 6px rgba(141, 141, 141, 0.4);
        }

        .products-grid { display:flex; flex-wrap:wrap; gap:20px; justify-content:center; padding:0 20px 20px; }

        .product-card { 
          border:1px solid #ccc; 
          border-radius:8px; 
          width:250px; 
          text-align:center; 
          background:#fff; 
          transition:0.3s; 
          display:flex; 
          flex-direction:column; 
          justify-content:flex-start; 
          overflow:hidden; 
          position:relative; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .product-card img { width:100%; height:280px; object-fit:cover; cursor:pointer; }
        .product-info { padding:10px; flex-grow:1; }
        .product-info h3 { font-size:1.1rem; margin-bottom:5px; font-weight:600; }
        .product-info p { font-size:0.9rem; margin:2px 0; color:#555; }

        .product-actions { display:flex; justify-content:space-between; align-items:center; padding:0 10px 10px; }

        .add-to-cart {
          background: linear-gradient(135deg, #c95f7b, #b95771ff);
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease-in-out;
          box-shadow: 0 4px 10px rgba(201, 95, 123, 0.3);
          display:flex;
          align-items:center;
          gap:5px;
        }
        .add-to-cart:hover {
          background: linear-gradient(135deg, #b04f6b, #d67691);
          transform: scale(1.05);
          box-shadow: 0 6px 14px rgba(201, 95, 123, 0.5);
        }

        .heart-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #c95f7b, #cf6783ff);
          box-shadow: 0 4px 10px rgba(201, 95, 123, 0.4);
          cursor: pointer;
          border: none;
          outline: none;
          transition: transform 0.2s ease;
        }
        .heart-btn:hover {
          transform: scale(1.15) rotate(10deg);
          box-shadow: 0 6px 14px rgba(201, 95, 123, 0.6);
        }
        .heart-btn svg { transition: fill 0.3s ease, transform 0.3s ease; }

        @media (max-width:768px){ 
          .product-card{ width:180px;} 
          .product-card img{ height:220px;} 
          .dashboard-header { width: 90%; padding: 40px 20px; }
        }
        @media (max-width:480px){ 
          .product-card{ width:150px;} 
          .product-card img{ height:170px;} 
          .dashboard-header { width: 95%; padding: 30px 15px; }
        }
      `}</style>

      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user.name} 👋</h1>
          <p>{user.email}</p>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
         <strong> Your Recommended Products</strong>
        </h2>

        <div className="products-grid">
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            products.map((prod) => (
              <div className="product-card" key={prod._id}>
                {prod.image && (
                  <img
                    src={`http://localhost:5000/${prod.image}`}
                    alt={prod.name}
                    onClick={() => goToProductPage(prod)}
                  />
                )}
                <div className="product-info">
                  <h3>{prod.name}</h3>
                  <p>{prod.category?.name || "Uncategorized"}</p>
                  <p>₹{prod.price}</p>
                </div>
                <div className="product-actions">
                  <button
                    className="add-to-cart"
                    onClick={() => handleAddToCart(prod)}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>

                  <button
                    className="heart-btn"
                    onClick={() => handleWishlistToggle(prod)}
                  >
                    <Heart
                      size={18}
                      fill={isInWishlist(prod._id) ? "white" : "none"}
                      stroke="white"
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
