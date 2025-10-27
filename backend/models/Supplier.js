import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    // 🆔 Basic Supplier Info
    supplierId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },

    // 👤 Contact Person Details
    contactPerson: { type: String, required: true, trim: true },
    contactPersonPhone: { type: String, required: true, trim: true },

    // 🏠 Address Details
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },

    // 🌍 Areas Covered (optional)
    areasCovered: { type: [String], default: [] },

    // 💰 Payment & Banking Info
    paymentMode: {
      type: String,
      enum: ["cash", "bank transfer", "upi", "cheque", "credit"],
      required: true,
    },
    bankName: { type: String, default: "" },
    acc_no: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    upi_id: { type: String, default: "" },

    // 📦 Supply Details
    productCategory: { type: String, required: true, trim: true },
    supplyFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "on demand"],
      required: true,
    },
    minimumOrderQuantity: { type: Number, required: true },
    leadTime: { type: String, required: true, trim: true }, // e.g. "3 days"

    // 📊 Product Stats (from your old schema)
    productsHandled: { type: Number, default: 0 },
    productsDelivered: { type: Number, default: 0 },
    productsPending: { type: Number, default: 0 },

    // ⚙️ Supplier Status
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // 🖼️ Profile / Image
    image: { type: String, default: null },

    // ⭐ Performance
    rating: { type: Number, min: 0, max: 5, default: 5 },
    remarks: { type: String, default: "" },

    // 📅 Timestamps
    joinedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", SupplierSchema);
