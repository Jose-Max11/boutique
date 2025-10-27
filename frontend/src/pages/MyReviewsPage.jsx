import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./OrdersPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [updatedComment, setUpdatedComment] = useState("");
  const [updatedRating, setUpdatedRating] = useState(0);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const productId = query.get("productId");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BACKEND_URL}/api/products/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = productId
          ? res.data.filter((r) => r.productId === productId)
          : res.data;

        setReviews(filtered);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        alert("Failed to fetch reviews");
      }
    };

    fetchReviews();
  }, [productId]);

  // ================= UPDATE REVIEW =================
  const handleUpdate = async (review) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BACKEND_URL}/api/products/${review.productId}/rate`,
        { rating: updatedRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `${BACKEND_URL}/api/products/${review.productId}/comment`,
        { comment: updatedComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh reviews after update
      setEditingReviewId(null);
      setUpdatedComment("");
      setUpdatedRating(0);
      const res = await axios.get(`${BACKEND_URL}/api/products/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(productId ? res.data.filter((r) => r.productId === productId) : res.data);
    } catch (err) {
      console.error("Failed to update review:", err);
      alert("Failed to update review");
    }
  };

  // ================= DELETE REVIEW =================
  const handleDelete = async (review) => {
    try {
      const token = localStorage.getItem("token");

      // Delete rating
      await axios.delete(`${BACKEND_URL}/api/products/${review.productId}/rate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Delete comment
      await axios.delete(`${BACKEND_URL}/api/products/${review.productId}/comment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh reviews
      const res = await axios.get(`${BACKEND_URL}/api/products/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(productId ? res.data.filter((r) => r.productId === productId) : res.data);
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert("Failed to delete review");
    }
  };

  return (
    <div>
      <Navbar />

      {/* ===== Go Back Button ===== */}
    <div
  style={{ padding: "16px", cursor: "pointer", fontSize: "1.2rem", color: "#000000ff" }}
  onClick={() => window.history.back()}
>
  ← Go Back
</div>

      <div className="reviews-container">
        <h2>My Reviews</h2>

        {reviews.length === 0 ? (
          <p>You have not submitted any reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.productId} className="review-card">
              <img
                src={
                  r.images?.length > 0
                    ? `${BACKEND_URL}/${r.images[0]}`
                    : "https://dummyimage.com/80x80/ccc/fff&text=No+Image"
                }
                alt={r.name}
              />
              <div className="review-details">
                <h3>{r.name}</h3>
                <p>Category: {r.category || "N/A"}</p>

                <div>
                  Rating:{" "}
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        color:
                          editingReviewId === r.productId
                            ? star <= updatedRating
                              ? "#fef218ff"
                              : "#ccc"
                            : star <= r.rating
                            ? "#fef218ff"
                            : "#ccc",
                        cursor: editingReviewId === r.productId ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (editingReviewId === r.productId) setUpdatedRating(star);
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {editingReviewId === r.productId ? (
                  <textarea
                    value={updatedComment}
                    onChange={(e) => setUpdatedComment(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                  />
                ) : (
                  <p>Comment: {r.comment || "No comment"}</p>
                )}

                <div style={{ marginTop: "8px" }}>
                  {editingReviewId === r.productId ? (
                    <>
                      <button
                        onClick={() => handleUpdate(r)}
                        style={{
                          marginRight: "8px",
                          backgroundColor: "#c95f7b",
                          color: "#fff",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        style={{
                          backgroundColor: "#eee",
                          color: "#333",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingReviewId(r.productId);
                          setUpdatedComment(r.comment || "");
                          setUpdatedRating(r.rating || 0);
                        }}
                        style={{
                          marginRight: "8px",
                          backgroundColor: "#161b3bff",
                          color: "#fff",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        style={{
                          backgroundColor: "#ff4d4f",
                          color: "#fff",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
