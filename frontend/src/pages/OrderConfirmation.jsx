import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CreditCard } from "lucide-react";
import "./OrderConfirmation.css";

const BACKEND_URL = "http://localhost:5000";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  if (!order) {
    return (
      <div>
        <Navbar />
        <div className="order-empty">
          <h2>No order found!</h2>
          <button onClick={() => navigate("/shop")}>Go to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="order-confirmation-container">
        <h2>Order Confirmed!</h2>
        <p>
          Your order <strong>{order.orderNumber}</strong> has been placed successfully.
        </p>

        <div className="order-details">
          <h3>Delivery Address</h3>
          <p>{order.billingDetails.name}</p>
          <p>{order.billingDetails.house}, {order.billingDetails.road}</p>
          <p>{order.billingDetails.city} - {order.billingDetails.pincode}</p>
          <p>{order.billingDetails.state}</p>
          {order.billingDetails.nearby && <p>Nearby: {order.billingDetails.nearby}</p>}
          <p>Contact: {order.billingDetails.contactNumber}</p>

          <h3>Payment Method</h3>
          <p>{order.paymentMethod}</p>

          <h3>Items</h3>
          <div className="order-items">
            {order.items.map((item) => {
              const imageUrl = item.image?.startsWith("http")
                ? item.image
                : `${BACKEND_URL}/${item.image || ""}`;
              return (
                <div key={item._id} className="order-item">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    onError={(e) =>
                      (e.target.src =
                        "https://dummyimage.com/50x50/ccc/fff&text=No+Image")
                    }
                  />
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <h3>Total Amount</h3>
          <p>₹{order.totalAmount.toFixed(2)}</p>

          <button onClick={() => navigate("/shop")} className="shop-again-btn">
            <CreditCard size={18} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
