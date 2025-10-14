import { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search } from "lucide-react";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    stock: "",
    unit: "pcs",
    category: "",
    status: "active",
    newImages: [],      // Newly selected images
    existingImages: [], // Already uploaded images
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  };

  // Fetch categories
  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle new image selection
  const handleImages = (e) => {
    setForm({ ...form, newImages: Array.from(e.target.files) });
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    const updated = [...form.existingImages];
    updated.splice(index, 1);
    setForm({ ...form, existingImages: updated });
  };

  // Add / Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("costPrice", form.costPrice);
      formData.append("stock", form.stock);
      formData.append("unit", form.unit);
      formData.append("category", form.category);
      formData.append("status", form.status);

      // Append new images
      form.newImages.forEach((img) => formData.append("images", img));

      // Append existing images (for update)
      if (editingId) {
        form.existingImages.forEach((img) => formData.append("existingImages", img));
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
      });

      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving product");
    }
  };

  // Edit product
  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      costPrice: prod.costPrice,
      stock: prod.stock,
      unit: prod.unit,
      category: prod.category?._id || "",
      status: prod.status,
      newImages: [],
      existingImages: prod.images || [],
    });
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this product?")) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    }
  };

  // Search filter
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

      {/* Search */}
      <div className="search-bar">
        <Search size={20} color="#2c0e4d" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="product-form">
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input type="number" name="costPrice" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
        <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input type="text" name="unit" placeholder="Unit" value={form.unit} onChange={handleChange} />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input type="file" multiple onChange={handleImages} />

        {/* Preview existing images */}
        {form.existingImages.length > 0 && (
          <div className="image-preview">
            {form.existingImages.map((img, i) => (
              <div key={i} style={{ position: "relative", display: "inline-block", marginRight: "5px" }}>
                <img src={`http://localhost:5000/${img}`} alt="existing" />
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "#ff2c2c",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    cursor: "pointer",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                  onClick={() => removeExistingImage(i)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn-submit"><Plus size={20} /></button>
      </form>

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? filteredProducts.map((p) => (
              <tr key={p._id}>
                <td>
                  {p.images && p.images.length > 0 ? (
                    <div className="image-preview">
                      {p.images.map((img, i) => (
                        <img key={i} src={`http://localhost:5000/${img}`} alt={p.name} />
                      ))}
                    </div>
                  ) : "No Image"}
                </td>
                <td>{p.name}</td>
                <td>{p.description || "—"}</td>
                <td>{p.category?.name || "—"}</td>
                <td>₹{p.price}</td>
                <td>₹{p.costPrice}</td>
                <td>₹{p.price - p.costPrice}</td>
                <td>{p.stock}</td>
                <td>{p.unit}</td>
                <td>{p.status}</td>
                <td>
                  <Edit size={20} color="#1247a3" style={{ cursor: "pointer", marginRight: "5px" }} onClick={() => handleEdit(p)} />
                  <Trash2 size={20} color="#ff2c2c" style={{ cursor: "pointer" }} onClick={() => handleDelete(p._id)} />
                </td>
              </tr>
            )) : <tr><td colSpan="11">No products found</td></tr>}
          </tbody>
        </table>
      </div>

      <style>{`
        .products-container { max-width: 1400px; margin: 50px auto; padding: 35px; background: #111129; border-radius: 20px; color: #fff; font-family: "Poppins", sans-serif; }
        .page-title { text-align: center; margin-bottom: 20px; font-size: 32px; font-weight: 700; }
        .search-bar { display: flex; align-items: center; max-width: 450px; margin: 0 auto 30px; padding: 10px 15px; border-radius: 50px; background: #1a1a40; }
        .search-bar input { border: none; outline: none; background: transparent; margin-left: 10px; width: 100%; color: #fff; font-size: 16px; }
        .product-form { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; margin-bottom: 40px; }
        .product-form input, .product-form select { padding: 10px 15px; border-radius: 50px; border: none; background: #121238; color: #fff; }
        .btn-submit { padding: 10px 15px; border-radius: 50px; border: none; background: #2c0e4d; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .table-container { overflow-x: auto; }
        .product-table { width: 100%; border-collapse: collapse; background: #fff; color: #000; border-radius: 10px; }
        .product-table th, .product-table td { padding: 10px; text-align: center; border-bottom: 1px solid #ddd; }
        .product-table th { background: #111129; color: #fff; }
        .image-preview img { width: 50px; height: 50px; margin-right: 5px; border-radius: 5px; object-fit: cover; }
      `}</style>
    </div>
  );
}

export default ProductsPage;
