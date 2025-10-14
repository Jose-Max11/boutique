import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/admin/dashboard
router.get("/dashboard", protect, authorize(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email");
    const products = await Product.find();
    const customers = await User.find();

    // Totals
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;

    // Orders by status
    const statusCount = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
    };
    orders.forEach(o => statusCount[o.status] = (statusCount[o.status] || 0) + 1);

    // Low stock
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    // Pie chart
    const orderStatusData = [
      { name: "Pending", value: statusCount.pending, color: "#f59e0b" },
      { name: "Confirmed", value: statusCount.confirmed, color: "#3b82f6" },
      { name: "Shipped", value: statusCount.shipped, color: "#8b5cf6" },
      { name: "Delivered", value: statusCount.delivered, color: "#10b981" },
    ];

    // Last 7 days revenue & orders
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const revenueTrend = last7Days.map(date => {
      const dayOrders = orders.filter(o =>
        new Date(o.createdAt).toISOString().split("T")[0] === date
      );
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        orders: dayOrders.length
      };
    });

    // Top 5 products by revenue
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) productSales[productId] = { name: item.name, quantity: 0, revenue: 0 };
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.quantity * item.price;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      totals: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders: statusCount.pending,
        confirmedOrders: statusCount.confirmed,
        shippedOrders: statusCount.shipped,
        deliveredOrders: statusCount.delivered,
        lowStockProducts
      },
      orderStatusData,
      revenueTrend,
      topProducts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
