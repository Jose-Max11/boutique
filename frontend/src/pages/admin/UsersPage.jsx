import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react"; // search icon
import "./CustomersPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function CustomersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setFilteredOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  if (loading) return <p>Loading all orders...</p>;

  return (
    <div className="customers-page-container">
      <h2>All Customer Orders</h2>

      {/* Centered search bar */}
      <div className="search-wrapper">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <table className="customers-orders-table">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>User Name</th>
            <th>User Email</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>House</th>
            <th>Road</th>
            <th>City</th>
            <th>State</th>
            <th>Pincode</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) =>
            order.items.map((item, index) => (
              <tr key={`${order._id}-${index}`}>
                {index === 0 && (
                  <>
                    <td rowSpan={order.items.length}>{order.orderNumber}</td>
                    <td rowSpan={order.items.length}>{order.userId.name}</td>
                    <td rowSpan={order.items.length}>{order.userId.email}</td>
                    <td rowSpan={order.items.length}>${order.totalAmount}</td>
                    <td rowSpan={order.items.length}>{order.status}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price}</td>
                    <td rowSpan={order.items.length}>{order.billingDetails.house}</td>
                    <td rowSpan={order.items.length}>{order.billingDetails.road}</td>
                    <td rowSpan={order.items.length}>{order.billingDetails.city}</td>
                    <td rowSpan={order.items.length}>{order.billingDetails.state}</td>
                    <td rowSpan={order.items.length}>{order.billingDetails.pincode}</td>
                    <td rowSpan={order.items.length}>
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </>
                )}
                {index !== 0 && (
                  <>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price}</td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
