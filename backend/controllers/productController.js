import Product from "../models/Product.js";

// GET all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD product with multiple images
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, costPrice, stock, unit, category, status } = req.body;

    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    const product = new Product({
      name,
      description,
      price,
      costPrice,
      stock,
      unit,
      category,
      status,
      images: imagePaths,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE product and append new images
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, costPrice, stock, unit, category, status } = req.body;

    const updateData = { name, description, price, costPrice, stock, unit, category, status };

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Append new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      product.images.push(...newImages);
    }

    // Update other fields
    Object.assign(product, updateData);
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SEARCH products
export const searchProducts = async (req, res) => {
  const { search } = req.query;
  try {
    const products = await Product.find({ name: { $regex: search, $options: "i" } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD product review
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingReview = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = { user: req.user._id, rating: Number(rating), comment };
    product.reviews.push(review);

    product.totalReviews = product.reviews.length;
    product.averageRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.totalReviews;

    await product.save();
    res.status(201).json({ message: "Review added", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
