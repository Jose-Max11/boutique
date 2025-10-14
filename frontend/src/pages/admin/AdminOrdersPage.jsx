import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrdersPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/admin/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return "badge-pending";
      case "confirmed": return "badge-confirmed";
      case "shipped": return "badge-shipped";
      case "delivered": return "badge-delivered";
      case "cancelled": return "badge-cancelled";
      default: return "";
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading orders...</div>;

  return (
    <div className="admin-orders-container">
      <h2>All Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Customer Email</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) =>
              order.items.map((item, index) => (
                <tr key={`${order._id}-${item._id}`}>
                  {index === 0 && (
                    <>
                      <td rowSpan={order.items.length}>{order.orderNumber}</td>
                      <td rowSpan={order.items.length}>
                        {order.userId?.name || order.billingDetails.name}
                      </td>
                      <td rowSpan={order.items.length}>
                        {order.userId?.email || "No email"}
                      </td>
                    </>
                  )}
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  {index === 0 && (
                    <>
                      <td rowSpan={order.items.length}>₹{order.totalAmount.toFixed(2)}</td>
                      <td rowSpan={order.items.length}>{order.paymentMethod}</td>
                      <td rowSpan={order.items.length}>
                        <span className={`status-badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td rowSpan={order.items.length}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
