import React from "react";
import "./SearchDrawer.css";

const SearchDrawer = ({ isOpen, products, onClose, onProductClick }) => {
  const backendUrl = "http://localhost:5000"; // your backend server

  return (
    <div className={`search-drawer ${isOpen ? "open" : ""}`}>
      <div className="drawer-header">
        <h3>Search Results</h3>
        <button onClick={onClose}>X</button>
      </div>

      <div className="drawer-content">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product._id}
              className="product-item"
              onClick={() => {
                onProductClick(product._id); // ✅ redirect to designs/:id
                onClose(); // close drawer after navigation
              }}
              style={{ cursor: "pointer" }} // make it clear it’s clickable
            >
              <img
                src={
                  product.image
                    ? `${backendUrl}/${product.image}`
                    : "/placeholder.png"
                }
                alt={product.name}
              />
              <div className="product-info">
                <h4>{product.name}</h4>
                <p>${product.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchDrawer;
