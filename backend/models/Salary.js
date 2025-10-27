import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  salaryAmount: { type: Number, required: true },
  paidStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  paymentDate: { type: Date },
});

export default mongoose.model("Salary", SalarySchema);
