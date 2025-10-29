import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminCustomOrders.css";
import { Loader2, Package, User, Calendar, Image } from "lucide-react";
import { toast, Toaster } from "react-hot-toast"; // ✅ Added toast support

const BACKEND_URL = "http://localhost:5000";

const AdminCustomOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BACKEND_URL}/api/custom-orders/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (err) {
        console.error("Error fetching custom orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ✅ Fixed download handler
  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = imageUrl.split("/").pop() || "custom-order-image.jpg";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download the image. Please check backend static file access.");
    }
  };

  // ✅ Accept & Reject button handlers
  const handleAccept = (orderId) => {
    toast.success(`Order ${orderId.slice(-6)} Accepted ✅`);
    // Optional: send PUT to backend later
  };

  const handleReject = (orderId) => {
    toast.error(`Order ${orderId.slice(-6)} Rejected ❌`);
    // Optional: send PUT to backend later
  };

  return (
    <div className="admin-orders-container">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="admin-orders-title">Admin – Custom Orders</h1>

      {loading ? (
        <div className="loader-container">
          <Loader2 className="animate-spin w-10 h-10 text-[#c95f7b]" />
        </div>
      ) : orders.length === 0 ? (
        <p className="no-orders">No custom orders found.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <h2>
                  <Package /> Order #{order._id.slice(-6)}
                </h2>
                <Calendar size={18} color="#999" />
              </div>

              <div className="order-info">
                <p>
                  <User size={15} color="#c95f7b" />{" "}
                  <strong>Customer:</strong>{" "}
                  {order.user ? `${order.user.name} (${order.user.email})` : "N/A"}
                </p>
                <p><strong>Phone:</strong> {order.phone || "N/A"}</p>
                <p><strong>Designer:</strong> {order.designer || "Not assigned"}</p>
              </div>

              <div className="section">
                <h3>Blouse & Design Details</h3>
                <p><strong>Product Name:</strong> {order.productName || "N/A"}</p>
                <p><strong>Blouse Type:</strong> {order.blouseType || "N/A"}</p>
                <p><strong>Neck Type:</strong> {order.neckType || "N/A"}</p>
                <p><strong>Sleeve Type:</strong> {order.sleeveType || "N/A"}</p>
                <p><strong>Back Design:</strong> {order.backDesign || "N/A"}</p>
                <p><strong>Fit Type:</strong> {order.fitType || "N/A"}</p>
                <p><strong>Fabric Type:</strong> {order.fabricType || "N/A"}</p>
                <p><strong>Color:</strong> {order.color || "N/A"}</p>
                <p><strong>Lining:</strong> {order.lining || "N/A"}</p>
                <p><strong>Padding:</strong> {order.padding || "N/A"}</p>
                <p><strong>Hook/Zip Placement:</strong> {order.hookZipPlacement || "N/A"}</p>
              </div>

              <div className="section">
                <h3>Measurement Details</h3>
                <p><strong>Bust Size:</strong> {order.bustSize || "N/A"}</p>
                <p><strong>Under Bust:</strong> {order.underBust || "N/A"}</p>
                <p><strong>Waist Size:</strong> {order.waistSize || "N/A"}</p>
                <p><strong>Shoulder Size:</strong> {order.shoulderSize || "N/A"}</p>
                <p><strong>Arm Hole:</strong> {order.armHole || "N/A"}</p>
                <p><strong>Sleeve Length:</strong> {order.sleeveLength || "N/A"}</p>
                <p><strong>Front Neck Depth:</strong> {order.frontNeckDepth || "N/A"}</p>
                <p><strong>Back Neck Depth:</strong> {order.backNeckDepth || "N/A"}</p>
                <p><strong>Blouse Length:</strong> {order.blouseLength || "N/A"}</p>
                <p><strong>Chest to Apex:</strong> {order.chestToApex || "N/A"}</p>
              </div>

              <div className="section">
                <h3>Occasion & Price</h3>
                <p><strong>Occasion:</strong> {order.occasion || "N/A"}</p>
                <p><strong>Urgency Level:</strong> {order.urgencyLevel || "N/A"}</p>
                <p><strong>Delivery Date:</strong> {order.deliveryDate || "N/A"}</p>
                <p><strong>Price:</strong> ₹{order.price || "N/A"}</p>
              </div>

              <div className="section">
                <h3>Notes</h3>
                <p><strong>Description:</strong> {order.description || "No description"}</p>
                <p><strong>Extra Notes:</strong> {order.extraNotes || "None"}</p>
              </div>

              <div className="order-images">
                {["referenceImage", "fabricImage", "neckDesignImage", "sleeveDesignImage", "inspirationImage"].map((key) =>
                  order[key] ? (
                    <img
                      key={key}
                      src={`${BACKEND_URL}/uploads/${order[key]}`}
                      alt={key}
                      className="clickable-image"
                      onClick={() =>
                        setSelectedImage(`${BACKEND_URL}/uploads/${order[key]}`)
                      }
                    />
                  ) : (
                    <div key={key} className="image-placeholder">
                      <Image size={24} />
                    </div>
                  )
                )}
              </div>

              <div className="order-footer">
                <span className="order-status">{order.status || "Pending"}</span>
                <small className="order-date">
                  Placed on: {new Date(order.createdAt).toLocaleDateString()}
                </small>
              </div>

              {/* ✅ Accept / Reject Buttons */}
              <div className="order-actions">
                <button className="accept-btn" onClick={() => handleAccept(order._id)}>
                  ✅ Accept
                </button>
                <button className="reject-btn" onClick={() => handleReject(order._id)}>
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Image Preview Modal ===== */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="modal-image" />
            <div className="modal-actions">
              <button
                className="icon-btn download-btn"
                onClick={() => handleDownload(selectedImage)}
                title="Download"
              >
                ⬇️
              </button>
              <button
                className="icon-btn close-btn"
                onClick={() => setSelectedImage(null)}
                title="Close"
              >
                ✖️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomOrders;
