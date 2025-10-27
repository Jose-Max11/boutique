import mongoose from "mongoose";

// Schema for each item in an order
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
});

// Full order schema
const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["card", "upi", "cod"], default: "card" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    billingDetails: {
      name: { type: String, required: true },
      contactNumber: { type: String, required: true },
      house: { type: String, required: true },
      road: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      nearby: { type: String },
    },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
deliveredDate: { type: Date },

    // ✅ NEW FIELDS
    orderDate: {
      type: Date,
      default: Date.now, // auto set when order created
    },
    deliveredDate: {
      type: Date, // set only when status changes to delivered
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
