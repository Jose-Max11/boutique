// adminDashboard.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize(["admin"]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // --- Date Filter ---
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // --- Fetch Orders with User & Product Category populated ---
    const orders = await Order.find(dateFilter)
      .populate("userId", "name email")
      .populate({
        path: "items.product",
        select: "name price category",
        populate: { path: "category", select: "name" },
      });

    const products = await Product.find().populate("category", "name");
    const customers = await User.find();

    // --- Totals ---
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    // --- Orders by Status ---
    const statusCount = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };
    orders.forEach(o => statusCount[o.status] = (statusCount[o.status] || 0) + 1);

    // --- Order Status Pie Chart ---
    const orderStatusData = Object.entries(statusCount).map(([name, value]) => {
      const colors = {
        pending: "#f59e0b",
        confirmed: "#3b82f6",
        shipped: "#8b5cf6",
        delivered: "#10b981",
        cancelled: "#ef4444",
        returned: "#f97316",
      };
      return { name: name.charAt(0).toUpperCase() + name.slice(1), value, color: colors[name] || "#9ca3af" };
    });

    // --- Revenue & Orders Trend ---
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();
    if (!startDate && !endDate) start.setDate(end.getDate() - 6); // last 7 days

    const dateList = [];
    let current = new Date(start);
    while (current <= end) {
      dateList.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    const revenueTrend = dateList.map(date => {
      const dayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split("T")[0] === date);
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        orders: dayOrders.length,
      };
    });

    // --- Top Products & Category Sales ---
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString();
        if (!productId) return;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.product?.name || "Unknown",
            quantity: 0,
            revenue: 0,
            category: item.product?.category?.name || "Uncategorized",
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.quantity * item.price;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const categorySales = {};
    Object.values(productSales).forEach(p => {
      if (!categorySales[p.category]) categorySales[p.category] = { revenue: 0, quantity: 0 };
      categorySales[p.category].revenue += p.revenue;
      categorySales[p.category].quantity += p.quantity;
    });

    // --- Top Customers ---
    const customerRevenue = {};
    orders.forEach(order => {
      if (!order.userId) return;
      const id = order.userId._id.toString();
      if (!customerRevenue[id]) {
        customerRevenue[id] = { name: order.userId.name, email: order.userId.email, totalSpent: 0, orders: 0 };
      }
      customerRevenue[id].totalSpent += order.totalAmount || 0;
      customerRevenue[id].orders += 1;
    });
    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // --- Recent Orders ---
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(o => ({
        _id: o._id.toString(),
        customer: o.userId?.name || "Guest",
        amount: o.totalAmount || 0,
        status: o.status || "N/A",
        date: o.createdAt,
      }));

    // --- Additional Metrics ---
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const repeatCustomers = Object.values(customerRevenue).filter(c => c.orders > 1).length;
    const cancelledOrders = statusCount.cancelled || 0;
    const returnedOrders = statusCount.returned || 0;

    res.json({
      totals: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        averageOrderValue,
        repeatCustomers,
        cancelledOrders,
        returnedOrders,
      },
      orderStatusData,
      revenueTrend,
      topProducts,
      topCustomers,
      recentOrders,
      categorySales,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
