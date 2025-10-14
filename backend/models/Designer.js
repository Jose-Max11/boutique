import mongoose from "mongoose";

const DesignerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: null },
  speciality: { type: String, required: true, trim: true },
  experience: { type: Number, default: 0 },
  bio: { type: String, default: "" },
  profile_image: { type: String, default: null },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

export default mongoose.model("Designer", DesignerSchema);
