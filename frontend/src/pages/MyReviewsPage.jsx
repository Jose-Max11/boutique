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
  const [saving, setSaving] = useState(false);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const productId = query.get("productId");

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

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // ================= UPDATE REVIEW =================
  const handleUpdate = async (review) => {
    // FIX: Validate before sending
    if (!updatedRating || isNaN(updatedRating) || updatedRating < 1 || updatedRating > 5) {
      alert("Please select a star rating between 1 and 5.");
      return;
    }
    if (!updatedComment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // FIX: Submit rating first, then comment sequentially with proper error handling
      await axios.post(
        `${BACKEND_URL}/api/products/${review.productId}/rate`,
        { rating: updatedRating },
        { headers }
      );

      await axios.post(
        `${BACKEND_URL}/api/products/${review.productId}/comment`,
        { comment: updatedComment.trim() },
        { headers }
      );

      setEditingReviewId(null);
      setUpdatedComment("");
      setUpdatedRating(0);

      // Refresh reviews after successful update
      await fetchReviews();

      alert("Review updated successfully!");
    } catch (err) {
      console.error("Failed to update review:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update review. Please try again.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE REVIEW =================
  const handleDelete = async (review) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // FIX: Delete both and refresh — order matters (comment first, then rating)
      await axios.delete(
        `${BACKEND_URL}/api/products/${review.productId}/comment`,
        { headers }
      );
      await axios.delete(
        `${BACKEND_URL}/api/products/${review.productId}/rate`,
        { headers }
      );

      // Refresh reviews after deletion
      await fetchReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete review.";
      alert(msg);
    }
  };

  return (
    <div>
      <Navbar />

      <div
        style={{
          padding: "16px",
          cursor: "pointer",
          fontSize: "1.2rem",
          color: "#000000ff",
        }}
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

                {/* Star display / edit */}
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
                        cursor:
                          editingReviewId === r.productId ? "pointer" : "default",
                        fontSize: "1.2rem",
                      }}
                      onClick={() => {
                        if (editingReviewId === r.productId)
                          setUpdatedRating(star);
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Comment display / edit */}
                {editingReviewId === r.productId ? (
                  <textarea
                    value={updatedComment}
                    onChange={(e) => setUpdatedComment(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                    placeholder="Write your updated comment..."
                  />
                ) : (
                  <p>Comment: {r.comment || "No comment"}</p>
                )}

                {/* Action buttons */}
                <div style={{ marginTop: "8px" }}>
                  {editingReviewId === r.productId ? (
                    <>
                      <button
                        onClick={() => handleUpdate(r)}
                        disabled={saving}
                        style={{
                          marginRight: "8px",
                          backgroundColor: "#c95f7b",
                          color: "#fff",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          cursor: saving ? "not-allowed" : "pointer",
                          opacity: saving ? 0.7 : 1,
                        }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingReviewId(null);
                          setUpdatedComment("");
                          setUpdatedRating(0);
                        }}
                        disabled={saving}
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