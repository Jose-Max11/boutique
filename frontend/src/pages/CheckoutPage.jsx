import React, { useState } from "react";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./CheckoutPage.css";

const BACKEND_URL = "http://localhost:5000"; // backend URL

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
  "Puducherry", "Chandigarh", "Andaman & Nicobar", "Dadra & Nagar Haveli",
  "Daman & Diu", "Lakshadweep"
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCartWishlist();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([
    {
      label: "Home",
      name: "",
      email: "",
      contactNumber: "",
      house: "",
      road: "",
      pincode: "",
      city: "",
      state: "",
      nearby: "",
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("card");

  // ===== Address Functions =====
  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      {
        label: "Home",
        name: "",
        email: "",
        contactNumber: "",
        house: "",
        road: "",
        pincode: "",
        city: "",
        state: "",
        nearby: "",
      },
    ]);
  };

  const handleDeleteAddress = (index) => {
    if (addresses.length === 1) {
      alert("At least one address is required!");
      return;
    }
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleChange = (index, e) => {
    const updated = [...addresses];
    updated[index][e.target.name] = e.target.value;
    setAddresses(updated);
  };

  // ===== Total Price =====
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.product?.price || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + price * quantity;
    }, 0);
  };

  // ===== Validate Address Data =====
  const validateAddresses = () => {
    for (let addr of addresses) {
      if (!addr.name || !addr.contactNumber || !addr.house || !addr.road || !addr.city || !addr.state || !addr.pincode) {
        alert("Please fill all required address fields!");
        return false;
      }
      if (!/^[0-9]{10}$/.test(addr.contactNumber)) {
        alert("Contact number must be 10 digits!");
        return false;
      }
      if (!/^[0-9]{6}$/.test(addr.pincode)) {
        alert("Pincode must be 6 digits!");
        return false;
      }
      if (addr.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) {
        alert("Please enter a valid email address!");
        return false;
      }
    }
    return true;
  };

  // ===== Place Order =====
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!validateAddresses()) return;

    try {
      // Check stock
      for (let item of cart) {
        const productId = item.product?._id || item._id;
        const quantity = parseInt(item.quantity || 1);
        const res = await axios.get(`${BACKEND_URL}/api/products/${productId}`);
        if (res.data.stock < quantity) {
          alert(`Cannot place order. Only ${res.data.stock} "${res.data.name}" left in stock.`);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        items: cart.map((item) => ({
          _id: item.product?._id || item._id,
          product: item.product || item,
          quantity: item.quantity || 1,
        })),
        addresses,
        paymentMethod,
        total: getTotalPrice(),
      };

      const token = localStorage.getItem("token");

      // Place order
      const res = await axios.post(`${BACKEND_URL}/api/orders`, orderData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      alert("Order placed successfully!");
      clearCart();

      setAddresses([
        {
          label: "Home",
          name: "",
          email: "",
          contactNumber: "",
          house: "",
          road: "",
          pincode: "",
          city: "",
          state: "",
          nearby: "",
        },
      ]);

      navigate("/order-confirmation", { state: { order: res.data.order } });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="checkout-page-container">
        <h2 className="checkout-title">Checkout</h2>

        <div className="checkout-content">
          {/* ===== Billing Form ===== */}
          <form className="billing-form" onSubmit={handlePlaceOrder}>
            <h3>Delivery Address</h3>

            {addresses.map((address, index) => (
              <div key={index} className="address-section">
                <div className="address-header">
                  <h4>Address {index + 1}</h4>
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      className="delete-address-btn"
                      onClick={() => handleDeleteAddress(index)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={address.name}
                  onChange={(e) => handleChange(index, e)}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (Optional)"
                  value={address.email}
                  onChange={(e) => handleChange(index, e)}
                />
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={address.contactNumber}
                  onChange={(e) => handleChange(index, e)}
                  pattern="[0-9]{10}"
                  title="Enter 10-digit phone number"
                  required
                />
                <input
                  type="text"
                  name="house"
                  placeholder="House / Building"
                  value={address.house}
                  onChange={(e) => handleChange(index, e)}
                  required
                />
                <input
                  type="text"
                  name="road"
                  placeholder="Road / Area / Colony"
                  value={address.road}
                  onChange={(e) => handleChange(index, e)}
                  required
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) => handleChange(index, e)}
                  pattern="[0-9]{6}"
                  title="Enter 6-digit Indian pincode"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => handleChange(index, e)}
                  required
                />
                <select
                  name="state"
                  value={address.state}
                  onChange={(e) => handleChange(index, e)}
                  required
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="nearby"
                  placeholder="Nearby Landmark (Optional)"
                  value={address.nearby}
                  onChange={(e) => handleChange(index, e)}
                />

                <hr />
              </div>
            ))}

            <button type="button" onClick={handleAddAddress} className="add-address-btn">
              <Plus size={18} /> Add Another Address
            </button>

            <h3>Payment Method</h3>
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="card">Credit/Debit Card</option>
              <option value="upi">UPI</option>
              <option value="cod">Cash on Delivery</option>
            </select>

            <button type="submit" className="place-order-btn" disabled={cart.length === 0}>
              <CreditCard size={18} /> Place Order
            </button>
          </form>

          {/* ===== Order Summary ===== */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.map((item) => {
                const product = item.product || item;
                const quantity = parseInt(item.quantity || 1);
                const price = parseFloat(product.price) || 0;
                const imageUrl = product.image?.startsWith("http")
                  ? product.image
                  : `${BACKEND_URL}/${product.image || ""}`;

                return (
                  <div className="summary-item" key={product._id}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="summary-item-image"
                      onError={(e) =>
                        (e.target.src =
                          "https://dummyimage.com/50x50/ccc/fff&text=No+Image")
                      }
                    />
                    <span>
                      {product.name} × {quantity}
                    </span>
                    <span>₹{(price * quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <span>₹{getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
