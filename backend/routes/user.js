import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js"; // your auth middleware

const router = express.Router();

// Add product to recently viewed
router.post("/recently-viewed", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "Product ID required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Remove duplicate
    user.recentlyViewed = user.recentlyViewed.filter(p => p.productId.toString() !== productId);

    // Add new at beginning
    user.recentlyViewed.unshift({ productId });

    // Limit to 10 products
    user.recentlyViewed = user.recentlyViewed.slice(0, 10);

    await user.save();
    res.json({ success: true, data: user.recentlyViewed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get recently viewed products
router.get("/recently-viewed", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("recentlyViewed.productId");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const recentlyViewedProducts = user.recentlyViewed.map(rv => ({
      productId: rv.productId._id,
      name: rv.productId.name,
      price: rv.productId.price,
      image: rv.productId.images?.[0] || rv.productId.image || "",
    }));

    res.json({ success: true, data: recentlyViewedProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
