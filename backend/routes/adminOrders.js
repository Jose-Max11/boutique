import express from "express";
import Order from "../models/Order.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ GET all orders (admin only)
router.get("/", protect, authorize(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email"); // get user name & email

    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

// ✅ UPDATE order status (admin only)
router.put("/:id", protect, authorize(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    if (status === "delivered") {
      order.deliveredDate = new Date();
    }

    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order", error: err.message });
  }
});

export default router;
