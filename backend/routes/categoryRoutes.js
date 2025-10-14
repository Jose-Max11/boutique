import express from "express";
import Category from "../models/Category.js"; // ✅ Add this
import Product from "../models/Product.js";   // ✅ Add this
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Define routes & map them to controller functions
router.get("/", getCategories);
router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

// GET /api/categories/:id/products
router.get("/:id/products", async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const products = await Product.find({ category: id });
    res.json({ categoryName: category.name, products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
