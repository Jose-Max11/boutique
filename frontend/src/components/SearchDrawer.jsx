import React, { useState, useEffect } from "react";

const BACKEND_URL = "http://localhost:5000";

const SearchDrawer = ({ isOpen, products = [], onClose, onProductClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedProducts, setSortedProducts] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSortedProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();

    const matched = products.filter((p) => {
      if (p.name?.toLowerCase().includes(query)) return true;
      if (p.category?.name?.toLowerCase().includes(query)) return true;
      if (p.designer?.name?.toLowerCase().includes(query)) return true;
      if (
        p.colorLabels?.some((label) =>
          label?.toLowerCase().includes(query)
        )
      )
        return true;
      return false;
    });

    const nonMatched = products.filter((p) => !matched.includes(p));
    setSortedProducts([...matched, ...nonMatched]);
  }, [searchQuery, products]);

  const getImageUrl = (product) => {
    if (product.images?.length > 0) {
      const img = product.images[0];
      return img.startsWith("http") ? img : `${BACKEND_URL}/${img}`;
    }
    if (product.image) {
      return product.image.startsWith("http")
        ? product.image
        : `${BACKEND_URL}/${product.image}`;
    }
    return "/placeholder.png";
  };

  return (
    <>
      <style>{`
        .search-drawer {
          position: fixed;
          top: -100%;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 800px;
          height: 75vh;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 6px 25px rgba(0,0,0,0.25);
          transition: top 0.4s ease-in-out;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .search-drawer.open { top: 80px; }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #c95f7b;
          color: white;
          padding: 14px 20px;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }
        .drawer-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
        .close-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; }
        .search-input-container { padding: 16px; background: #fff5f7; }
        .search-input-container input {
          width: 100%; padding: 12px 16px; border-radius: 10px; border: 1.5px solid #c95f7b;
          font-size: 16px; outline: none; transition: all 0.2s;
        }
        .search-input-container input:focus { box-shadow: 0 0 5px #c95f7b; }
        .drawer-content { flex: 1; overflow-y: auto; padding: 20px; background: #fff; }
        .product-item {
          display: flex; align-items: center; background: #fff5f7;
          border-radius: 16px; box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          margin-bottom: 16px; cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-item:hover { transform: scale(1.02); box-shadow: 0 5px 12px rgba(0,0,0,0.15); }
        .product-item img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; margin: 10px 16px; border: 2px solid #13142b; background: #fff; }
        .product-info { display: flex; flex-direction: column; }
        .product-info h4 { margin: 0; font-size: 17px; color: #c95f7b; }
        .product-info p { margin: 4px 0 0; font-size: 14px; color: #555; }
        .color-labels { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
        .color-label { display: flex; align-items: center; gap: 4px; padding: 2px 6px; background: #f0f0f0; border-radius: 12px; font-size: 13px; color: #13142b; }
        .color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid #ccc; }
        .no-results { text-align: center; color: #777; margin-top: 40px; font-size: 16px; }
        .drawer-content::-webkit-scrollbar { width: 8px; }
        .drawer-content::-webkit-scrollbar-thumb { background: #c95f7b; border-radius: 10px; }
        @media (max-width: 600px) {
          .search-drawer { width: 95%; height: 70vh; }
          .product-item img { width: 70px; height: 70px; margin: 8px 12px; }
          .product-info h4 { font-size: 15px; }
          .product-info p { font-size: 13px; }
          .color-label { font-size: 12px; padding: 2px 5px; }
          .color-dot { width: 10px; height: 10px; }
        }
      `}</style>

      <div className={`search-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>Search Products</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search for dresses, categories, designers, or colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="drawer-content">
          {searchQuery &&
            !sortedProducts.some((p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.designer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.colorLabels?.some((label) => label?.toLowerCase().includes(searchQuery.toLowerCase()))
            ) && (
              <div className="no-results">
                <img src="/no-product.png" alt="No product" />
                <p>No results found for “{searchQuery}”</p>
              </div>
          )}

          {sortedProducts.map((product) => {
            const imageUrl = getImageUrl(product);

            // Convert color string to array if needed
            const colorsArray = Array.isArray(product.color)
              ? product.color
              : product.color?.split(",").map(c => c.trim()) || [];

            return (
              <div
                key={product._id}
                className="product-item"
                onClick={() => { onProductClick(product._id); onClose(); }}
              >
                <img src={imageUrl} alt={product.name} />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>₹{product.price}</p>
                  <p>
                    {product.category?.name ? `Category: ${product.category.name}` : ""}
                    {product.designer?.name ? ` | Designer: ${product.designer.name}` : ""}
                  </p>
                  <div className="color-labels">
                    {colorsArray.map((clr, idx) => (
                      <div className="color-label" key={idx}>
                        <span className="color-dot" style={{ backgroundColor: clr }}></span>
                        <span>{product.colorLabels?.[idx] || clr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SearchDrawer;
