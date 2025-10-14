// components/SearchDropdown.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchDropdown.css";

function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/search?q=${query}`
        );
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    // Optionally navigate to product page
    // navigate(`/product/${item._id}`);
  };

  return (
    <div className="search-dropdown">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => query && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
      {showDropdown && results.length > 0 && (
        <ul className="dropdown-list">
          {results.map((item) => (
            <li key={item._id} onClick={() => handleSelect(item)}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="dropdown-img"
                />
              )}
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchDropdown;
