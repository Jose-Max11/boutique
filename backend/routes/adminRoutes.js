import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js"; // or your Customer model
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/admin/dashboard => Fetch dashboard stats
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
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const completedOrders = orders.filter(o => o.status === "completed").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

    // Low stock
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    // Order status for PieChart
    const orderStatusData = [
      { name: "Completed", value: completedOrders, color: "#10b981" },
      { name: "Pending", value: pendingOrders, color: "#f59e0b" },
      { name: "Processing", value: orders.filter(o => o.status === "processing").length, color: "#3b82f6" },
      { name: "Cancelled", value: cancelledOrders, color: "#ef4444" },
    ];

    // Last 7 days revenue/orders
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const revenueTrend = last7Days.map(date => {
      const dayOrders = orders.filter(o => o.createdAt.toISOString().startsWith(date));
      const revenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
        orders: dayOrders.length
      };
    });

    // Top 5 products by revenue
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.quantity * item.price;
      });
    });
    const topProducts = Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0,5);

    res.json({
      totals: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        lowStockProducts
      },
      orderStatusData,
      revenueTrend,
      topProducts
    });

  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
