import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ================= GET ALL PRODUCTS =================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products.map((p) => ({ ...p._doc, images: p.images || [] })));
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= SEARCH PRODUCTS =================
export const searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const products = await Product.find({
      name: { $regex: keyword, $options: "i" },
    }).populate("category", "name");
    res.json(products.map((p) => ({ ...p._doc, images: p.images || [] })));
  } catch (err) {
    console.error("searchProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// ADD NEW PRODUCT
// ========================
export const addProduct = async (req, res) => {
  try {
    // Safely parse color and sizes
    let parsedColor = [];
    let parsedSizes = [];
let parsedColorLabels = [];
    try {
      parsedColor = req.body.color ? JSON.parse(req.body.color) : [];
    } catch (e) {
      console.log("Error parsing color:", e);
    }

if (req.body.colorLabels) {
  if (Array.isArray(req.body.colorLabels)) {
    // Already an array
    parsedColorLabels = req.body.colorLabels;
  } else if (typeof req.body.colorLabels === "string") {
    try {
      // Try JSON.parse
      parsedColorLabels = JSON.parse(req.body.colorLabels);
      if (!Array.isArray(parsedColorLabels)) parsedColorLabels = [parsedColorLabels];
    } catch (err) {
      // If JSON.parse fails, treat as comma-separated string
      parsedColorLabels = req.body.colorLabels.split(",").map((s) => s.trim());
    }
  } else {
    // Fallback: wrap in array
    parsedColorLabels = [req.body.colorLabels];
  }
}


    try {
      parsedSizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
    } catch (e) {
      console.log("Error parsing sizes:", e);
    }

    // Collect image file URLs if uploaded
    const imageUrls = req.files?.map((file) => file.path) || [];

    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      sku: req.body.sku,
      price: req.body.price,
      costPrice: req.body.costPrice,
      discount: req.body.discount || 0,
      offer: req.body.offer || 0,
      stock: req.body.stock || 0,
      unit: req.body.unit || "pcs",
      status: req.body.status || "active",
      availability: req.body.availability || "In Stock",
      category: req.body.category,
      images: imageUrls,
      referenceImage: req.body.referenceImage,
      materialImage: req.body.materialImage,

      // Fabric & Design
      fabric: req.body.fabric,
      fabricType: req.body.fabricType,
      pattern: req.body.pattern,
      combo: req.body.combo,
      sleeveLength: req.body.sleeveLength,
      sleeveType: req.body.sleeveType,
      neckType: req.body.neckType,
      dressType: req.body.dressType,
      fitType: req.body.fitType,
      length: req.body.length,
      transparency: req.body.transparency,
      liningMaterial: req.body.liningMaterial,
      washCare: req.body.washCare,
      occasion: req.body.occasion,
      countryOfOrigin: req.body.countryOfOrigin,
      sellerName: req.body.sellerName,

      // Sizes & Colors
      sizes: parsedSizes,
      color: parsedColor,
 colorLabels: parsedColorLabels, 
      // Pricing
      mrp: req.body.mrp,
      sellingPrice: req.body.sellingPrice,
      taxIncluded: req.body.taxIncluded !== undefined ? req.body.taxIncluded : true,
      returnPolicy: req.body.returnPolicy || "7 Days Easy Return",
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
};

// ========================
// UPDATE PRODUCT
// ========================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let parsedColor = [];
    let parsedSizes = [];
   let parsedColorLabels = [];

if (req.body.colorLabels) {
  if (Array.isArray(req.body.colorLabels)) {
    // Already an array
    parsedColorLabels = req.body.colorLabels;
  } else if (typeof req.body.colorLabels === "string") {
    try {
      // Try JSON.parse
      parsedColorLabels = JSON.parse(req.body.colorLabels);
      if (!Array.isArray(parsedColorLabels)) parsedColorLabels = [parsedColorLabels];
    } catch (err) {
      // If JSON.parse fails, treat as comma-separated string
      parsedColorLabels = req.body.colorLabels.split(",").map((s) => s.trim());
    }
  } else {
    // Fallback: wrap in array
    parsedColorLabels = [req.body.colorLabels];
  }
}


    try {
      parsedColor = req.body.color ? JSON.parse(req.body.color) : [];
    } catch (e) {
      console.log("Error parsing color:", e);
    }

    try {
      parsedSizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
    } catch (e) {
      console.log("Error parsing sizes:", e);
    }

    // Combine new and existing images
    const newImages = req.files?.map((file) => file.path) || [];
    const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
    const updatedImages = [...existingImages, ...newImages];

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        sku: req.body.sku,
        price: req.body.price,
        costPrice: req.body.costPrice,
        discount: req.body.discount,
        offer: req.body.offer,
        stock: req.body.stock,
        unit: req.body.unit,
        status: req.body.status,
        availability: req.body.availability,
        category: req.body.category,
        images: updatedImages,
        referenceImage: req.body.referenceImage,
        materialImage: req.body.materialImage,

        // Fabric & Design
        fabric: req.body.fabric,
        fabricType: req.body.fabricType,
        pattern: req.body.pattern,
        combo: req.body.combo,
        sleeveLength: req.body.sleeveLength,
        sleeveType: req.body.sleeveType,
        neckType: req.body.neckType,
        dressType: req.body.dressType,
        fitType: req.body.fitType,
        length: req.body.length,
        transparency: req.body.transparency,
        liningMaterial: req.body.liningMaterial,
        washCare: req.body.washCare,
        occasion: req.body.occasion,
        countryOfOrigin: req.body.countryOfOrigin,
        sellerName: req.body.sellerName,

        // Sizes & Colors
        sizes: parsedSizes,
        color: parsedColor,
  colorLabels: parsedColorLabels, 
        // Pricing
        mrp: req.body.mrp,
        sellingPrice: req.body.sellingPrice,
        taxIncluded: req.body.taxIncluded,
        returnPolicy: req.body.returnPolicy,
      },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};
// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET PRODUCT BY ID =================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("reviews.user", "name email")
      .populate("category", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });

    let canReview = false;
    let userRating = 0;

    if (req.user?._id) {
      const userOrders = await Order.find({
        userId: req.user._id,
        "items.product": product._id,
      });

      canReview = userOrders.length > 0;

      const userReview = product.reviews.find(
        (r) => r.user?.toString() === req.user._id.toString()
      );
      if (userReview) userRating = userReview.rating;
    }

    const totalReviews = product.reviews.length;
    const averageRating =
      totalReviews > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    res.json({
      ...product._doc,
      images: product.images || [],
      canReview,
      totalReviews,
      averageRating,
      userRating,
    });
  } catch (err) {
    console.error("getProductById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RATE PRODUCT =================
export const rateProduct = async (req, res) => {
  try {
    const { rating } = req.body;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only delivered orders
    const userOrders = await Order.find({
      userId,
      "items.product": product._id,
      status: "delivered",
    });

    if (userOrders.length === 0)
      return res.status(403).json({
        message: "You can only rate products from delivered orders.",
      });

    // Check if user already rated
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReview) existingReview.rating = rating;
    else product.reviews.push({ user: userId, rating, comment: "" });

    product.totalReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.totalReviews;

    await product.save();
    res.json({ message: "Rating added successfully", product });
  } catch (err) {
    console.error("rateProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ================= DELETE RATING =================
export const deleteRating = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Remove the user's rating but keep comment if exists
    const review = product.reviews.find(r => r.user.toString() === userId.toString());
    if (!review || review.rating === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    review.rating = 0; // reset rating
    await product.save();

    res.json({ message: "Rating deleted successfully", product });
  } catch (err) {
    console.error("deleteRating error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= COMMENT PRODUCT =================
export const commentProduct = async (req, res) => {
  try {
    const { comment } = req.body;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only delivered orders
    const userOrders = await Order.find({
      userId,
      "items.product": product._id,
      status: "delivered",
    });

    if (userOrders.length === 0)
      return res.status(403).json({
        message: "You can only comment on products from delivered orders.",
      });

    // Check if user already commented
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReview) existingReview.comment = comment;
    else product.reviews.push({ user: userId, comment, rating: 0 });

    await product.save();

    const updatedProduct = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name email"
    );

    res.json({ message: "Comment added successfully", product: updatedProduct });
  } catch (err) {
    console.error("commentProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ================= DELETE COMMENT =================
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Remove the user's comment but keep rating if exists
    const review = product.reviews.find(r => r.user.toString() === userId.toString());
    if (!review || review.comment === "") {
      return res.status(404).json({ message: "Comment not found" });
    }

    review.comment = ""; // reset comment
    await product.save();

    res.json({ message: "Comment deleted successfully", product });
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ================= GET MY REVIEWS =================
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find all products where the current user has a review
    const products = await Product.find({ "reviews.user": userId }).populate("category", "name");

    // Map to only include user's review
    const myReviews = products.map((p) => {
      const myReview = p.reviews.find((r) => r.user.toString() === userId.toString());
      return {
        productId: p._id,
        name: p.name,
        images: p.images || [],
        rating: myReview.rating,
        comment: myReview.comment,
        category: p.category?.name || "",
      };
    });

    res.json(myReviews);
  } catch (err) {
    console.error("getMyReviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET RELATED PRODUCTS =================
export const getRelatedProducts = async (req, res) => {
  try {
    const { categoryId, excludeId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const relatedProducts = await Product.find({
      category: categoryId,
      _id: { $ne: excludeId }, // exclude the current product
    }).populate("category", "name");

    res.json(relatedProducts.map((p) => ({ ...p._doc, images: p.images || [] })));
  } catch (err) {
    console.error("getRelatedProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
