import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Salary from "../models/Salary.js";
import AdminCollection from "../models/Revenue.js";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

/**
 * GET /api/orders/dashboard
 * Returns complete dashboard data for admin
 */
export const getDashboardData = async (req, res) => {
  try {
    // --- Fetch all orders ---
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("supplierId", "name email")
      .populate("items.product", "name price image");

    // --- Fetch payments ---
    const payments = await Payment.find();

    // --- Fetch supplier salaries ---
    const salaries = await Salary.find().populate("supplierId", "name email");

    // --- Fetch admin collections ---
    const adminCollections = await AdminCollection.find();

    // --- Compute totals ---
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalPaidOrders = orders.filter(o => o.paymentStatus === "paid").length;
    const totalPendingOrders = orders.filter(o => o.paymentStatus === "unpaid").length;

    // --- Supplier total pending salaries ---
    const pendingSalaries = salaries
      .filter(s => s.paidStatus === "pending")
      .reduce((sum, s) => sum + s.salaryAmount, 0);

    // --- Admin total pending collections ---
    const pendingAdminShare = adminCollections
      .filter(a => a.collectedStatus === "pending")
      .reduce((sum, a) => sum + a.adminShare, 0);

    // --- Top 5 products ---
    const productStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const pid = item.product?._id.toString();
        if (!pid) return;
        if (!productStats[pid]) {
          productStats[pid] = {
            name: item.product?.name || "Unknown",
            quantity: 0,
            revenue: 0,
          };
        }
        productStats[pid].quantity += item.quantity;
        productStats[pid].revenue += item.quantity * item.price;
      });
    });
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // --- Response ---
    res.status(200).json({
      totals: {
        totalRevenue,
        totalOrders,
        totalPaidOrders,
        totalPendingOrders,
        pendingSalaries,
        pendingAdminShare,
      },
      orders,
      payments,
      salaries,
      adminCollections,
      topProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard data", error: err.message });
  }
};
