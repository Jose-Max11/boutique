import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./RevenueDashboard.css";

const BACKEND_URL = "http://localhost:5000";
const COLORS = ["#f7f010ff", "#1df21dff", "#ff2609ff"];

const RevenueDashboard = () => {
  const [revenues, setRevenues] = useState([]);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRevenues();
    fetchTotal();
  }, []);

  const fetchRevenues = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevenues(res.data);
      updateChart(res.data);
      updateMonthlyChart(res.data);
    } catch (err) {
      console.error("Error fetching revenues:", err);
    }
  };

  const fetchTotal = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/revenue/total`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotal(res.data.totalRevenue);
    } catch (err) {
      console.error("Error fetching total revenue:", err);
    }
  };

  const updateChart = (data) => {
    const collected = data.filter((r) => r.paymentStatus === "Collected").length;
    const paid = data.filter((r) => r.paymentStatus === "Paid").length;
    const pending = data.filter((r) => r.paymentStatus === "Pending").length;

    setChartData([
      { name: "Collected", value: collected },
      { name: "Paid", value: paid },
      { name: "Pending", value: pending },
    ]);
  };

  // 📊 Create Monthly Data for Second Chart
  const updateMonthlyChart = (data) => {
    const monthlyMap = {};

    data.forEach((r) => {
      const date = new Date(r.createdAt);
      const month = date.toLocaleString("default", { month: "short" });
      const amount = Number(r.totalAmount) || 0;

      if (!monthlyMap[month]) monthlyMap[month] = 0;
      if (r.paymentStatus === "Collected" || r.paymentStatus === "Paid") {
        monthlyMap[month] += amount;
      }
    });

    const formatted = Object.keys(monthlyMap).map((m) => ({
      month: m,
      revenue: monthlyMap[m],
    }));

    setMonthlyData(formatted);
  };

  const markPaid = async (id) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/revenue/pay/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Supplier payment marked as sent to admin!");
      fetchRevenues();
      fetchTotal();
    } catch (err) {
      console.error("Error marking as paid:", err);
      alert("Failed to update payment status.");
    }
  };

  return (
    <div className="revenue-dashboard bg-[#fff5f7] min-h-screen p-6">
      <h2 className="dashboard-title">💰 Admin Revenue Dashboard</h2>

      {/* 💹 Chart Section 1 */}
      <div className="chart-section">
        <div className="chart-card">
          <h3>Revenue Status Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  color: "#333",
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ color: "#333" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="total-revenue-card">
          <h3>Total Revenue Collected</h3>
          <p className="total-amount">₹{total}</p>
        </div>
      </div>

      {/* 📊 Chart Section 2 */}
      <div className="bar-chart-section">
        <h3>📅 Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#c95f7b" />
            <YAxis stroke="#c95f7b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                color: "#333",
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#cc07de" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🧾 Revenue Table */}
      {revenues.length === 0 ? (
        <p className="no-data">No revenue records available.</p>
      ) : (
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {revenues.map((r) => (
              <tr key={r._id}>
                <td>{r.orderId?.orderNumber}</td>
                <td>{r.supplierId?.name}</td>
                <td>₹{r.totalAmount}</td>
                <td className={`status-${r.paymentStatus.toLowerCase()}`}>
                  {r.paymentStatus}
                </td>
                <td>
                  {r.paymentStatus === "Collected" && (
                    <button onClick={() => markPaid(r._id)} className="action-btn">
                      Mark Paid to Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RevenueDashboard;
