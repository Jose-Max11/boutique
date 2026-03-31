// src/pages/admin/CustomersPage.jsx - UPDATED WITH VIEW ORDERS
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./CustomersPage.css";

const BACKEND_URL = "http://localhost:5000";

const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Safe search functionality
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        (customer.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/customers/with-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data || []);
      setFilteredCustomers(res.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      Swal.fire("Error", "Failed to fetch customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCustomers();
    Swal.fire({
      icon: "success",
      title: "Refreshed!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // NEW: View Orders for specific customer
  const handleViewOrders = async (customerId) => {
    try {
      // Navigate to customer-specific orders page with customer ID
      navigate(`/admin/customer-orders/${customerId}`);
    } catch (err) {
      Swal.fire("Error", "Failed to load customer orders", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No orders";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="customers-page-container">
      <h2>All Customers</h2>

      {/* Search Bar */}
      <div className="search-wrapper">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#c95f7b' }}>
          Loading customers...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#c95f7b' }}>
          <h3>No Customers Found</h3>
          <button className="refresh-btn" onClick={handleRefresh} style={{ 
            background: 'linear-gradient(90deg, #c95f7b, #ff9bb3)', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '25px',
            cursor: 'pointer'
          }}>
            Try Refresh
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name || "Unknown"}</td>
                  <td>{customer.email || "No email"}</td>
                  <td>{customer.role || "user"}</td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : "No orders"}</td>
                  <td>
                    <button 
                      className="view-orders-btn"
                      onClick={() => handleViewOrders(customer._id)}
                    >
                      View Orders
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
