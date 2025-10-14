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
    // Sort categories alphabetically by name
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

  // Filter + prioritize search results
  const filteredCategories = [...categories]
    .filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  return (
    <div className="category-container">
      <h2 className="page-title">Category Management</h2>

      {/* Search Bar */}
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

      {/* Form */}
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
            placeholder="Enter category description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-icon">
          <Plus size={20} />
        </button>
      </form>

      {/* Table */}
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
                <td colSpan="3" style={{ textAlign: "center", color: "#555" }}>
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inline Styles */}
      <style>{`
        .category-container {
          max-width: 900px;
          margin: 50px auto;
          padding: 35px;
          background: #111129ff;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          font-family: "Poppins", sans-serif;
          color: #fff;
        }

        .page-title {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 30px;
        }

        /* Search bar */
        .search-container {
          position: relative;
          width: 100%;
          margin-bottom: 30px;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 10px;
          transform: translateY(-50%);
          color: #fff;
        }

        .search-input {
          width: 100%;
          padding: 10px 40px;
          border: none;
          border-bottom: 2px solid #fff;
          background: transparent;
          color: #fff;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .search-input:focus {
          border-color: #ffffffff;
        }

        /* Form */
        .category-form {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 20px;
          align-items: end;
          margin-bottom: 40px;
        }

        .input-group label {
          display: block;
          font-size: 14px;
          margin-bottom: 6px;
          color: #cfcfcf;
        }

        .input-group input {
          width: 100%;
          padding: 10px;
          background: transparent;
          border: none;
          border-bottom: 2px solid #fff;
          color: #fff;
          outline: none;
          transition: 0.3s;
        }

        .input-group input::placeholder {
          color: rgba(255,255,255,0.5);
        }

        .input-group input:focus {
          border-color: #ffffffff;
        }

        .btn-icon {
          background: #22223cff;
          border: none;
          padding: 10px 16px;
          border-radius: 50%;
          cursor: pointer;
          transition: 0.3s;
          color: #fff;
        }

        .btn-icon:hover {
          transform: scale(1.1);
          background: #111129ff;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .category-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 15px;
          overflow: hidden;
          background: #ffffff;
          color: #000;
        }

        .category-table th, .category-table td {
          padding: 15px 20px;
          font-size: 16px;
          border-bottom: 1px solid #ddd;
        }

        .category-table th {
          background: #08172dff;
          color: #fff;
          font-weight: 600;
          text-align: left;
        }

        .actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          transition: 0.3s;
        }

        .icon-btn.edit:hover svg {
          color: #1247a3ff;
        }

        .icon-btn.delete:hover svg {
          color: #c22121ff;
        }

        @media (max-width: 600px) {
          .category-form {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default CategoryPage;
