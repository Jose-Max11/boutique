// src/pages/Customize.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Sparkles, UploadCloud, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import "./Customize.css";

const BACKEND_URL = "http://localhost:5000";

export default function Customize() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "", email: "", phone: "", designer: "", productName: "", description: "",
    blouseType: "", neckType: "", sleeveType: "", backDesign: "", fitType: "", fabricType: "",
    color: "", lining: "", padding: "", hookZipPlacement: "", bustSize: "", underBust: "",
    waistSize: "", shoulderSize: "", armHole: "", sleeveLength: "", frontNeckDepth: "",
    backNeckDepth: "", blouseLength: "", chestToApex: "", notes: "", occasion: "",
    extraNotes: "", price: "", urgencyLevel: "Normal", deliveryDate: "",
    referenceImage: null, fabricImage: null, neckDesignImage: null, sleeveDesignImage: null, inspirationImage: null
  });

  const [previewRef, setPreviewRef] = useState(null);
  const [previewFabric, setPreviewFabric] = useState(null);
  const [previewNeck, setPreviewNeck] = useState(null);
  const [previewSleeve, setPreviewSleeve] = useState(null);
  const [previewInspiration, setPreviewInspiration] = useState(null);

  const [designers, setDesigners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);

  // ===== Fetch designers =====
  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/designers`);
        setDesigners(res.data || []);
      } catch (err) {
        console.error("Error fetching designers:", err);
      }
    };
    fetchDesigners();
  }, []);

  // ===== Fetch all custom orders =====
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${BACKEND_URL}/api/custom-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching custom orders:", err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ===== Handle form changes =====
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      const previewURL = URL.createObjectURL(file);
      if (name === "referenceImage") setPreviewRef(previewURL);
      if (name === "fabricImage") setPreviewFabric(previewURL);
      if (name === "neckDesignImage") setPreviewNeck(previewURL);
      if (name === "sleeveDesignImage") setPreviewSleeve(previewURL);
      if (name === "inspirationImage") setPreviewInspiration(previewURL);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : "" });
  };

  // ===== Dropdown options =====
  const blouseTypeOptions = [{ value: "Princess Cut", label: "Princess Cut" }, { value: "Boat Neck", label: "Boat Neck" }, { value: "Padded", label: "Padded" }, { value: "Back Open", label: "Back Open" }, { value: "Front Open", label: "Front Open" }];
  const neckTypeOptions = [{ value: "U-Neck", label: "U-Neck" }, { value: "V-Neck", label: "V-Neck" }, { value: "Square", label: "Square" }, { value: "Round", label: "Round" }, { value: "Collar", label: "Collar" }, { value: "High Neck", label: "High Neck" }];
  const sleeveTypeOptions = [{ value: "Elbow", label: "Elbow" }, { value: "Short", label: "Short" }, { value: "Full", label: "Full" }, { value: "Puff", label: "Puff" }, { value: "Sleeveless", label: "Sleeveless" }];
  const fitTypeOptions = [{ value: "Regular", label: "Regular" }, { value: "Slim Fit", label: "Slim Fit" }, { value: "Loose", label: "Loose" }];
  const fabricTypeOptions = [{ value: "Silk", label: "Silk" }, { value: "Cotton", label: "Cotton" }, { value: "Organza", label: "Organza" }, { value: "Net", label: "Net" }, { value: "Velvet", label: "Velvet" }, { value: "Satin", label: "Satin" }];
  const hookZipOptions = [{ value: "Back Hook", label: "Back Hook" }, { value: "Front Zip", label: "Front Zip" }, { value: "Side Hook", label: "Side Hook" }];
  const urgencyOptions = [{ value: "Normal", label: "Normal" }, { value: "Urgent", label: "Urgent" }, { value: "Express", label: "Express" }];
  const yesNoOptions = [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }];

  // ===== Submit form (create or update) =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first!");

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      let res;
      if (editingOrderId) {
        res = await axios.put(`${BACKEND_URL}/api/custom-orders/${editingOrderId}`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        alert("✨ Order updated successfully!");
      } else {
        res = await axios.post(`${BACKEND_URL}/api/custom-orders`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        alert("✨ Custom order submitted successfully!");
      }
      resetForm();
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "", email: "", phone: "", designer: "", productName: "", description: "",
      blouseType: "", neckType: "", sleeveType: "", backDesign: "", fitType: "", fabricType: "",
      color: "", lining: "", padding: "", hookZipPlacement: "", bustSize: "", underBust: "",
      waistSize: "", shoulderSize: "", armHole: "", sleeveLength: "", frontNeckDepth: "",
      backNeckDepth: "", blouseLength: "", chestToApex: "", notes: "", occasion: "",
      extraNotes: "", price: "", urgencyLevel: "Normal", deliveryDate: "",
      referenceImage: null, fabricImage: null, neckDesignImage: null, sleeveDesignImage: null, inspirationImage: null
    });
    setPreviewRef(null); setPreviewFabric(null); setPreviewNeck(null); setPreviewSleeve(null); setPreviewInspiration(null);
  };

  const renderImage = (filename) => filename ? `${BACKEND_URL}/uploads/${filename}` : null;

  // ===== Handle Edit =====
  const handleEdit = (order) => {
    setEditingOrderId(order._id);
    setFormData({
      customerName: order.customerName || "", email: order.email || "", phone: order.phone || "",
      designer: order.designer?._id || "", productName: order.productName || "", description: order.description || "",
      blouseType: order.blouseType || "", neckType: order.neckType || "", sleeveType: order.sleeveType || "",
      backDesign: order.backDesign || "", fitType: order.fitType || "", fabricType: order.fabricType || "",
      color: order.color || "", lining: order.lining || "", padding: order.padding || "",
      hookZipPlacement: order.hookZipPlacement || "", bustSize: order.bustSize || "", underBust: order.underBust || "",
      waistSize: order.waistSize || "", shoulderSize: order.shoulderSize || "", armHole: order.armHole || "",
      sleeveLength: order.sleeveLength || "", frontNeckDepth: order.frontNeckDepth || "", backNeckDepth: order.backNeckDepth || "",
      blouseLength: order.blouseLength || "", chestToApex: order.chestToApex || "", notes: order.notes || "",
      occasion: order.occasion || "", extraNotes: order.extraNotes || "", price: order.price || "",
      urgencyLevel: order.urgencyLevel || "Normal", deliveryDate: order.deliveryDate ? order.deliveryDate.split("T")[0] : "",
      referenceImage: null, fabricImage: null, neckDesignImage: null, sleeveDesignImage: null, inspirationImage: null
    });
    setPreviewRef(renderImage(order.referenceImage));
    setPreviewFabric(renderImage(order.fabricImage));
    setPreviewNeck(renderImage(order.neckDesignImage));
    setPreviewSleeve(renderImage(order.sleeveDesignImage));
    setPreviewInspiration(renderImage(order.inspirationImage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===== Handle Delete =====
  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BACKEND_URL}/api/custom-orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Order deleted successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Error deleting order");
    }
  };

  return (
    <>
      <Navbar />
      <div className="dress-customization">
        <div className="form-container">
          <h1 className="form-title"><Sparkles /> Customize Your Saree Blouse 💃</h1>
          <p className="form-sub">Fill your preferences to get your perfect fit ✨</p>

          <form className="custom-form" onSubmit={handleSubmit}>
            {/* ===== Customer Details ===== */}
            <h2 className="section-heading">👩 Customer Details</h2>
            <input name="customerName" placeholder="Full Name" value={formData.customerName} onChange={handleChange} className="field" required />
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="field" required />
            <input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="field" required />

            <select name="designer" value={formData.designer} onChange={handleChange} className="field" required>
              <option value="">Select Designer</option>
              {designers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>

            {/* ===== Blouse Design Preferences ===== */}
            <h2 className="section-heading">👗 Blouse Design Preferences</h2>
            <input name="productName" placeholder="Product Name" value={formData.productName} onChange={handleChange} className="field" />
            <textarea name="description" placeholder="Describe your blouse design" value={formData.description} onChange={handleChange} className="field textarea-field" />

            <CreatableSelect isClearable placeholder="Blouse Type" options={blouseTypeOptions} onChange={(v) => handleSelectChange("blouseType", v)}
              value={formData.blouseType ? { value: formData.blouseType, label: formData.blouseType } : null} className="react-select" />
            <CreatableSelect isClearable placeholder="Neck Design" options={neckTypeOptions} onChange={(v) => handleSelectChange("neckType", v)}
              value={formData.neckType ? { value: formData.neckType, label: formData.neckType } : null} className="react-select" />
            <CreatableSelect isClearable placeholder="Sleeve Type" options={sleeveTypeOptions} onChange={(v) => handleSelectChange("sleeveType", v)}
              value={formData.sleeveType ? { value: formData.sleeveType, label: formData.sleeveType } : null} className="react-select" />
            <input name="backDesign" placeholder="Back Design" value={formData.backDesign} onChange={handleChange} className="field" />
            <CreatableSelect isClearable placeholder="Fit Type" options={fitTypeOptions} onChange={(v) => handleSelectChange("fitType", v)}
              value={formData.fitType ? { value: formData.fitType, label: formData.fitType } : null} className="react-select" />
            <CreatableSelect isClearable placeholder="Fabric Type" options={fabricTypeOptions} onChange={(v) => handleSelectChange("fabricType", v)}
              value={formData.fabricType ? { value: formData.fabricType, label: formData.fabricType } : null} className="react-select" />

            <input name="color" placeholder="Color" value={formData.color} onChange={handleChange} className="field" />
            <CreatableSelect isClearable placeholder="Lining Required?" options={yesNoOptions} onChange={(v) => handleSelectChange("lining", v)}
              value={formData.lining ? { value: formData.lining, label: formData.lining } : null} className="react-select" />
            <CreatableSelect isClearable placeholder="Padding Required?" options={yesNoOptions} onChange={(v) => handleSelectChange("padding", v)}
              value={formData.padding ? { value: formData.padding, label: formData.padding } : null} className="react-select" />
            <CreatableSelect isClearable placeholder="Hook/Zip Placement" options={hookZipOptions} onChange={(v) => handleSelectChange("hookZipPlacement", v)}
              value={formData.hookZipPlacement ? { value: formData.hookZipPlacement, label: formData.hookZipPlacement } : null} className="react-select" />

            {/* ===== Measurements ===== */}
            <h2 className="section-heading">📏 Measurements</h2>
            <input name="bustSize" placeholder="Bust" value={formData.bustSize} onChange={handleChange} className="field" />
            <input name="underBust" placeholder="Under Bust" value={formData.underBust} onChange={handleChange} className="field" />
            <input name="waistSize" placeholder="Waist" value={formData.waistSize} onChange={handleChange} className="field" />
            <input name="shoulderSize" placeholder="Shoulder Width" value={formData.shoulderSize} onChange={handleChange} className="field" />
            <input name="armHole" placeholder="Arm Hole" value={formData.armHole} onChange={handleChange} className="field" />
            <input name="sleeveLength" placeholder="Sleeve Length" value={formData.sleeveLength} onChange={handleChange} className="field" />
            <input name="frontNeckDepth" placeholder="Front Neck Depth" value={formData.frontNeckDepth} onChange={handleChange} className="field" />
            <input name="backNeckDepth" placeholder="Back Neck Depth" value={formData.backNeckDepth} onChange={handleChange} className="field" />
            <input name="blouseLength" placeholder="Blouse Length" value={formData.blouseLength} onChange={handleChange} className="field" />
            <input name="chestToApex" placeholder="Chest to Apex" value={formData.chestToApex} onChange={handleChange} className="field" />
            <textarea name="notes" placeholder="Additional Notes for Measurements" value={formData.notes} onChange={handleChange} className="field textarea-field" />

            {/* ===== Additional Details ===== */}
            <h2 className="section-heading">🗒️ Additional Details</h2>
            <input name="occasion" placeholder="Occasion Type" value={formData.occasion} onChange={handleChange} className="field" />
            <input name="price" placeholder="Proposed Price (₹)" value={formData.price} onChange={handleChange} className="field" />
            <textarea name="extraNotes" placeholder="Extra Notes / Special Instructions" value={formData.extraNotes} onChange={handleChange} className="field textarea-field" />
            <CreatableSelect isClearable placeholder="Urgency Level" options={urgencyOptions} onChange={(v) => handleSelectChange("urgencyLevel", v)}
              value={formData.urgencyLevel ? { value: formData.urgencyLevel, label: formData.urgencyLevel } : null} className="react-select" />
            <input name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleChange} className="field" />

            {/* ===== File Uploads ===== */}
            <h2 className="section-heading">📷 Upload Reference Images</h2>
            <label className="file-label">
              <UploadCloud /> Reference Image
              <input type="file" name="referenceImage" accept="image/*" onChange={handleChange} />
            </label>
            {previewRef && <img src={previewRef} alt="Reference Preview" className="preview-image" />}
            <label className="file-label">
              <UploadCloud /> Fabric Image
              <input type="file" name="fabricImage" accept="image/*" onChange={handleChange} />
            </label>
            {previewFabric && <img src={previewFabric} alt="Fabric Preview" className="preview-image" />}
            <label className="file-label">
              <UploadCloud /> Neck Design Image
              <input type="file" name="neckDesignImage" accept="image/*" onChange={handleChange} />
            </label>
            {previewNeck && <img src={previewNeck} alt="Neck Preview" className="preview-image" />}
            <label className="file-label">
              <UploadCloud /> Sleeve Design Image
              <input type="file" name="sleeveDesignImage" accept="image/*" onChange={handleChange} />
            </label>
            {previewSleeve && <img src={previewSleeve} alt="Sleeve Preview" className="preview-image" />}
            <label className="file-label">
              <UploadCloud /> Inspiration Image
              <input type="file" name="inspirationImage" accept="image/*" onChange={handleChange} />
            </label>
            {previewInspiration && <img src={previewInspiration} alt="Inspiration Preview" className="preview-image" />}

            <button type="submit" className="submit-btn">{editingOrderId ? "Update Order" : "Submit Customization"}</button>
          </form>

          {/* ===== Previous Orders ===== */}
          <div className="previous-orders">
            <h2>📦 Your Previous Custom Orders</h2>
            {orders.length === 0 ? <p>No orders found</p> :
              orders.map(order => (
                <div key={order._id} className="order-card">
                  <h3>{order.productName || "Unnamed Product"}</h3>
<p>Designer: {designers.find(d => d._id === (order.designer?._id || order.designer))?.name || "N/A"}</p>
                  <p>Blouse Type: {order.blouseType}</p>
                  <p>Neck: {order.neckType}</p>
                  <p>Sleeve: {order.sleeveType}</p>
                  <p>Fit: {order.fitType}</p>
                  <p>Fabric: {order.fabricType}</p>
                  <p>Color: {order.color}</p>
                  <p>Back Design: {order.backDesign}</p>
                  <p>Bust: {order.bustSize}, Waist: {order.waistSize}, Shoulder: {order.shoulderSize}</p>
                  <p>Notes: {order.notes}</p>
                  <div className="order-images">
                    {order.referenceImage && <img src={renderImage(order.referenceImage)} alt="Reference" className="order-preview" />}
                    {order.fabricImage && <img src={renderImage(order.fabricImage)} alt="Fabric" className="order-preview" />}
                    {order.neckDesignImage && <img src={renderImage(order.neckDesignImage)} alt="Neck" className="order-preview" />}
                    {order.sleeveDesignImage && <img src={renderImage(order.sleeveDesignImage)} alt="Sleeve" className="order-preview" />}
                    {order.inspirationImage && <img src={renderImage(order.inspirationImage)} alt="Inspiration" className="order-preview" />}
                  </div>
                  <div className="order-actions">
                    <button onClick={() => handleEdit(order)} className="edit-btn"><Edit /> Edit</button>
                    <button onClick={() => handleDelete(order._id)} className="delete-btn"><Trash2 /> Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
