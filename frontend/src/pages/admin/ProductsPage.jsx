import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, X, Search } from "lucide-react";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    stock: "",
    unit: "pcs",
    category: "",
    status: "active",
    newImages: [],
    existingImages: [],
    // Attribute fields
    sizes: [{ size: "", price: "" }],
    color: [""],colorLabels: [""], 
    dressType: "",
    neckType: "",
    sleeveType: "",
    pattern: "",
    occasion: "",
    fitType: "",
    fabricType: "",
    liningMaterial: "",
    transparency: "",
    length: "",
    bustSize: "",
    waistSize: "",
    discount: "",
    washCare: "",
    returnPolicy: "",
    sellerName: "",
    offer: "",
  });

  // Dropdown options
  const dressTypeOptions = ["Casual", "Party", "Bridal"];
  const neckTypeOptions = ["Round", "V-Neck", "Collar"];
  const sleeveTypeOptions = ["Full Sleeve", "Half Sleeve", "Sleeveless"];
  const patternOptions = ["Plain", "Printed", "Embroidered"];
  const occasionOptions = ["Casual", "Wedding", "Festive"];
  const fitTypeOptions = ["Regular", "Slim", "Loose"];
  const fabricTypeOptions = ["Cotton", "Silk", "Linen"];
  const liningOptions = ["Cotton", "Silk", "Polyester"];
  const transparencyOptions = ["Transparent", "Semi-Transparent", "Opaque"];
// Clean color labels so they always show correctly
function cleanColorLabels(labels) {
  if (!labels) return [];
  if (typeof labels === "string") {
    try {
      // Try to parse if it's a JSON-like string
      const parsed = JSON.parse(labels);
      if (Array.isArray(parsed)) return parsed.filter((l) => l && l.trim() !== "");
    } catch (e) {
      // Otherwise, split by commas
      return labels
        .split(",")
        .map((l) => l.replace(/[[\]"]/g, "").trim())
        .filter((l) => l !== "");
    }
  }
  // If already array
  return labels
    .map((l) => (typeof l === "string" ? l.replace(/[[\]"]/g, "").trim() : l))
    .filter((l) => l !== "");
}


  // Fetch products & categories
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    setForm({ ...form, newImages: Array.from(e.target.files) });
  };

  // Handle multiple sizes
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...form.sizes];
    newSizes[index][field] = value;
    setForm({ ...form, sizes: newSizes });
  };

  const addSize = () => setForm({ ...form, sizes: [...form.sizes, { size: "", price: "" }] });
  const removeSize = (index) => {
    const newSizes = form.sizes.filter((_, i) => i !== index);
    setForm({ ...form, sizes: newSizes });
  };

  // Handle multiple colors
const handleColorChange = (index, value) => {
  const newColor = [...form.color];
  newColor[index] = value;
  setForm({ ...form, color: newColor });
};

const handleColorLabelChange = (index, value) => {
  const newLabels = [...(form.colorLabels || [])];
  newLabels[index] = value;
  setForm({ ...form, colorLabels: newLabels });
};

const addColor = () => {
  setForm({ 
    ...form, 
    color: [...form.color, ""], 
    colorLabels: [...(form.colorLabels || []), ""] 
  });
};

const removeColor = (index) => {
  setForm({ 
    ...form, 
    color: form.color.filter((_, i) => i !== index), 
    colorLabels: form.colorLabels.filter((_, i) => i !== index)
  });
};

  const getImageUrl = (img) => {
    if (!img) return "";
    const path = img.startsWith("/") ? img.slice(1) : img;
    return `http://localhost:5000/${path}`;
  };

  // Submit form
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();

    // Append normal fields
    Object.entries(form).forEach(([key, value]) => {
      if (!["newImages", "existingImages", "sizes", "color"].includes(key))
        formData.append(key, value);
    });

    // Append new images
    form.newImages.forEach((img) => formData.append("images", img));

    // Append existing images
    formData.append("existingImages", JSON.stringify(form.existingImages || []));

    // Append sizes & colors as JSON arrays
    formData.append("sizes", JSON.stringify(form.sizes.map(s => ({ size: s.size || "", price: s.price || "" }))));
    formData.append("color", JSON.stringify(form.color.filter(c => c.trim() !== "")));
formData.append("colorLabels", JSON.stringify(form.colorLabels || [])); 
    // Send to backend
    if (editingId) {
      await axios.put(`http://localhost:5000/api/products/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditingId(null);
    } else {
      await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // Reset form
    setForm({
      name: "", description: "", price: "", costPrice: "", stock: "", unit: "pcs", category: "", status: "active",
      newImages: [], existingImages: [], sizes: [{ size: "", price: "" }], color: [""],colorLabels: [""],
      dressType: "", neckType: "", sleeveType: "", pattern: "", occasion: "", fitType: "", fabricType: "",
      liningMaterial: "", transparency: "", length: "", bustSize: "", waistSize: "", discount: "",
      washCare: "", returnPolicy: "", sellerName: "", offer: ""
    });
    setShowForm(false);
    fetchProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Error saving product");
  }
};


  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setForm({
      name: prod.name || "",
      description: prod.description || "",
      price: prod.price || "",
      costPrice: prod.costPrice || "",
      stock: prod.stock || "",
      unit: prod.unit || "pcs",
      category: prod.category?._id || "",
      status: prod.status || "active",
      newImages: [],
      existingImages: prod.images || [],
      sizes: prod.sizes?.length ? prod.sizes : [{ size: "", price: "" }],
      color: prod.color?.length ? prod.color : [""],
      colorLabels: prod.colorLabels?.length ? prod.colorLabels : [""],
      dressType: prod.dressType || "",
      neckType: prod.neckType || "",
      sleeveType: prod.sleeveType || "",
      pattern: prod.pattern || "",
      occasion: prod.occasion || "",
      fitType: prod.fitType || "",
      fabricType: prod.fabricType || "",
      liningMaterial: prod.liningMaterial || "",
      transparency: prod.transparency || "",
      length: prod.length || "",
      bustSize: prod.bustSize || "",
      waistSize: prod.waistSize || "",
      discount: prod.discount || "",
      washCare: prod.washCare || "",
      returnPolicy: prod.returnPolicy || "",
      sellerName: prod.sellerName || "",
      offer: prod.offer || "",
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this product?")) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter((p) =>
    searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="products-container">
      <h2 className="page-title">Product Management</h2>

      {/* Top Bar */}
      <div className="top-bar">
        <div className="search-bar">
          <Search size={20} color="#2c0e4d" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            <label>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
            <label>Description</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} />
            <label>Price</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required />
            <label>Cost Price</label>
            <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange} />
            <label>Stock</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} />
            <label>Unit</label>
            <input type="text" name="unit" value={form.unit} onChange={handleChange} />
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Attribute Dropdowns */}
            <label>Dress Type</label>
            <select name="dressType" value={form.dressType} onChange={handleChange}>
              <option value="">Select</option>
              {dressTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Neck Type</label>
            <select name="neckType" value={form.neckType} onChange={handleChange}>
              <option value="">Select</option>
              {neckTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Sleeve Type</label>
            <select name="sleeveType" value={form.sleeveType} onChange={handleChange}>
              <option value="">Select</option>
              {sleeveTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Pattern</label>
            <select name="pattern" value={form.pattern} onChange={handleChange}>
              <option value="">Select</option>
              {patternOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Occasion</label>
            <select name="occasion" value={form.occasion} onChange={handleChange}>
              <option value="">Select</option>
              {occasionOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Fit Type</label>
            <select name="fitType" value={form.fitType} onChange={handleChange}>
              <option value="">Select</option>
              {fitTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Fabric Type</label>
            <select name="fabricType" value={form.fabricType} onChange={handleChange}>
              <option value="">Select</option>
              {fabricTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Lining Material</label>
            <select name="liningMaterial" value={form.liningMaterial} onChange={handleChange}>
              <option value="">Select</option>
              {liningOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <label>Transparency</label>
            <select name="transparency" value={form.transparency} onChange={handleChange}>
              <option value="">Select</option>
              {transparencyOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>

            {/* Dynamic Sizes */}
            <label>Sizes & Prices</label>
            <div className="dynamic-list">
              {form.sizes.map((s, i) => (
                <div key={i} className="dynamic-item">
                  <input placeholder="Size" value={s.size} onChange={(e) => handleSizeChange(i, "size", e.target.value)} />
                  <input placeholder="Price" type="number" value={s.price} onChange={(e) => handleSizeChange(i, "price", e.target.value)} />
                  {i > 0 && <button type="button" onClick={() => removeSize(i)}>×</button>}
                </div>
              ))}
              <button type="button" onClick={addSize}>Add Size</button>
            </div>
{/* Dynamic Colors */}
<label>Colors</label>
<div className="dynamic-list">
  {form.color.map((c, i) => (
    <div key={i} className="dynamic-item">
      <input
        type="color"
        value={c || "#ffffff"}
        onChange={(e) => handleColorChange(i, e.target.value)}
        style={{ width: "50px", height: "30px", padding: "0", borderRadius: "5px" }}
      />
      <input
        type="text"
        placeholder="Enter color label"
        value={form.colorLabels[i] || ""}
        onChange={(e) => handleColorLabelChange(i, e.target.value)}
        style={{
          marginLeft: "5px",
          flex: 1,
          color: "#000",
          background: "#fff",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
        required
      />
      {i > 0 && (
        <button
          type="button"
          onClick={() => removeColor(i)}
          style={{
            padding: "0 8px",
            background: "#ff2c2c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      )}
    </div>
  ))}
  <button
    type="button"
    onClick={addColor}
    style={{
      marginTop: "5px",
      padding: "5px 12px",
      borderRadius: "6px",
      border: "none",
      background: "#1247a3",
      color: "#fff",
      cursor: "pointer",
      width: "fit-content",
    }}
  >
    Add Color
  </button>
</div>





            {/* Other Fields */}
            <label>Length</label><input name="length" value={form.length} onChange={handleChange} />
            <label>Bust Size</label><input name="bustSize" value={form.bustSize} onChange={handleChange} />
            <label>Waist Size</label><input name="waistSize" value={form.waistSize} onChange={handleChange} />
            <label>Discount</label><input name="discount" value={form.discount} onChange={handleChange} />
            <label>Wash Care</label><input name="washCare" value={form.washCare} onChange={handleChange} />
            <label>Return Policy</label><input name="returnPolicy" value={form.returnPolicy} onChange={handleChange} />
            <label>Seller Name</label><input name="sellerName" value={form.sellerName} onChange={handleChange} />
            <label>Offer</label><input name="offer" value={form.offer} onChange={handleChange} />
            <label>Images</label>
            <input type="file" multiple onChange={handleImages} />
          </div>

          {/* Image preview */}
          <div className="image-preview">
            {form.existingImages.map((img, i) => (
              <div key={i} className="img-box">
                <img src={getImageUrl(img)} alt="existing" />
                <button type="button" onClick={() => {
                  const newExisting = form.existingImages.filter((_, index) => index !== i);
                  setForm({ ...form, existingImages: newExisting });
                }}>×</button>
              </div>
            ))}
            {form.newImages.map((file, i) => (
              <div key={i} className="img-box">
                <img src={URL.createObjectURL(file)} alt="new" />
                <button type="button" onClick={() => {
                  const newFiles = form.newImages.filter((_, index) => index !== i);
                  setForm({ ...form, newImages: newFiles });
                }}>×</button>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? "Update Product" : "Add Product"}
          </button>
        </form>
      )}

{/* Product Table */}
<div className="table-container">
  <table className="product-table">
    <thead>
      <tr>
        <th>Images</th>
        <th>Name</th>
        <th>Description</th>
        <th>Category</th>
        <th>Price</th>
        <th>Cost</th>
        <th>Profit</th>
        <th>Stock</th>
        <th>Unit</th>
        <th>Status</th>
        {/* New Fields */}
        <th>Dress Type</th>
        <th>Neck Type</th>
        <th>Sleeve Type</th>
        <th>Pattern</th>
        <th>Occasion</th>
        <th>Fit Type</th>
        <th>Fabric Type</th>
        <th>Lining Material</th>
        <th>Transparency</th>
        <th>Length</th>
        <th>Bust Size</th>
        <th>Waist Size</th>
        <th>Discount</th>
        <th>Wash Care</th>
        <th>Return Policy</th>
        <th>Seller Name</th>
        <th>Offer</th>
        <th>Colors</th>
        <th>Sizes</th>
        
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredProducts.length > 0 ? (
        filteredProducts.map((p) => {
          const profit = (p.price || 0) - (p.costPrice || 0);
          return (
            <tr key={p._id}>
              <td>
                <div className="table-imgs">
                  {p.images && p.images.length > 0 ? (
                    p.images.map((img, i) => <img key={i} src={getImageUrl(img)} alt={p.name} />)
                  ) : (
                    <span className="no-img">No Image</span>
                  )}
                </div>
              </td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.category?.name}</td>
              <td>₹{p.price}</td>
              <td>₹{p.costPrice}</td>
              <td style={{ color: profit >= 0 ? "green" : "red" }}>₹{profit}</td>
              <td>{p.stock}</td>
              <td>{p.unit}</td>
              <td>{p.status}</td>
              {/* New Fields Data */}
              <td>{p.dressType || "-"}</td>
              <td>{p.neckType || "-"}</td>
              <td>{p.sleeveType || "-"}</td>
              <td>{p.pattern || "-"}</td>
              <td>{p.occasion || "-"}</td>
              <td>{p.fitType || "-"}</td>
              <td>{p.fabricType || "-"}</td>
              <td>{p.liningMaterial || "-"}</td>
              <td>{p.transparency || "-"}</td>
              <td>{p.length || "-"}</td>
              <td>{p.bustSize || "-"}</td>
              <td>{p.waistSize || "-"}</td>
              <td>{p.discount || "-"}</td>
              <td>{p.washCare || "-"}</td>
              <td>{p.returnPolicy || "-"}</td>
              <td>{p.sellerName || "-"}</td>
              <td>{p.offer || "-"}</td>
<td>
  {p.color && p.color.length > 0 ? (
    p.color.map((clr, i) => {
      // Safely get the label
      let label = "";
      if (p.colorLabels && p.colorLabels[i]) {
        if (typeof p.colorLabels[i] === "string") {
          label = p.colorLabels[i].replace(/[\[\]"\\]/g, "").trim();
        } else {
          label = String(p.colorLabels[i]);
        }
      } else {
        label = clr; // fallback to color code
      }

      return (
        <div key={i} style={{ display: "inline-flex", alignItems: "center", marginRight: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: clr,
              border: "1px solid #999",
              marginRight: "4px",
            }}
          ></div>
          <span>{label}</span>
        </div>
      );
    })
  ) : (
    "-"
  )}
</td>



                    <td>
                      {p.sizes && p.sizes.length > 0
                        ? p.sizes.map((s, i) => <span key={i} style={{marginRight:"5px"}}>{s.size}({s.price})</span>)
                        : "-"}
                    </td>
              <td>
                <Edit size={20} color="#1247a3" style={{ cursor: "pointer", marginRight: "5px" }} onClick={() => handleEdit(p)} />
                <Trash2 size={20} color="#ff2c2c" style={{ cursor: "pointer" }} onClick={() => handleDelete(p._id)} />
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="30">No products found</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      <style>{`
        .products-container { max-width: 1400px; margin: 50px auto; padding: 40px; background: #111129; border-radius: 20px; color: #fff; }
        .page-title { text-align: center; font-size: 32px; margin-bottom: 20px; font-weight: 700; }
        .top-bar { display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 25px; }
        .toggle-form-btn { background: #111129; border: none; padding: 8px 14px; border-radius: 50%; color: #fff; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .search-bar { display: flex; align-items: center; background: #1a1a40; padding: 10px 15px; border-radius: 50px; width: 400px; }
        .search-bar input { border: none; outline: none; background: transparent; margin-left: 10px; color: #fff; width: 100%; }
        .product-form { background: #1a1a40; padding: 25px; border-radius: 15px; margin-bottom: 40px; }
        .form-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 15px; align-items: center; }
        label { font-weight: 500; font-size: 14px; color: #ddd; }
        input, select { padding: 10px; border-radius: 8px; border: none; background: #121238; color: #fff; width: 100%; }
        .btn-submit { margin-top: 20px; padding: 10px 20px; border-radius: 8px; background: #111129; color: #fff; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .table-container { overflow-x: auto; }
        .product-table { width: 100%; border-collapse: collapse; background: #fff; color: #000; border-radius: 10px; }
        .product-table th, .product-table td { padding: 10px; text-align: center; border-bottom: 1px solid #ddd; vertical-align: middle; }
        .product-table th { background: #111129; color: #fff; }
        .table-imgs { display: flex; justify-content: center; flex-wrap: wrap; gap: 5px; }
        .table-imgs img { width: 45px; height: 45px; border-radius: 6px; object-fit: cover; }
        .no-img { color: #888; font-style: italic; }
        .image-preview { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px; }
        .img-box img { width: 60px; height: 60px; border-radius: 6px; object-fit: cover; border: 2px solid #c95f7b; }
        .remove-img-btn { position: absolute; top: -5px; right: -5px; background: #ff2c2c; border: none; color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 12px; cursor: pointer; }
        .img-box { position: relative; }
        .dynamic-list { display: flex; flex-direction: column; gap: 5px; }
        .dynamic-item { display: flex; gap: 5px; }
        .dynamic-item input { width: 100%; }
        .dynamic-item button { padding: 0 8px; background: red; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
      `}</style>
    </div>
  );
}

export default ProductsPage;
