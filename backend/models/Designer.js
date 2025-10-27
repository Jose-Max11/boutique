import mongoose from "mongoose";

const DesignerSchema = new mongoose.Schema(
  {
    // 🆔 Basic Info
    designerId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, trim: true },

    // 🧵 Professional Details
    speciality: { type: String, required: true, trim: true }, // e.g., Bridal Wear, Men's Suits, Western, etc.
    experience: { type: Number, default: 0 }, // in years
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] }, // e.g., ["Embroidery", "Pattern Making", "Illustration"]
    services: { type: [String], default: [] }, // e.g., ["Custom Dresses", "Bridal", "Party Wear"]
    certifications: { type: [String], default: [] },
    languages: { type: [String], default: ["English"] },
    hourly_rate: { type: Number, default: 0 },

    // 📍 Address Details
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },

    // 🌐 Social Media Links
    social_links: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      pinterest: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // 💼 Work & Portfolio
    portfolioImages: { type: [String], default: [] }, // sample works
    designsCreated: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    pendingOrders: { type: Number, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 5 },
    reviews: [
      {
        customerName: { type: String, trim: true },
        rating: { type: Number, min: 0, max: 5 },
        comment: { type: String, trim: true },
        date: { type: Date, default: Date.now },
      },
    ],

    // 💰 Payment / Account Info
    paymentMode: {
      type: String,
      enum: ["cash", "bank transfer", "upi", "credit"],
      default: "upi",
    },
    bankName: { type: String, default: "" },
    acc_no: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    upi_id: { type: String, default: "" },

    // ⚙️ Status & Meta
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    availability: { type: String, enum: ["available", "unavailable"], default: "available" },
    profile_image: { type: String, default: null },
    joinedDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Designer", DesignerSchema);
