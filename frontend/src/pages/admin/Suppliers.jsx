import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search } from "lucide-react";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    areasCovered: "",
    productsHandled: 0,
    productsDelivered: 0,
    productsPending: 0,
    status: "active",
    image: null,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
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
        name: "",
        email: "",
        phone: "",
        address: "",
        areasCovered: "",
        productsHandled: 0,
        productsDelivered: 0,
        productsPending: 0,
        status: "active",
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
      name: s.name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      areasCovered: Array.isArray(s.areasCovered) ? s.areasCovered.join(", ") : s.areasCovered || "",
      productsHandled: s.productsHandled,
      productsDelivered: s.productsDelivered,
      productsPending: s.productsPending,
      status: s.status,
      image: null,
    });
    setEditId(s._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Search filter — matched suppliers first
  const filteredSuppliers = [...suppliers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => {
      const aMatch =
        searchQuery &&
        (a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.phone?.includes(searchQuery) ||
          a.areasCovered?.join(", ").toLowerCase().includes(searchQuery.toLowerCase()));
      const bMatch =
        searchQuery &&
        (b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.phone?.includes(searchQuery) ||
          b.areasCovered?.join(", ").toLowerCase().includes(searchQuery.toLowerCase()));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

  return (
    <div className="suppliers-container">
      <h2 className="page-title">Supplier Management</h2>

      {/* Search Bar */}
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
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Areas Covered</label>
          <input
            type="text"
            name="areasCovered"
            value={formData.areasCovered}
            onChange={handleChange}
            placeholder="Comma separated"
          />
        </div>
        <div className="form-group">
          <label>Products Handled</label>
          <input type="number" name="productsHandled" value={formData.productsHandled} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Products Delivered</label>
          <input type="number" name="productsDelivered" value={formData.productsDelivered} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Products Pending</label>
          <input type="number" name="productsPending" value={formData.productsPending} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="form-group">
          <label>Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
        </div>
        <button type="submit" className="btn-submit">
          <Plus size={30} />
        </button>
      </form>

      {/* Supplier Table */}
      <div className="table-container">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Areas Covered</th>
              <th>Handled</th>
              <th>Delivered</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s) => (
                <tr key={s._id}>
                  <td>{s.image ? <img src={`http://localhost:5000/${s.image}`} alt={s.name} className="table-img" /> : "No Image"}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.address}</td>
                  <td>{Array.isArray(s.areasCovered) ? s.areasCovered.join(", ") : s.areasCovered}</td>
                  <td>{s.productsHandled}</td>
                  <td>{s.productsDelivered}</td>
                  <td>{s.productsPending}</td>
                  <td>{s.status}</td>
                  <td>
                    <Edit size={20} color="#1247a3" style={{ cursor: "pointer", marginRight: "8px" }} onClick={() => handleEdit(s)} />
                    <Trash2 size={20} color="#ff2c2c" style={{ cursor: "pointer" }} onClick={() => handleDelete(s._id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="11" className="no-data">No suppliers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .suppliers-container { max-width: 1500px; margin: 50px auto; padding: 35px; background: #111129; border-radius: 20px; font-family: "Poppins", sans-serif; color: #fff; }
        .page-title { text-align: center; font-size: 32px; font-weight: 700; margin-bottom: 20px; }
        .search-bar { display: flex; align-items: center; max-width: 450px; margin: 0 auto 30px auto; padding: 10px 15px; border-radius: 50px; background: #1a1a40; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .search-bar input { border: none; outline: none; background: transparent; margin-left: 10px; width: 100%; color: #fff; font-size: 16px; }
        .supplier-form { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 6px; font-weight: 600; font-size: 14px; }
        .supplier-form input, .supplier-form select { padding: 12px 18px; border-radius: 50px; border: 1px solid #f8f8f8; background: #121238; color: #fff; font-size: 15px; outline: none; transition: all 0.3s; }
        .btn-submit { display: flex; justify-content: center; align-items: center; background: linear-gradient(135deg, #ffffffff, #eef4ffff); padding: 12px; border-radius: 50px; border: none; cursor: pointer; transition: all 0.3s; }
        .btn-submit:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(7, 16, 32, 0.7); }
        .table-container { overflow-x: auto; }
        .supplier-table { width: 100%; border-collapse: collapse; background: #fff; color: #000; border-radius: 10px; overflow: hidden; }
        .supplier-table th, .supplier-table td { padding: 12px 16px; text-align: center; border-bottom: 1px solid #ddd; }
        .supplier-table th { background: #061027ff; color: #fff; font-weight: 600; }
        .table-img { width: 60px; height: 60px; border-radius: 10px; object-fit: cover; }
        .no-data { text-align: center; padding: 20px; color: #555; font-size: 16px; }
      `}</style>
    </div>
  );
}

export default Suppliers;
