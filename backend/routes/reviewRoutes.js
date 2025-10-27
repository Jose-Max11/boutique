// routes/reviewRoutes.js
import express from "express";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add review
router.post("/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  // 1. Check if user purchased product
  const purchased = await Order.findOne({
    userId,
    "items.product": productId,
  });

  if (!purchased) return res.status(403).json({ message: "Only purchased users can review." });

  // 2. Check if review already exists
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) return res.status(400).json({ message: "You already reviewed this product." });

  // 3. Save review
  const review = new Review({
    product: productId,
    user: userId,
    name: req.user.name,
    rating,
    comment,
  });
  await review.save();

  // 4. Update product averageRating and totalReviews
  const reviews = await Review.find({ product: productId });
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  await Product.findByIdAndUpdate(productId, { averageRating, totalReviews });

  res.status(201).json(review);
});

// Get all reviews for product
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
  res.json(reviews);
});

// Update review
router.put("/:reviewId", protect, async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: "Review not found." });
  if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed." });

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  await review.save();

  // Update product rating
  const reviews = await Review.find({ product: review.product });
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  await Product.findByIdAndUpdate(review.product, { averageRating, totalReviews });

  res.json(review);
});

// Delete review
router.delete("/:reviewId", protect, async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: "Review not found." });
  if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed." });

  await review.remove();

  // Update product rating
  const reviews = await Review.find({ product: review.product });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
  await Product.findByIdAndUpdate(review.product, { averageRating, totalReviews });

  res.json({ message: "Review deleted." });
});

export default router;
