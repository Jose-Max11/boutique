import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: null },
  address: { type: String, default: "" },
  areasCovered: { type: [String], default: [] },
  productsHandled: { type: Number, default: 0 },
  productsDelivered: { type: Number, default: 0 },
  productsPending: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  image: { type: String, default: null }, // supplier image
}, { timestamps: true });

export default mongoose.model("Supplier", SupplierSchema);
