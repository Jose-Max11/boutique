import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, RefreshCw
} from "lucide-react";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🗓️ Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

const {
  totals,
  orderStatusData,
  revenueTrend,
  topProducts,
  topCustomers,
  recentOrders,
  categorySales, // ✅ ADD THIS
} = res.data;


   setDashboardData({
  ...totals,
  revenueGrowth: 12.5,
  orderGrowth: 8.3,
  categorySales, // ✅ ADD THIS TOO
});

      setOrderStatusData(orderStatusData);
      setRevenueData(revenueTrend);
      setTopProducts(topProducts);
      setTopCustomers(topCustomers);
      setRecentOrders(recentOrders);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {trend && (
          <div className={`stat-trend ${trend > 0 ? "positive" : "negative"}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here’s what’s happening today.</p>

          {/* 🗓️ Date Filter Controls */}
          <div className="date-filter">
            <label>
              From:{" "}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              To:{" "}
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button className="refresh-button" onClick={fetchDashboardData}>
              <RefreshCw size={16} /> Apply Filter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`₹${dashboardData.totalRevenue || 0}`}
            trend={dashboardData.revenueGrowth}
            color="#c95f7b"
          />
          <StatCard
            icon={ShoppingCart}
            title="Total Orders"
            value={dashboardData.totalOrders || 0}
            subtitle={`${dashboardData.pendingOrders || 0} pending`}
            trend={dashboardData.orderGrowth}
            color="#6c63ff"
          />
          <StatCard
            icon={Users}
            title="Total Customers"
            value={dashboardData.totalCustomers || 0}
            subtitle="Active users"
            color="#10b981"
          />
          <StatCard
            icon={Package}
            title="Total Products"
            value={dashboardData.totalProducts || 0}
            subtitle={`${dashboardData.lowStockProducts || 0} low stock`}
            color="#f59e0b"
          />
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-container large">
            <h2>Revenue & Orders Trend (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#c95f7b" strokeWidth={3} />
                <Line type="monotone" dataKey="orders" stroke="#6c63ff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

<div className="chart-container">
  <h2>Order Status</h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={orderStatusData}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={90}
        label={({ name, percent }) => {
          // Truncate name if too long
          const displayName = name.length > 10 ? name.slice(0, 10) + "…" : name;
          return `${displayName}: ${(percent * 100).toFixed(0)}%`;
        }}
        labelLine={true} // Draw lines connecting labels to pie slices
      >
        {orderStatusData.map((entry, idx) => (
          <Cell key={idx} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>


          <div className="chart-container">
            <h2>Top Selling Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="stats-grid" style={{ marginTop: "1.5rem" }}>
          <StatCard
            icon={DollarSign}
            title="Average Order Value"
            value={`₹${dashboardData.averageOrderValue?.toFixed(2) || 0}`}
            subtitle="Per order"
            color="#f97316"
          />
          <StatCard
            icon={Users}
            title="Repeat Customers"
            value={dashboardData.repeatCustomers || 0}
            subtitle="More than 1 order"
            color="#3b82f6"
          />
          <StatCard
            icon={ShoppingCart}
            title="Cancelled Orders"
            value={dashboardData.cancelledOrders || 0}
            color="#ef4444"
          />
          <StatCard
            icon={ShoppingCart}
            title="Returned Orders"
            value={dashboardData.returnedOrders || 0}
            color="#f59e0b"
          />
        </div>

<div className="chart-container">
  <h2>Revenue by Product Category</h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={Object.entries(dashboardData.categorySales || {}).map(
        ([category, val]) => ({ category, revenue: val?.revenue || 0 })
      )}
      margin={{ top: 20, right: 30, left: 20, bottom: 80 }} // ✅ Extra bottom space
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis
        dataKey="category"
        stroke="#6b7280"
        angle={-30} // ✅ Tilt labels for readability
        textAnchor="end" // ✅ Anchor label text nicely
        interval={0} // ✅ Show all category labels
        height={70} // ✅ Make room for tilted text
        tick={{ fontSize: 12, fill: "#6b7280" }} // ✅ Nice font style
      />
      <YAxis stroke="#6b7280" />
      <Tooltip />
      <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>

        {/* Top Customers */}
        <div className="chart-container">
          <h2>Top Customers</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Total Spent (₹)</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.totalSpent}</td>
                  <td>{c.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="chart-container">
          <h2>Recent Orders</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, idx) => (
                <tr key={idx}>
                  <td>{o._id || "N/A"}</td>
                  <td>{o.customer}</td>
                  <td>₹{o.amount}</td>
                  <td>{o.status}</td>
                  <td>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💅 Styles */}
      <style jsx>{`
        /* Your existing styles remain unchanged */
        .admin-dashboard-wrapper { min-height: 100vh; background: #fff5f7; padding: 2rem; font-family: "Poppins", sans-serif; }
        .dashboard-header h1 { font-size: 1.8rem; color: #1e1e2f; }
        .dashboard-header p { color: #6b7280; }
        .date-filter { margin-top: 1rem; display: flex; gap: 1rem; align-items: center; }
        .date-filter input { padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; }
        .refresh-button { background: linear-gradient(90deg, #c95f7b, #ff9bb3); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
        .refresh-button:hover { opacity: 0.9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .stat-card { background: white; padding: 1.2rem; border-left: 6px solid; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); display: flex; gap: 1rem; align-items: center; }
        .stat-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .stat-content h3 { font-size: 1rem; color: #374151; }
        .stat-value { font-size: 1.5rem; font-weight: 600; color: #1e1e2f; }
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .chart-container { background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .chart-container h2 { font-size: 1.1rem; color: #1e1e2f; margin-bottom: 1rem; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { background: linear-gradient(90deg, #c95f7b, #ff9bb3); color: white; padding: 0.75rem; text-align: left; }
        .data-table td { padding: 0.75rem; background: #fffafc; border-bottom: 1px solid #f3d6e0; }
        .data-table tr:hover td { background: #ffe9ef; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
