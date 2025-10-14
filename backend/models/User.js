// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for Google users
  googleId: { type: String }, // store Google ID
  role: { type: String, enum: ["admin", "user"], default: "user" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
