import React, { useEffect, useState } from "react";
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
  const [submitting, setSubmitting] = useState({});
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  // ---- Helper: resolve image from many shapes ----
  const resolveImageSrc = (item, product) => {
    const candidates = [];

    if (product?.images) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach((img) => candidates.push(img));
      } else if (typeof product.images === "string") {
        candidates.push(product.images);
      }
    }

    if (product?.image) candidates.push(product.image);
    if (item?.image) candidates.push(item.image);
    if (item?.productImage) candidates.push(item.productImage);
    if (item?.imageUrl) candidates.push(item.imageUrl);

    for (let img of candidates) {
      if (!img) continue;
      if (typeof img === "object") {
        const url = img.url || img.path || img.filename || img.publicUrl || img.src;
        if (!url) continue;
        img = url;
      }
      if (typeof img !== "string") continue;
      if (/^https?:\/\//i.test(img)) return img;
      const clean = img.replace(/^\/+/, "");
      return `${BACKEND_URL}/${clean}`;
    }

    try {
      const maybe =
        product &&
        (product.thumbnail || product.thumb || product.imageUrl || product.img);
      if (maybe && typeof maybe === "string") {
        if (/^https?:\/\//i.test(maybe)) return maybe;
        return `${BACKEND_URL}/${maybe.replace(/^\/+/, "")}`;
      }
    } catch (e) {}

    return "https://dummyimage.com/100x100/ccc/fff&text=No+Image";
  };

  // ---- FIX: safely extract string ID from productId (handles populated objects) ----
  const resolveProductId = (item) => {
    const raw = item.productId || item.product?._id;
    if (!raw) return null;
    // If MongoDB populated the field, it becomes an object; extract _id string
    if (typeof raw === "object" && raw._id) return String(raw._id);
    return String(raw);
  };

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
                try {
                  // FIX: resolve productId safely before using in API call
                  const productId = resolveProductId(item);
                  if (!productId) return item;

                  const productRes = await axios.get(
                    `${BACKEND_URL}/api/products/${productId}`,
                    {
                      headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                      },
                    }
                  );

                  const product =
                    productRes.data.product || productRes.data;

                  return { ...item, product };
                } catch (err) {
                  console.error(
                    "Error fetching product for item:",
                    item,
                    err
                  );
                  return item;
                }
              })
            );
            return { ...order, items: itemsWithProducts };
          })
        );

        setOrders(ordersWithProducts);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
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

  // ---- FIX: Combined submitReview — sends rating AND comment in one consistent flow ----
  const submitReview = async (productId) => {
    // Validate rating
    const rating = parseInt(ratingInputs[productId], 10);
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      alert("Please select a star rating between 1 and 5 before submitting.");
      return;
    }

    const comment = (commentInputs[productId] || "").trim();
    if (!comment) {
      alert("Please enter a comment before submitting.");
      return;
    }

    setSubmitting((prev) => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Submit rating first
      await axios.post(
        `${BACKEND_URL}/api/products/${productId}/rate`,
        { rating },
        { headers }
      );

      // Submit comment second
      const commentRes = await axios.post(
        `${BACKEND_URL}/api/products/${productId}/comment`,
        { comment },
        { headers }
      );

      // Update local state with the latest product data
      const updatedProduct = commentRes.data.product || commentRes.data;

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.map((item) => {
            const itemProductId = resolveProductId(item);
            return itemProductId === productId
              ? { ...item, product: updatedProduct }
              : item;
          }),
        }))
      );

      // Clear inputs after successful submission
      setRatingInputs((prev) => ({ ...prev, [productId]: 0 }));
      setCommentInputs((prev) => ({ ...prev, [productId]: "" }));

      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Failed to submit review:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to submit review. Please try again.";
      alert(msg);
    } finally {
      setSubmitting((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const deleteReview = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${BACKEND_URL}/api/products/${productId}/comment`, {
        headers,
      });
      await axios.delete(`${BACKEND_URL}/api/products/${productId}/rate`, {
        headers,
      });

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.map((item) => {
            const itemProductId = resolveProductId(item);
            return itemProductId === productId
              ? {
                  ...item,
                  product: {
                    ...item.product,
                    reviews: (item.product?.reviews || []).filter(
                      (r) => r.user?._id !== currentUserId
                    ),
                  },
                }
              : item;
          }),
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
            Order #{recentlyCancelled.orderNumber || recentlyCancelled._id}{" "}
            cancelled.
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
                  <button
                    className="cancel-btn"
                    onClick={() => cancelOrder(order)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <p>Total: ₹{(order.totalAmount || 0).toFixed(2)}</p>
              <p>Payment: {(order.paymentMethod || "").toUpperCase()}</p>

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
                            idx < getStatusIndex(order.status)
                              ? "active-line"
                              : ""
                          }`}
                        ></div>
                      )}
                      <span
                        className={`step-label ${
                          active ? "active-label" : ""
                        }`}
                      >
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h4>Items:</h4>
              <div className="order-items">
                {order.items.map((item, index) => {
                  const product = item.product;
                  // FIX: use resolveProductId helper everywhere
                  const productId = resolveProductId(item);
                  const imageSrc = resolveImageSrc(item, product);

                  const canRateOrComment = order.status === "delivered";
                  const existingReview = product?.reviews?.find(
                    (r) =>
                      String(r.user?._id || r.user) === String(currentUserId)
                  );

                  return (
                    <div key={index} className="order-item">
                      <img
                        src={imageSrc}
                        alt={product?.name || item.name}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />

                      <div className="order-item-details">
                        <span>
                          {product?.name || item.name} × {item.quantity}
                        </span>
                        <span>
                          ₹
                          {(
                            (item.price || 0) * (item.quantity || 1)
                          ).toFixed(2)}
                        </span>

                        {existingReview && (
                          <div className="existing-review">
                            <div className="star-rating">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  style={{
                                    color:
                                      star <= existingReview.rating
                                        ? "#c95f7b"
                                        : "#ccc",
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {existingReview.comment && (
                              <p>{existingReview.comment}</p>
                            )}
                            <button onClick={() => deleteReview(productId)}>
                              Delete Review
                            </button>
                          </div>
                        )}

                        {/* FIX: Only show review form if no existing review */}
                        {canRateOrComment && productId && !existingReview && (
                          <div className="rate-comment-section">
                            {/* Star rating input */}
                            <div className="star-input">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= (ratingInputs[productId] || 0)
                                      ? "active"
                                      : ""
                                  }
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    setRatingInputs((prev) => ({
                                      ...prev,
                                      [productId]: star,
                                    }))
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>

                            {/* Comment input */}
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentInputs[productId] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [productId]: e.target.value,
                                }))
                              }
                            />

                            {/* FIX: Single combined submit button */}
                            <button
                              onClick={() => submitReview(productId)}
                              disabled={submitting[productId]}
                            >
                              {submitting[productId]
                                ? "Submitting..."
                                : "Submit Review"}
                            </button>

                            <button
                              className="see-reviews-btn"
                              onClick={() =>
                                navigate(`/my-reviews?productId=${productId}`)
                              }
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