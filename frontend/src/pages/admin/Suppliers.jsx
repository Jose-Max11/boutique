import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search } from "lucide-react";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    supplierId: "",
    name: "",
    email: "",
    phone: "",
    contactPerson: "",
    contactPersonPhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    areasCovered: "",
    paymentMode: "cash",
    bankName: "",
    acc_no: "",
    ifscCode: "",
    upi_id: "",
    productCategory: "",
    supplyFrequency: "daily",
    minimumOrderQuantity: 0,
    leadTime: "",
    productsHandled: 0,
    productsDelivered: 0,
    productsPending: 0,
    status: "active",
    rating: 5,
    remarks: "",
    joinedDate: "",
    image: null,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/suppliers");
      setSuppliers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) data.append(key, formData[key]);
      });

      if (editId) {
        await axios.put(`http://localhost:5000/api/suppliers/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://localhost:5000/api/suppliers", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({
        supplierId: "",
        name: "",
        email: "",
        phone: "",
        contactPerson: "",
        contactPersonPhone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        areasCovered: "",
        paymentMode: "cash",
        bankName: "",
        acc_no: "",
        ifscCode: "",
        upi_id: "",
        productCategory: "",
        supplyFrequency: "daily",
        minimumOrderQuantity: 0,
        leadTime: "",
        productsHandled: 0,
        productsDelivered: 0,
        productsPending: 0,
        status: "active",
        rating: 5,
        remarks: "",
        joinedDate: "",
        image: null,
      });
      setEditId(null);
      fetchSuppliers();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleEdit = (s) => {
    setFormData({
      supplierId: s.supplierId || "",
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      contactPerson: s.contactPerson || "",
      contactPersonPhone: s.contactPersonPhone || "",
      address: s.address || "",
      city: s.city || "",
      state: s.state || "",
      pincode: s.pincode || "",
      country: s.country || "",
      areasCovered: Array.isArray(s.areasCovered) ? s.areasCovered.join(", ") : s.areasCovered || "",
      paymentMode: s.paymentMode || "cash",
      bankName: s.bankName || "",
      acc_no: s.acc_no || "",
      ifscCode: s.ifscCode || "",
      upi_id: s.upi_id || "",
      productCategory: s.productCategory || "",
      supplyFrequency: s.supplyFrequency || "daily",
      minimumOrderQuantity: s.minimumOrderQuantity || 0,
      leadTime: s.leadTime || "",
      productsHandled: s.productsHandled || 0,
      productsDelivered: s.productsDelivered || 0,
      productsPending: s.productsPending || 0,
      status: s.status || "active",
      rating: s.rating || 5,
      remarks: s.remarks || "",
      joinedDate: s.joinedDate ? new Date(s.joinedDate).toISOString().substr(0, 10) : "",
      image: null,
    });
    setEditId(s._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) { console.error(err); }
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    searchQuery
      ? s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone?.includes(searchQuery) ||
        (s.areasCovered?.join(", ") || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="suppliers-container">
      <h2 className="page-title">Supplier Management</h2>

      {/* Search */}
      <div className="search-bar">
        <Search size={20} color="#2c0e4d" />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Supplier Form */}
      <form onSubmit={handleSubmit} className="supplier-form">
        {Object.keys(formData).map((key) => (
          key !== "image" ? (
            <div className="form-group" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              {key === "paymentMode" || key === "supplyFrequency" || key === "status" ? (
                <select name={key} value={formData[key]} onChange={handleChange}>
                  {key === "paymentMode" && (
                    <>
                      <option value="cash">Cash</option>
                      <option value="bank transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                      <option value="credit">Credit</option>
                    </>
                  )}
                  {key === "supplyFrequency" && (
                    <>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="on demand">On Demand</option>
                    </>
                  )}
                  {key === "status" && (
                    <>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </>
                  )}
                </select>
              ) : (
                <input
                  type={key.includes("Date") ? "date" : key.includes("Quantity") || key.includes("Handled") || key.includes("Delivered") || key.includes("Pending") || key === "rating" ? "number" : "text"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  min={key === "rating" ? 0 : undefined}
                  max={key === "rating" ? 5 : undefined}
                  step={key === "rating" ? 0.1 : undefined}
                />
              )}
            </div>
          ) : (
            <div className="form-group" key={key}>
              <label>Image</label>
              <input type="file" name="image" accept="image/*" onChange={handleChange} />
            </div>
          )
        ))}

        <button type="submit" className="btn-submit"><Plus size={30} /></button>
      </form>

      {/* Supplier Table */}
      <div className="table-container">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>Image</th>
              {Object.keys(formData).map((key) => key !== "image" && <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s) => (
                <tr key={s._id}>
                  <td>{s.image ? <img src={`http://localhost:5000/${s.image}`} alt={s.name} className="table-img" /> : "No Image"}</td>
                  {Object.keys(formData).map((key) => key !== "image" && (
                    <td key={key}>
                      {key === "joinedDate" && s[key] ? new Date(s[key]).toLocaleDateString() : Array.isArray(s[key]) ? s[key].join(", ") : s[key]}
                    </td>
                  ))}
                  <td>
                    <Edit size={20} color="#1247a3" style={{ cursor: "pointer", marginRight: "8px" }} onClick={() => handleEdit(s)} />
                    <Trash2 size={20} color="#ff2c2c" style={{ cursor: "pointer" }} onClick={() => handleDelete(s._id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={Object.keys(formData).length + 1} className="no-data">No suppliers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CSS */}
      <style>{`
.suppliers-container {
  max-width: 1600px;
  margin: 40px auto;
  padding: 35px 30px;
  background: #fff5f7; /* soft white-pink background */
  border-radius: 25px;
  font-family: "Poppins", sans-serif;
  color: #333;
  box-shadow: 0 8px 25px rgba(201, 95, 123, 0.2);
  transition: all 0.3s ease;
}

.page-title {
  text-align: center;
  font-size: 34px;
  margin-bottom: 35px;
  color: #c95f7b; /* rose-pink title */
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Floating search bar */
.search-bar {
  display: flex;
  align-items: center;
  max-width: 450px;
  margin: 0 auto 35px auto;
  padding: 12px 20px;
  border-radius: 50px;
  background: #ffe6f0; /* soft pink background */
  box-shadow: 0 6px 20px rgba(201, 95, 123, 0.2);
  transition: all 0.3s ease;
}

.search-bar:hover {
  box-shadow: 0 8px 25px rgba(201, 95, 123, 0.3);
}

.search-bar input {
  border: none;
  outline: none;
  background: transparent;
  margin-left: 12px;
  width: 100%;
  color: #c95f7b;
  font-size: 16px;
  font-family: "Poppins", sans-serif;
}

.search-bar input::placeholder {
  color: #c95f7b;
  font-weight: 500;
}

/* Supplier form */
.supplier-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 22px;
  margin-bottom: 45px;
  align-items: center;
}

.supplier-form .form-group {
  display: flex;
  flex-direction: column;
}

.supplier-form label {
  margin-bottom: 6px;
  font-size: 14px;
  color: #c95f7b;
}

.supplier-form input,
.supplier-form select {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #f2c2d1;
  background: #fff;
  color: #333;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.supplier-form input:focus,
.supplier-form select:focus {
  border-color: #c95f7b;
  box-shadow: 0 0 10px rgba(201, 95, 123, 0.3);
}

/* Gradient submit button */
.btn-submit {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #c95f7b, #ff9bb3);
  padding: 14px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  grid-column: span 1;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 6px 20px rgba(201, 95, 123, 0.35);
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(201, 95, 123, 0.45);
}

/* Table container for scroll */
.table-container {
  overflow-x: auto;
  width: 100%;
  margin-top: 20px;
}

/* Table styling */
.supplier-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  color: #333;
  border-radius: 12px;
  overflow: hidden;
  table-layout: auto;
  box-shadow: 0 4px 15px rgba(201, 95, 123, 0.1);
}

.supplier-table th,
.supplier-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #ffcce0;
  vertical-align: middle;
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
}

.supplier-table th {
   background: linear-gradient(90deg, #c95f7b, #ff9bb3);
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.supplier-table tbody tr:hover {
  background: #ffe6f0;
  transform: scale(1.01);
}

.table-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.table-img:hover {
  transform: scale(1.05);
}

/* No data text */
.no-data {
  text-align: center;
  padding: 25px;
  color: #c95f7b;
  font-size: 16px;
}

/* Responsive: Large Tablets */
@media (max-width: 1200px) {
  .supplier-form {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .supplier-table th,
  .supplier-table td {
    font-size: 13px;
    padding: 10px;
  }
}

/* Responsive: Mobile */
@media (max-width: 768px) {
  .supplier-form {
    grid-template-columns: 1fr;
  }

  .search-bar {
    max-width: 100%;
    padding: 10px 15px;
  }

  .supplier-table {
    display: inline-block;
    min-width: 600px;
  }

  .supplier-table th,
  .supplier-table td {
    white-space: nowrap;
    padding: 8px 10px;
    font-size: 13px;
  }
}


      `}</style>
    </div>
  );
}

export default Suppliers;
