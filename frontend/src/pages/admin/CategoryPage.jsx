import { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories");
    const sorted = res.data.sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" })
    );
    setCategories(sorted);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/categories/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/api/categories", form);
      }
      setForm({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description });
    setEditingId(cat._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this category?")) {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      fetchCategories();
    }
  };

  const filteredCategories = [...categories]
    .filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  return (
    <div className="category-container">
      <h2 className="page-title">💎 Category Management</h2>

      {/* 🌸 Centered Search Bar */}
      <div className="search-wrapper">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* 🌷 Form */}
      <form onSubmit={handleSubmit} className="category-form">
        <div className="input-group">
          <label>Category Name</label>
          <input
            type="text"
            placeholder="Enter category name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <label>Description</label>
          <input
            type="text"
            placeholder="Enter description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-icon">
          <Plus size={20} />
        </button>
      </form>

      {/* 🌼 Table */}
      <div className="table-wrapper">
        <table className="category-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(cat)} className="icon-btn edit">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="icon-btn delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan="3" className="no-data">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✨ Elegant Styles */}
      <style>{`
        .category-container {
          max-width: 1000px;
          margin: 60px auto;
          padding: 45px;
          border-radius: 25px;
          background: linear-gradient(145deg, #fff5f7, #ffe8ee);
          box-shadow: 0 8px 25px rgba(201, 95, 123, 0.25);
          font-family: "Poppins", sans-serif;
          color: #444;
        }

        .page-title {
          text-align: center;
          font-size: 36px;
          color: #c95f7b;
          font-weight: 700;
          margin-bottom: 35px;
          letter-spacing: 1px;
          text-shadow: 1px 1px 3px rgba(201, 95, 123, 0.3);
        }

        /* 🌸 Centered Search Bar */
        .search-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 35px;
        }
        .search-container {
          position: relative;
          width: 70%;
          max-width: 500px;
        }
        .search-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: #c95f7b;
        }
        .search-input {
          width: 100%;
          padding: 12px 40px;
          border-radius: 15px;
          border: 1px solid #f2c3d0;
          font-size: 16px;
          outline: none;
          transition: 0.3s ease;
          background-color: #fff;
        }
        .search-input:focus {
          border-color: #c95f7b;
          box-shadow: 0 0 8px rgba(201, 95, 123, 0.3);
        }

        /* 🌷 Form */
        .category-form {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 25px;
          margin-bottom: 40px;
          align-items: end;
        }
        .input-group label {
          font-weight: 500;
          color: #c95f7b;
          margin-bottom: 6px;
          display: block;
        }
        .input-group input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #f2c3d0;
          outline: none;
          background: #fff;
          transition: 0.3s;
        }
        .input-group input:focus {
          border-color: #c95f7b;
          box-shadow: 0 0 5px rgba(201, 95, 123, 0.2);
        }

        /* 💖 Button */
        .btn-icon {
          background: linear-gradient(135deg, #c95f7b, #ff9bb3);
          border: none;
          border-radius: 50%;
          padding: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(201, 95, 123, 0.3);
        }
        .btn-icon:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, #b84b6b, #ff8ea8);
        }

        /* 🌺 Table */
        .table-wrapper {
          overflow-x: auto;
          border-radius: 20px;
          margin-top: 15px;
        }
        .category-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
        }
        .category-table th {
          background: linear-gradient(90deg, #c95f7b, #ff9bb3);
          color: white;
          text-align: left;
          padding: 15px 18px;
          font-weight: 600;
          font-size: 16px;
        }
        .category-table td {
          padding: 15px 18px;
          border-bottom: 1px solid #f9d6de;
        }
        .category-table tr:nth-child(even) {
          background: #fff5f8;
        }
        .category-table tr:hover {
          background: #ffe6ef;
          transition: 0.3s;
        }

        /* 🎨 Actions */
        .actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          transition: 0.3s ease;
        }
        .icon-btn.edit svg {
          color: #c95f7b;
        }
        .icon-btn.edit:hover svg {
          color: #a13f60;
          transform: scale(1.1);
        }
        .icon-btn.delete svg {
          color: #d9534f;
        }
        .icon-btn.delete:hover svg {
          color: #b52a2a;
          transform: scale(1.1);
        }

        .no-data {
          text-align: center;
          padding: 20px;
          color: #777;
        }

        @media (max-width: 700px) {
          .category-form {
            grid-template-columns: 1fr;
          }
          .search-container {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
}

export default CategoryPage;
