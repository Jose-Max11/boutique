import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./SupplierRevenuePage.css";

const BACKEND_URL = "http://localhost:5000";

const SupplierRevenuePage = () => {
  const [revenues, setRevenues] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevenues(res.data);
    } catch (err) {
      console.error("Error fetching supplier revenues:", err);
    }
  };

  const markCollected = async (id) => {
  try {
    const res = await axios.patch(
      `${BACKEND_URL}/api/revenue/collect/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(res.data.message || "Payment marked as collected!");
    fetchRevenues(); // refresh after marking
  } catch (err) {
    console.error("Error marking collected:", err);
    alert("Failed to update payment status.");
  }
};


  // 🌸 Summary calculations
  const totalRevenue = revenues.reduce((acc, r) => acc + r.totalAmount, 0);
  const collectedRevenue = revenues
    .filter((r) => r.paymentStatus === "Collected")
    .reduce((acc, r) => acc + r.totalAmount, 0);
  const pendingRevenue = revenues
    .filter((r) => r.paymentStatus === "Pending")
    .reduce((acc, r) => acc + r.totalAmount, 0);

  const chartData = [
    { name: "Collected", amount: collectedRevenue },
    { name: "Pending", amount: pendingRevenue },
  ];

  return (
    <div className="revenue-dashboard">
      <h2>🏦 Supplier Revenue Management</h2>

      {/* 🌷 Summary Cards */}
      <div className="chart-section">
        <div className="total-revenue-card">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="total-revenue-card" style={{ background: "linear-gradient(135deg, #ff9bb3, #de0740)" }}>
          <h3>Collected</h3>
          <p>₹{collectedRevenue.toLocaleString()}</p>
        </div>
        <div className="total-revenue-card" style={{ background: "linear-gradient(135deg, #f7c624ff, #faa731ff)" }}>
          <h3>Pending</h3>
          <p>₹{pendingRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* 💳 Revenue Table */}
      {revenues.length === 0 ? (
        <p className="no-data">No revenue data found.</p>
      ) : (
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Order ID</th>
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
                <td
                  style={{
                    color:
                      r.paymentStatus === "Collected"
                        ? "#28a745"
                        : r.paymentStatus === "Pending"
                        ? "#f0ad4e"
                        : "#6c757d",
                  }}
                >
                  {r.paymentStatus}
                </td>
                <td>
                  {r.paymentStatus === "Pending" && (
                    <button
                      onClick={() => markCollected(r._id)}
                      className="action-btn"
                    >
                      Mark Collected
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 📊 Revenue Chart */}
      <div className="bar-chart-section">
        <h3>Revenue Status Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="amount"
              fill="#f31751ff"
              label={{ position: "top", fill: "#c95f7b" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SupplierRevenuePage;
