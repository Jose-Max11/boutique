import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Designers.css";

function Designers() {
  const [designers, setDesigners] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    speciality: "",
    experience: "",
    bio: "",
    status: "active",
    profile_image: null,
  });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const tableRef = useRef(null);

  const fetchDesigners = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/designers");
      setDesigners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDesigners();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      if (editId) {
        await axios.put(`http://localhost:5000/api/designers/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://localhost:5000/api/designers", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        speciality: "",
        experience: "",
        bio: "",
        status: "active",
        profile_image: null,
      });
      setEditId(null);
      fetchDesigners();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleEdit = (designer) => {
    setFormData({
      name: designer.name || "",
      email: designer.email || "",
      phone: designer.phone || "",
      speciality: designer.speciality || "",
      experience: designer.experience || "",
      bio: designer.bio || "",
      status: designer.status || "active",
      profile_image: null,
    });
    setEditId(designer._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this designer?")) {
      try {
        await axios.delete(`http://localhost:5000/api/designers/${id}`);
        fetchDesigners();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const sortedDesigners = [...designers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const filteredDesigners = sortedDesigners.filter((d) => {
    if (!searchQuery) return true;
    return (
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="designers-page container my-4">
      <h2 className="mb-4 text-center">
        {editId ? "Edit Designer" : "Add Designer"}
      </h2>

      {/* Elegant Search Bar */}
      <div className="search-bar mb-4">
        <Search size={20} color="#fff" />
        <input
          type="text"
          placeholder="Search designers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Line Style Form */}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="designer-form mb-4"
      >
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-line"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-line"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              className="form-line"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label>Speciality</label>
            <input
              type="text"
              name="speciality"
              className="form-line"
              value={formData.speciality}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label>Experience (years)</label>
            <input
              type="number"
              name="experience"
              className="form-line"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label>Status</label>
            <select
              name="status"
              className="form-line-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-md-4">
            <label>Profile Image</label>
            <input
              type="file"
              name="profile_image"
              className="form-line-file"
              onChange={handleChange}
              accept="image/*"
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Bio</label>
          <textarea
            name="bio"
            className="form-line"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="btn-submit">
          <Plus size={22} />
        </button>
      </form>

      {/* Designer Table */}
      <div className="table-container" ref={tableRef}>
        <table className="table table-striped table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Speciality</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDesigners.length > 0 ? (
              filteredDesigners.map((d) => (
                <tr key={d._id}>
                  <td>
                    {d.profile_image && (
                      <img
                        src={`http://localhost:5000/${d.profile_image}`}
                        alt={d.name}
                        className="table-img"
                      />
                    )}
                  </td>
                  <td>{highlightText(d.name)}</td>
                  <td>{highlightText(d.email)}</td>
                  <td>{highlightText(d.speciality)}</td>
                  <td>{d.experience}</td>
                  <td>{d.status}</td>
                  <td>
                    <Edit
                      size={20}
                      color="#1247a3"
                      style={{ cursor: "pointer", marginRight: "8px" }}
                      onClick={() => handleEdit(d)}
                    />
                    <Trash2
                      size={20}
                      color="#ff2c2c"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(d._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No designers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inline CSS */}
      <style>{`
        .search-bar {
          display: flex;
          align-items: center;
          max-width: 450px;
          margin: 0 auto 20px auto;
          padding: 10px 15px;
          border-radius: 50px;
          background: #1a1a40;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .search-bar input {
          border: none;
          outline: none;
          background: transparent;
          margin-left: 10px;
          width: 100%;
          color: #fff;
          font-size: 16px;
        }
        .highlight {
          background: yellow;
          color: #feeeeeff;
          font-weight: 600;
        }
        .form-line {
          background: transparent;
          border: none;
          border-bottom: 2px solid #bbb;
          width: 100%;
          color: #fff;
          font-size: 16px;
          padding: 5px 0;
          outline: none;
        }
        .form-line:focus {
          border-bottom: 2px solid #fff;
        }
        .form-line-select,
        .form-line-file {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid #bbb;
          color: #fff;
          font-size: 16px;
          padding: 5px 0;
          outline: none;
        }
        .designer-form label {
          font-weight: 500;
          color: #f8f8f8;
          display: block;
          margin-bottom: 6px;
        }
        .btn-submit {
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #2c0e4d, #1247a3);
          padding: 10px 18px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          margin: 0 auto;
        }
        .btn-submit:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 10px rgba(29,47,75,0.5);
        }
        .table-container {
          overflow-x: auto;
          width: 100%;
        }
        .table-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }
        .no-data {
          text-align: center;
          padding: 15px;
          font-size: 16px;
          color: #555;
        }
          
      `}</style>
    </div>
  );
}

export default Designers;
