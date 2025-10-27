import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  rateProduct,
  commentProduct,
  getRelatedProducts,
  deleteRating,
  deleteComment,
  getMyReviews,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= Multer setup for multiple images =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ================= Routes =================
// Put specific/custom routes BEFORE the generic "/:id" route

router.get("/reviews/my", protect, getMyReviews); // optional alternate path
router.get("/my-reviews", protect, getMyReviews); // this must come BEFORE "/:id"

router.get("/", getProducts);                  // Get all products
router.get("/search", searchProducts);         // Search products by name
router.post("/", upload.array("images", 5), addProduct); // Add product (max 5 images)
router.put("/:id", upload.array("images", 5), updateProduct); // Update product
router.delete("/:id", deleteProduct);          // Delete product

// Rating & commenting
router.post("/:id/rate", protect, rateProduct);
router.post("/:id/comment", protect, commentProduct);
router.delete("/:id/rate", protect, deleteRating);
router.delete("/:id/comment", protect, deleteComment);

// Related products
router.get("/category/:categoryId/exclude/:excludeId", getRelatedProducts);

// Single product (keep this at bottom, after specific routes)
router.get("/:id", getProductById);

export default router;
