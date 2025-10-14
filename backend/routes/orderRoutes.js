import express from "express";
import Order from "../models/Order.js"; // Order schema
import Product from "../models/Product.js"; // Product schema
import { protect } from "../middleware/authMiddleware.js"; // auth middleware

const router = express.Router();

/**
 * POST /api/orders
 * Place a new order
 * Protected route: user must be logged in
 */
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { addresses, paymentMethod, items, total } = req.body;

    if (!addresses || !items || items.length === 0) {
      return res.status(400).json({ message: "Order must have items and address." });
    }

    const billing = addresses[0];

    // ===== Check stock =====
    for (let item of items) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
      }
    }

    // ===== Deduct stock =====
    for (let item of items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
    }

    // Transform items for order schema
    const orderItems = items.map((item) => ({
      product: item._id,
      name: item.product?.name || item.name,
      price: parseFloat(item.product?.price || item.price),
      quantity: item.quantity,
      image: item.product?.image || item.image || "",
    }));

    // Create new order
    const newOrder = new Order({
      userId,
      orderNumber: `ORDER${Date.now()}`,
      items: orderItems,
      totalAmount: total,
      paymentMethod,
      billingDetails: {
        name: billing.name,
        contactNumber: billing.contactNumber,
        house: billing.house,
        road: billing.road,
        city: billing.city,
        state: billing.state,
        pincode: billing.pincode,
        nearby: billing.nearby,
      },
      status: "pending",
    });

    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/orders
 * Get all orders of logged-in user
 * Protected route
 */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price image");

    res.status(200).json({ orders }); // returns { orders: [...] }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

/**
 * GET /api/orders/all
 * Get all orders (for admin/customer page)
 * Protected route
 */
router.get("/all", protect, async (req, res) => {
  try {
    // Optional: check admin role
    // if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email") // populate user info
      .populate("items.product", "name price image"); // populate product info

    res.status(200).json(orders); // returns array directly
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all orders", error: err.message });
  }
});

/**
 * DELETE /api/orders/:id
 * Cancel/Delete an order
 * Protected route
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel shipped or delivered orders" });
    }

    // Restore stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    await order.deleteOne();

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
});

export default router;
