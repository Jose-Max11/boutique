import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./OrdersPage.css";

const BACKEND_URL = "http://localhost:5000";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/suppliers`);
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const handleAssign = async (orderId, totalAmount) => {
    const supplierId = selectedSupplier[orderId];
    if (!supplierId) {
      Swal.fire("Select Supplier", "Please choose a supplier!", "warning");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/revenue/create`, {
        orderId,
        supplierId,
        totalAmount,
      });

      Swal.fire({
        icon: "success",
        title: res.data.message,
        showConfirmButton: false,
        timer: 1500,
      });

      fetchOrders();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to assign order.", "error");
    }
  };

  return (
    <div className="orders-container">
      <h2 className="orders-title">📦 Assign Orders to Suppliers</h2>

      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Total Amount</th>
                <th>Assigned To</th>
                <th>Select Supplier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    {order.supplier
                      ? suppliers.find((s) => s._id === order.supplier)?.name ||
                        "—"
                      : "Not Assigned"}
                  </td>
                  <td>
                    <select
                      className="supplier-select"
                      value={selectedSupplier[order._id] || ""}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          [order._id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((sup) => (
                        <option key={sup._id} value={sup._id}>
                          {sup.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="assign-btn"
                      onClick={() => handleAssign(order._id, order.totalAmount)}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
