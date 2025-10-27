// src/pages/CustomizationConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle } from "lucide-react";
import axios from "axios";
import "./CustomizationConfirmation.css";

const BACKEND_URL = "http://localhost:5000";

export default function CustomizationConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);

  // Fetch full order from backend if not passed via state
  useEffect(() => {
    const fetchOrder = async () => {
      if (!order && location.state?.orderId) {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${BACKEND_URL}/api/custom-orders/${location.state.orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrder(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchOrder();
  }, [location.state, order]);

  const handleGoHome = () => {
    navigate("/");
  };

  const renderImage = (filename, alt) => {
    if (!filename) return null;
    return <img src={`${BACKEND_URL}/uploads/${filename}`} alt={alt} className="order-image" />;
  };

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="confirmation-container">
          <h2>No order data found!</h2>
          <button className="home-btn" onClick={handleGoHome}>
            Go to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="confirmation-container">
        <CheckCircle className="confirmation-icon" />
        <h1>✨ Your Customization is Submitted! ✨</h1>
        <p className="confirmation-text">
          Thank you, <strong>{order.customerName || "Customer"}</strong>! Your blouse customization request has been successfully sent to{" "}
          <strong>{order.designer?.name || order.designerName || "the designer"}</strong>.
        </p>

        <div className="order-summary">
          <h2>Order Summary:</h2>
          <ul>
            <li><strong>Product Name:</strong> {order.productName || "N/A"}</li>
            <li><strong>Blouse Type:</strong> {order.blouseType || "N/A"}</li>
            <li><strong>Neck Design:</strong> {order.neckType || "N/A"}</li>
            <li><strong>Sleeve Type:</strong> {order.sleeveType || "N/A"}</li>
            <li><strong>Fabric:</strong> {order.fabricType || "N/A"}</li>
            <li><strong>Color:</strong> {order.color || "N/A"}</li>
            <li><strong>Back Design:</strong> {order.backDesign || "N/A"}</li>
            <li><strong>Fit:</strong> {order.fitType || "N/A"}</li>
            <li><strong>Lining:</strong> {order.lining || "N/A"}</li>
            <li><strong>Padding:</strong> {order.padding || "N/A"}</li>
            <li><strong>Hook/Zip Placement:</strong> {order.hookZipPlacement || "N/A"}</li>
            <li><strong>Measurements:</strong>
              <ul>
                <li>Bust: {order.bustSize || "N/A"}</li>
                <li>Under Bust: {order.underBust || "N/A"}</li>
                <li>Waist: {order.waistSize || "N/A"}</li>
                <li>Shoulder: {order.shoulderSize || "N/A"}</li>
                <li>Arm Hole: {order.armHole || "N/A"}</li>
                <li>Sleeve Length: {order.sleeveLength || "N/A"}</li>
                <li>Front Neck Depth: {order.frontNeckDepth || "N/A"}</li>
                <li>Back Neck Depth: {order.backNeckDepth || "N/A"}</li>
                <li>Blouse Length: {order.blouseLength || "N/A"}</li>
                <li>Chest to Apex: {order.chestToApex || "N/A"}</li>
              </ul>
            </li>
            <li><strong>Additional Notes:</strong> {order.notes || order.extraNotes || "N/A"}</li>
            <li><strong>Urgency Level:</strong> {order.urgencyLevel || "Normal"}</li>
            <li><strong>Delivery Date:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"}</li>
            <li><strong>Price:</strong> {order.price ? `₹${order.price}` : "N/A"}</li>
          </ul>
        </div>

        <div className="order-images-section">
          {renderImage(order.referenceImage, "Reference Image")}
          {renderImage(order.fabricImage, "Fabric Image")}
          {renderImage(order.neckDesignImage, "Neck Design Image")}
          {renderImage(order.sleeveDesignImage, "Sleeve Design Image")}
          {renderImage(order.inspirationImage, "Inspiration Image")}
        </div>

        <button className="home-btn" onClick={handleGoHome}>
          Go to Home
        </button>
      </div>
      <Footer />
    </>
  );
}
