import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Designers.css";

function Designers() {
  const [designers, setDesigners] = useState([]);
  const [formData, setFormData] = useState({
    designerId: "",
    name: "",
    email: "",
    phone: "",
    speciality: "",
    experience: "",
    bio: "",
    skills: "",
    services: "",
    certifications: "",
    languages: "",
    hourly_rate: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    social_instagram: "",
    social_facebook: "",
    social_pinterest: "",
    social_website: "",
    designsCreated: "",
    completedOrders: "",
    pendingOrders: "",
    averageRating: "",
    paymentMode: "upi",
    bankName: "",
    acc_no: "",
    ifscCode: "",
    upi_id: "",
    status: "active",
    availability: "available",
    joinedDate: "",
    notes: "",
    remarks: "",
    profile_image: null,
    portfolioImages: [],
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
      if (e.target.multiple) {
        setFormData({ ...formData, [name]: [...files] });
      } else {
        setFormData({ ...formData, [name]: files[0] });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = new FormData();

    // Append all form fields to FormData
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== null && value !== "") {
        if (key === "portfolioImages" && Array.isArray(value)) {
          value.forEach((img) => data.append("portfolioImages", img));
        } else if (key === "profile_image" && value instanceof File) {
          data.append("profile_image", value);
        } else {
          data.append(key, value);
        }
      }
    });

    if (editId) {
      // Update existing designer
      await axios.put(`http://localhost:5000/api/designers/${editId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Designer updated successfully!");
    } else {
      // Add new designer
      await axios.post("http://localhost:5000/api/designers", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Designer added successfully!");
    }

    fetchDesigners(); // Refresh table
    setEditId(null);  // Reset edit mode
    // Reset form
    setFormData({
      designerId: "",
      name: "",
      email: "",
      phone: "",
      speciality: "",
      experience: "",
      bio: "",
      skills: "",
      services: "",
      certifications: "",
      languages: "",
      hourly_rate: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      social_instagram: "",
      social_facebook: "",
      social_pinterest: "",
      social_website: "",
      designsCreated: "",
      completedOrders: "",
      pendingOrders: "",
      averageRating: "",
      paymentMode: "upi",
      bankName: "",
      acc_no: "",
      ifscCode: "",
      upi_id: "",
      status: "active",
      availability: "available",
      joinedDate: "",
      notes: "",
      remarks: "",
      profile_image: null,
      portfolioImages: [],
    });
  } catch (err) {
    console.error(err.response?.data || err.message);

    // Handle duplicate email
    if (err.response?.data?.message?.includes("duplicate key")) {
      alert("Email already exists! Use a different email.");
    } else {
      alert("An error occurred. Check console for details.");
    }
  }
};


  const handleEdit = (designer) => {
    setFormData({
      ...designer,
      skills: designer.skills?.join(", ") || "",
      services: designer.services?.join(", ") || "",
      certifications: designer.certifications?.join(", ") || "",
      languages: designer.languages?.join(", ") || "",
      profile_image: null,
      portfolioImages: [],
      social_instagram: designer.social_links?.instagram || "",
      social_facebook: designer.social_links?.facebook || "",
      social_pinterest: designer.social_links?.pinterest || "",
      social_website: designer.social_links?.website || "",
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

      {/* Extended Form */}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="designer-form mb-4"
      >
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Designer ID</label>
            <input
              type="text"
              name="designerId"
              className="form-line"
              value={formData.designerId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
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
          <div className="col-md-4">
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

        {/* Next Row */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              className="form-line"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Speciality</label>
            <input
              type="text"
              name="speciality"
              className="form-line"
              value={formData.speciality}
              onChange={handleChange}
            />
          </div>
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
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              className="form-line"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label>Services</label>
            <input
              type="text"
              name="services"
              className="form-line"
              value={formData.services}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Certifications</label>
            <input
              type="text"
              name="certifications"
              className="form-line"
              value={formData.certifications}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label>Languages</label>
            <input
              type="text"
              name="languages"
              className="form-line"
              value={formData.languages}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label>Hourly Rate</label>
            <input
              type="number"
              name="hourly_rate"
              className="form-line"
              value={formData.hourly_rate}
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
            <label>Availability</label>
            <select
              name="availability"
              className="form-line-select"
              value={formData.availability}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Address</label>
            <input
              type="text"
              name="address"
              className="form-line"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>City</label>
            <input
              type="text"
              name="city"
              className="form-line"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>State</label>
            <input
              type="text"
              name="state"
              className="form-line"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label>Pincode</label>
            <input
              type="text"
              name="pincode"
              className="form-line"
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Country</label>
            <input
              type="text"
              name="country"
              className="form-line"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Instagram</label>
            <input
              type="text"
              name="social_instagram"
              className="form-line"
              value={formData.social_instagram}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Facebook</label>
            <input
              type="text"
              name="social_facebook"
              className="form-line"
              value={formData.social_facebook}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* More Socials */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Pinterest</label>
            <input
              type="text"
              name="social_pinterest"
              className="form-line"
              value={formData.social_pinterest}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label>Website</label>
            <input
              type="text"
              name="social_website"
              className="form-line"
              value={formData.social_website}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Portfolio and Payment */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Portfolio Images</label>
            <input
              type="file"
              name="portfolioImages"
              className="form-line-file"
              multiple
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label>Profile Image</label>
            <input
              type="file"
              name="profile_image"
              className="form-line-file"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label>Payment Mode</label>
            <select
              name="paymentMode"
              className="form-line-select"
              value={formData.paymentMode}
              onChange={handleChange}
            >
              <option value="cash">Cash</option>
              <option value="bank transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              className="form-line"
              value={formData.bankName}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Account No</label>
            <input
              type="text"
              name="acc_no"
              className="form-line"
              value={formData.acc_no}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              className="form-line"
              value={formData.ifscCode}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>UPI ID</label>
            <input
              type="text"
              name="upi_id"
              className="form-line"
              value={formData.upi_id}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label>Designs Created</label>
            <input
              type="number"
              name="designsCreated"
              className="form-line"
              value={formData.designsCreated}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Completed Orders</label>
            <input
              type="number"
              name="completedOrders"
              className="form-line"
              value={formData.completedOrders}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Pending Orders</label>
            <input
              type="number"
              name="pendingOrders"
              className="form-line"
              value={formData.pendingOrders}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Average Rating</label>
            <input
              type="number"
              step="0.1"
              name="averageRating"
              className="form-line"
              value={formData.averageRating}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Notes & Remarks */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Notes</label>
            <textarea
              name="notes"
              className="form-line"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label>Remarks</label>
            <textarea
              name="remarks"
              className="form-line"
              value={formData.remarks}
              onChange={handleChange}
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
          />
        </div>

        <button type="submit" className="btn-submit">
          <Plus size={22} />
        </button>
      </form>

      {/* Designer Table */}
      {/* Designer Table */}
<div className="table-container" ref={tableRef}>
  <table className="table table-striped table-bordered text-center">
    <thead className="table-dark">
      <tr>
        <th>Profile</th>
        <th>Designer ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Speciality</th>
        <th>Experience</th>
        <th>Skills</th>
        <th>Services</th>
        <th>Certifications</th>
        <th>Languages</th>
        <th>Hourly Rate</th>
        <th>Address</th>
        <th>City</th>
        <th>State</th>
        <th>Pincode</th>
        <th>Country</th>
        <th>Instagram</th>
        <th>Facebook</th>
        <th>Pinterest</th>
        <th>Website</th>
        <th>Designs Created</th>
        <th>Completed Orders</th>
        <th>Pending Orders</th>
        <th>Average Rating</th>
        <th>Payment Mode</th>
        <th>Bank Name</th>
        <th>Acc No</th>
        <th>IFSC</th>
        <th>UPI ID</th>
        <th>Status</th>
        <th>Availability</th>
        <th>Joined Date</th>
        <th>Notes</th>
        <th>Remarks</th>
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
            <td>{d.designerId}</td>
            <td>{highlightText(d.name)}</td>
            <td>{highlightText(d.email)}</td>
            <td>{d.phone}</td>
            <td>{d.speciality}</td>
            <td>{d.experience}</td>
            <td>{Array.isArray(d.skills) ? d.skills.join(", ") : d.skills}</td>
            <td>{Array.isArray(d.services) ? d.services.join(", ") : d.services}</td>
            <td>{Array.isArray(d.certifications) ? d.certifications.join(", ") : d.certifications}</td>
            <td>{Array.isArray(d.languages) ? d.languages.join(", ") : d.languages}</td>
            <td>{d.hourly_rate}</td>
            <td>{d.address}</td>
            <td>{d.city}</td>
            <td>{d.state}</td>
            <td>{d.pincode}</td>
            <td>{d.country}</td>
            <td>{d.social_links?.instagram}</td>
            <td>{d.social_links?.facebook}</td>
            <td>{d.social_links?.pinterest}</td>
            <td>{d.social_links?.website}</td>
            <td>{d.designsCreated}</td>
            <td>{d.completedOrders}</td>
            <td>{d.pendingOrders}</td>
            <td>{d.averageRating}</td>
            <td>{d.paymentMode}</td>
            <td>{d.bankName}</td>
            <td>{d.acc_no}</td>
            <td>{d.ifscCode}</td>
            <td>{d.upi_id}</td>
            <td>{d.status}</td>
            <td>{d.availability}</td>
            <td>{d.joinedDate?.substring(0, 10)}</td>
            <td>{d.notes}</td>
            <td>{d.remarks}</td>
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
          <td colSpan="37" className="no-data">
            No designers found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

    </div>
  );
}

export default Designers;
