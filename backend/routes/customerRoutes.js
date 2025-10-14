import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();

// GET /api/customers/with-orders
router.get("/with-orders", async (req, res) => {
  try {
    const userIds = await Order.distinct("userId");
    const customers = await User.find({ _id: { $in: userIds } });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
