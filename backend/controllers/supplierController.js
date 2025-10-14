import Supplier from "../models/Supplier.js";

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add supplier
export const addSupplier = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      areasCovered,
      productsHandled,
      productsDelivered,
      productsPending,
      status,
    } = req.body;

    const supplier = new Supplier({
      name,
      email,
      phone,
      address,
      areasCovered: areasCovered ? areasCovered.split(",").map((a) => a.trim()) : [],
      productsHandled: productsHandled || 0,
      productsDelivered: productsDelivered || 0,
      productsPending: productsPending || 0,
      status: status || "active",
      image: req.file ? req.file.path : null,
    });

    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      areasCovered,
      productsHandled,
      productsDelivered,
      productsPending,
      status,
    } = req.body;

    const updateData = {
      name,
      email,
      phone,
      address,
      areasCovered: areasCovered ? areasCovered.split(",").map((a) => a.trim()) : [],
      productsHandled,
      productsDelivered,
      productsPending,
      status,
    };

    if (req.file) updateData.image = req.file.path;

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
