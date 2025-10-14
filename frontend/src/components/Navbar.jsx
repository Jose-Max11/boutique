import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Search,
  ShoppingCart,
  Menu,
  X,
  Heart,
  User
} from "lucide-react";
import axios from "axios";
import { useCartWishlist } from "../pages/CartWishlistContext";
import SearchDrawer from "./SearchDrawer";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { cart, wishlist } = useCartWishlist();
  const searchRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Search API
  useEffect(() => {
    const fetchProducts = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/search?search=${searchTerm}`
        );
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDrawerOpen(true);
  };

  const handleProductClick = (productId) => {
    navigate(`/designs/${productId}`);
    setDrawerOpen(false);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg boutique-navbar ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <div className="container-fluid px-3">
          {/* Brand */}
          <Link className="navbar-brand fw-bold" to="/">
            Jose Boutique
          </Link>

          {/* Mobile menu button */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
          </button>

          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? "show" : ""}`}>
            {/* Nav links */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
              </li>

              {/* Categories dropdown */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  id="categoriesDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categories
                </Link>
                <ul className="dropdown-menu" aria-labelledby="categoriesDropdown">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat._id}>
                        <Link
                          className="dropdown-item"
                          to={`/category/${cat._id}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span className="dropdown-item text-muted">No categories yet</span>
                    </li>
                  )}
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/designs" onClick={() => setIsMobileMenuOpen(false)}>
                  Designs
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/customize" onClick={() => setIsMobileMenuOpen(false)}>
                  Customize
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/designers" onClick={() => setIsMobileMenuOpen(false)}>
                  Designers
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reviews" onClick={() => setIsMobileMenuOpen(false)}>
                  Reviews
                </Link>
              </li>
            </ul>

            {/* Right side */}
            <div className="d-flex align-items-center flex-wrap">
              {/* Search input */}
              <div className="me-2 mb-2 mb-lg-0 position-relative" ref={searchRef}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ width: "160px" }}
                />
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#888",
                  }}
                />
              </div>

              {/* Cart */}
              <Link className="btn btn-light btn-sm position-relative me-2 mb-2 mb-lg-0" to="/cart">
                <ShoppingCart size={18} />
                {cart.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cart.length}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link className="btn btn-light btn-sm position-relative me-2 mb-2 mb-lg-0" to="/wishlist">
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Profile / Login / Logout */}
              {localStorage.getItem("token") ? (
                <div className="profile-dropdown me-2 mb-2 mb-lg-0 position-relative">
                  <button
                    className="btn btn-light btn-sm d-flex align-items-center"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <User size={18} className="me-1" />
                    Profile
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className="dropdown-menu show position-absolute mt-1"
                      style={{ minWidth: "180px" }}
                    >
                      <Link
                        className="dropdown-item"
                        to="/my-orders"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link className="btn btn-outline-light btn-sm" to="/login">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Drawer */}
      <SearchDrawer
        isOpen={drawerOpen}
        products={searchResults}
        onClose={closeDrawer}
        onProductClick={handleProductClick}
      />
    </>
  );
}
