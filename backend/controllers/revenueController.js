import Revenue from "../models/Revenue.js";
import Order from "../models/Order.js";
import Supplier from "../models/Supplier.js";

// ✅ Create revenue entry when order assigned to supplier
export const createRevenueEntry = async (req, res) => {
  try {
    const { orderId, supplierId, totalAmount } = req.body;

    const newRevenue = new Revenue({
      orderId,
      supplierId,
      totalAmount,
      paymentStatus: "Pending",
    });

    await newRevenue.save();
    res.status(201).json({ message: "Revenue entry created", newRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Supplier marks payment as collected from user (Cash on Delivery)
export const markCollected = async (req, res) => {
  try {
    const { id } = req.params;
    const revenue = await Revenue.findById(id);
    if (!revenue) return res.status(404).json({ message: "Revenue not found" });

    revenue.paymentStatus = "Collected";
    revenue.collectedBySupplier = true;
    await revenue.save();

    res.json({ message: "Payment collected by supplier", revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Admin marks supplier has paid the amount
export const markPaidToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const revenue = await Revenue.findById(id);
    if (!revenue) return res.status(404).json({ message: "Revenue not found" });

    revenue.paymentStatus = "PaidToAdmin";
    revenue.paidToAdmin = true;
    await revenue.save();

    res.json({ message: "Amount paid to admin", revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get total revenue for dashboard
export const getTotalRevenue = async (req, res) => {
  try {
    const total = await Revenue.aggregate([
      { $match: { paymentStatus: "PaidToAdmin" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    res.json({ totalRevenue: total[0]?.totalRevenue || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all revenue records
export const getAllRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find()
      .populate("orderId")
      .populate("supplierId");
    res.json(revenues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


