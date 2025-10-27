import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./OrdersPage.css";

const BACKEND_URL = "http://localhost:5000";
const statusStages = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [recentlyCancelled, setRecentlyCancelled] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BACKEND_URL}/api/orders`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        const ordersWithProducts = await Promise.all(
          res.data.orders.map(async (order) => {
            const itemsWithProducts = await Promise.all(
              order.items.map(async (item) => {
                if (!item.productId) return item;
                const productRes = await axios.get(
                  `${BACKEND_URL}/api/products/${item.productId}`,
                  { headers: { Authorization: token ? `Bearer ${token}` : "" } }
                );
                return { ...item, product: productRes.data };
              })
            );
            return { ...order, items: itemsWithProducts };
          })
        );

        setOrders(ordersWithProducts);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch orders");
      }
    };

    fetchOrders();
  }, []);

  const getStatusIndex = (status) => statusStages.indexOf(status);

  const cancelOrder = async (order) => {
    const currentIndex = getStatusIndex(order.status);
    if (currentIndex >= 2) {
      alert("Cannot cancel an order that is already shipped or delivered!");
      return;
    }
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setOrders((prev) => prev.filter((o) => o._id !== order._id));

    const undoTimer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_URL}/api/orders/${order._id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setRecentlyCancelled(null);
      } catch (err) {
        console.error(err);
        alert("Failed to cancel order in backend");
        setOrders((prev) => [order, ...prev]);
        setRecentlyCancelled(null);
      }
    }, 5000);

    setRecentlyCancelled({ ...order, undoTimer });
  };

  const undoCancel = () => {
    if (recentlyCancelled) {
      clearTimeout(recentlyCancelled.undoTimer);
      setOrders((prev) => [recentlyCancelled, ...prev]);
      setRecentlyCancelled(null);
    }
  };

  const submitRating = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const rating = parseInt(ratingInputs[productId], 10);
      if (!rating || rating < 1 || rating > 5)
        return alert("Select a rating between 1 and 5");

      const res = await axios.post(
        `${BACKEND_URL}/api/products/${productId}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            (item.productId || item.product?._id) === productId
              ? { ...item, product: res.data.product }
              : item
          ),
        }))
      );

      setRatingInputs({ ...ratingInputs, [productId]: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add rating");
    }
  };

  const submitComment = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const comment = commentInputs[productId] || "";
      if (!comment) return alert("Enter a comment");

      const res = await axios.post(
        `${BACKEND_URL}/api/products/${productId}/comment`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            (item.productId || item.product?._id) === productId
              ? { ...item, product: res.data.product }
              : item
          ),
        }))
      );

      setCommentInputs({ ...commentInputs, [productId]: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteReview = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${BACKEND_URL}/api/products/${productId}/comment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await axios.delete(`${BACKEND_URL}/api/products/${productId}/rate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            (item.productId || item.product?._id) === productId
              ? { ...item, product: { ...item.product, reviews: [] } }
              : item
          ),
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="order-history-container">
        <h2>Your Orders</h2>

        {recentlyCancelled && (
          <div className="undo-notification">
            Order #{recentlyCancelled.orderNumber || recentlyCancelled._id} cancelled.
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
                <h3>Order #{order.orderNumber || order._id}</h3>
                {getStatusIndex(order.status) < 2 && (
                  <button className="cancel-btn" onClick={() => cancelOrder(order)}>
                    Cancel Order
                  </button>
                )}
              </div>

              <p>Total: ₹{order.totalAmount.toFixed(2)}</p>
              <p>Payment: {order.paymentMethod.toUpperCase()}</p>

              <div className="horizontal-progress">
                {statusStages.map((stage, idx) => {
                  const active = idx <= getStatusIndex(order.status);
                  return (
                    <div key={stage} className="step-container">
                      <div className={`circle ${active ? "active" : ""}`}>{idx + 1}</div>
                      {idx !== statusStages.length - 1 && (
                        <div className={`line ${idx < getStatusIndex(order.status) ? "active-line" : ""}`}></div>
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
                {order.items.map((item, index) => {
                  const productId = item.productId || item.product?._id;
                  const canRateOrComment = order.status === "delivered";
                  const existingReview = item.product?.reviews?.find(
                    (r) => r.user?._id === currentUserId
                  );

                  return (
                    <div key={index} className="order-item">
                      <img
                        src={
                          item.image
                            ? item.image.startsWith("http")
                              ? item.image
                              : `${BACKEND_URL}/${item.image}`
                            : "https://dummyimage.com/50x50/ccc/fff&text=No+Image"
                        }
                        alt={item.name}
                      />
                      <div className="order-item-details">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>

                        {existingReview && (
                          <div className="existing-review">
                            <div className="star-rating">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  style={{ color: star <= existingReview.rating ? "#c95f7b" : "#ccc" }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {existingReview.comment && <p>{existingReview.comment}</p>}
                            <button onClick={() => deleteReview(productId)}>Delete Review</button>
                          </div>
                        )}

                        {canRateOrComment && productId && (
                          <div className="rate-comment-section">
                            {/* ⭐ Star Rating Input */}
                            <div className="star-input">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={star <= (ratingInputs[productId] || 0) ? "active" : ""}
                                  onClick={() =>
                                    setRatingInputs({ ...ratingInputs, [productId]: star })
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>

                            <button onClick={() => submitRating(productId)}>Submit Rating</button>

                            <input
                              type="text"
                              placeholder="Add comment"
                              value={commentInputs[productId] || ""}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [productId]: e.target.value })
                              }
                            />
                            <button onClick={() => submitComment(productId)}>Submit Comment</button>

                            <button
                              className="see-reviews-btn"
                              onClick={() => navigate(`/my-reviews?productId=${productId}`)}
                            >
                              See Reviews
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
