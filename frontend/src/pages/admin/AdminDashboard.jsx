import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } // if using JWT
      });
      const { totals, orderStatusData, revenueTrend, topProducts } = res.data;

      setDashboardData({ ...totals, revenueGrowth: 12.5, orderGrowth: 8.3 });
      setOrderStatusData(orderStatusData);
      setRevenueData(revenueTrend);
      setTopProducts(topProducts);
    } catch(err) {
      console.error(err);
    } finally { setLoading(false); }
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
            {trend > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
            <span>{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening today.</p>
          <button className="refresh-button" onClick={fetchDashboardData}>
            <RefreshCw size={16} /> Refresh Data
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={DollarSign} title="Total Revenue" value={`₹${dashboardData.totalRevenue}`} trend={dashboardData.revenueGrowth} color="#10b981"/>
          <StatCard icon={ShoppingCart} title="Total Orders" value={dashboardData.totalOrders} subtitle={`${dashboardData.pendingOrders} pending`} trend={dashboardData.orderGrowth} color="#3b82f6"/>
          <StatCard icon={Users} title="Total Customers" value={dashboardData.totalCustomers} subtitle="Active users" color="#8b5cf6"/>
          <StatCard icon={Package} title="Total Products" value={dashboardData.totalProducts} subtitle={`${dashboardData.lowStockProducts} low stock`} color="#f59e0b"/>
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
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2>Order Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orderStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}>
                  {orderStatusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
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
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Outlet />
      </div>

      <style jsx>{`
        .admin-dashboard-wrapper { display:flex; flex-direction:column; min-height:100vh; background:#f5f7fa; }
        .admin-dashboard { padding:2rem; flex:1; }
        .dashboard-header { margin-bottom:2rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:1.5rem; margin-bottom:2rem; }
        .stat-card { background:white; border-radius:12px; padding:1.5rem; display:flex; gap:1rem; border-left:4px solid; }
        .stat-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
        .stat-content h3 { font-size:0.875rem; color:#6b7280; margin-bottom:0.5rem; font-weight:500; }
        .stat-value { font-size:1.75rem; font-weight:700; color:#1f2937; margin-bottom:0.25rem; }
        .charts-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap:1.5rem; }
        .chart-container { background:white; border-radius:12px; padding:1.5rem; }
        .chart-container.large { grid-column:1 / -1; }
        .dashboard-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; gap:1rem; }
        .loading-spinner { width:48px; height:48px; border:4px solid #e5e7eb; border-top-color:#3b82f6; border-radius:50%; animation:spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .refresh-button { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 1rem; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:500; }
        .refresh-button:hover { background:#2563eb; }
        .stat-subtitle { font-size:0.75rem; color:#9ca3af; }
        .stat-trend { display:flex; align-items:center; gap:0.25rem; font-size:0.75rem; margin-top:0.25rem; }
        .stat-trend.positive { color:#10b981; }
        .stat-trend.negative { color:#ef4444; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
