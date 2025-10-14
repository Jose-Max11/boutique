import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./OrdersPage.css";

const BACKEND_URL = "http://localhost:5000";
const statusStages = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [recentlyCancelled, setRecentlyCancelled] = useState(null);

  // === Fetch orders from backend ===
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BACKEND_URL}/api/orders`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch orders");
      }
    };
    fetchOrders();
  }, []);

  const getStatusIndex = (status) => statusStages.indexOf(status);

  // === Cancel order ===
  const cancelOrder = async (order) => {
    const currentIndex = getStatusIndex(order.status);
    if (currentIndex >= 2) {
      alert("Cannot cancel an order that is already shipped or delivered!");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    // Remove from UI temporarily and allow undo
    setOrders((prev) => prev.filter((o) => o._id !== order._id));

    // Start undo timer
    const undoTimer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_URL}/api/orders/${order._id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setRecentlyCancelled(null); // clear after deletion
      } catch (err) {
        console.error(err);
        alert("Failed to cancel order in backend");
        // Re-add order to UI if delete fails
        setOrders((prev) => [order, ...prev]);
        setRecentlyCancelled(null);
      }
    }, 5000); // 5 seconds to undo

    setRecentlyCancelled({ ...order, undoTimer });
  };

  // === Undo cancel ===
  const undoCancel = () => {
    if (recentlyCancelled) {
      clearTimeout(recentlyCancelled.undoTimer);
      setOrders((prev) => [recentlyCancelled, ...prev]);
      setRecentlyCancelled(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="order-history-container">
        <h2>Your Orders</h2>

        {/* Undo notification */}
        {recentlyCancelled && (
          <div className="undo-notification">
            Order #{recentlyCancelled.orderNumber} cancelled.
            <button onClick={undoCancel}>Undo</button>
          </div>
        )}

        {orders.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            You have no orders yet.
          </p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.orderNumber}</h3>
                {getStatusIndex(order.status) < 2 && (
                  <button
                    className="cancel-btn"
                    onClick={() => cancelOrder(order)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <p>Total: ₹{order.totalAmount.toFixed(2)}</p>
              <p>Payment: {order.paymentMethod.toUpperCase()}</p>

              {/* Progress bar */}
              <div className="horizontal-progress">
                {statusStages.map((stage, idx) => {
                  const active = idx <= getStatusIndex(order.status);
                  return (
                    <div key={stage} className="step-container">
                      <div className={`circle ${active ? "active" : ""}`}>
                        {idx + 1}
                      </div>
                      {idx !== statusStages.length - 1 && (
                        <div
                          className={`line ${
                            idx < getStatusIndex(order.status) ? "active-line" : ""
                          }`}
                        ></div>
                      )}
                      <span className={`step-label ${active ? "active-label" : ""}`}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h4>Items:</h4>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={
                        item.image?.startsWith("http")
                          ? item.image
                          : `${BACKEND_URL}/${item.image}`
                      }
                      alt={item.name}
                      onError={(e) =>
                        (e.target.src =
                          "https://dummyimage.com/50x50/ccc/fff&text=No+Image")
                      }
                    />
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
