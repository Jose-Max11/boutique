import express from "express";
import {
  createSharedWishlist,
  getSharedWishlist,
} from "../controllers/sharedWishlistController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create share link
router.post("/create", protect, createSharedWishlist);

// Get shared wishlist (PUBLIC)
router.get("/:shareId", getSharedWishlist);

export default router;