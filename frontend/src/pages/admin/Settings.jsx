// AdminSettings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, RefreshCcw } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function AdminSettings() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all custom orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // if needed for auth
      const res = await axios.get(`${BACKEND_URL}/api/custom-orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setOrders(res.data || []);
      setFilteredOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching custom orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Filter orders by date
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = orders.filter(order => {
        const orderDate = new Date(order.deliveryDate || order.createdAt || order.order_date);
        return orderDate >= startDate && orderDate <= endDate;
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [startDate, endDate, orders]);

  const renderImage = (filename) => filename ? `${BACKEND_URL}/uploads/${filename}` : null;

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    fetchOrders();
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-rose-600">
          💖 Custom Orders Dashboard
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="Start Date"
              className="border rounded-md p-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="End Date"
              className="border rounded-md p-2 text-sm"
            />
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-rose-500 text-white px-3 py-2 rounded-lg hover:bg-rose-600 transition"
          >
            <RefreshCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found 😔</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-xl text-sm">
            <thead className="bg-rose-100">
              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Customer Name</th>
                <th className="p-3 text-left">Designer</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Blouse Type</th>
                <th className="p-3 text-left">Fabric</th>
                <th className="p-3 text-left">Order Date</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className="border-t hover:bg-rose-50">
                  <td className="p-3">{order._id}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">{order.designer?.name || "N/A"}</td>
                  <td className="p-3">{order.productName}</td>
                  <td className="p-3">{order.blouseType}</td>
                  <td className="p-3">{order.fabricType}</td>
                  <td className="p-3">{new Date(order.deliveryDate || order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 capitalize">{order.urgencyLevel || order.status || "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
