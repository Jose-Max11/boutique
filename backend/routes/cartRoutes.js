import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartQuantity
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ All cart routes require authentication
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.post("/remove", protect, removeFromCart);
router.post("/clear", protect, clearCart);
router.post("/update", protect, updateCartQuantity); // new route

export default router;
