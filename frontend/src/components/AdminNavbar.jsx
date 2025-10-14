import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Box,
  ShoppingCart,
  Users,
  Truck,
  BarChart2,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import axios from "axios";
import "./AdminNavbar.css";

function AdminNavbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch pending orders
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pending = res.data.orders.filter(order => order.status === "pending");
        setPendingOrders(pending);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Scroll to specific order in table
  const handleScrollToOrder = (orderId) => {
    setShowDropdown(false); // close dropdown
    const element = document.getElementById(`order-${orderId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // temporary highlight
      element.style.backgroundColor = "#ffe3ec";
      setTimeout(() => { element.style.backgroundColor = ""; }, 2000);
    }
  };

  return (
    <>
      <nav className="admin-navbar">
        <div className="navbar-logo">Jose Admin</div>

        <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <ul className={`navbar-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <li onClick={() => navigate("/admin/dashboard")}><Home size={18} /> Dashboard</li>
          <li onClick={() => navigate("/admin/products")}><Box size={18} /> Products</li>
          <li onClick={() => navigate("/admin/categories")}><Box size={18} /> Categories</li>
          <li onClick={() => navigate("/admin/sales")}><ShoppingCart size={18} /> Orders</li>
          <li onClick={() => navigate("/admin/customers")}><Users size={18} /> Customers</li>
          <li onClick={() => navigate("/admin/suppliers")}><Truck size={18} /> Suppliers</li>
          <li onClick={() => navigate("/admin/reports")}><BarChart2 size={18} /> Reports</li>
          <li onClick={() => navigate("/admin/designers")}><User size={18} /> Designers</li>
          <li onClick={() => navigate("/admin/settings")}><Settings size={18} /> Settings</li>
        </ul>

        {/* Notification Bell */}
        <div className="navbar-bell" onClick={() => setShowDropdown(!showDropdown)} title="Pending Orders">
          <Bell size={20} />
          {pendingOrders.length > 0 && <span className="notification-badge">{pendingOrders.length}</span>}

          {showDropdown && pendingOrders.length > 0 && (
            <div className="bell-dropdown">
              <h4>Pending Orders</h4>
              {pendingOrders.map(order => (
                <div
                  key={order._id}
                  className="dropdown-item"
                  onClick={() => handleScrollToOrder(order._id)}
                >
                  Order #{order.orderNumber} - ₹{order.totalAmount.toFixed(2)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
        </button>
      </nav>
    </>
  );
}

export default AdminNavbar;
