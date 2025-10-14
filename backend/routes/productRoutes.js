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
  addProductReview,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer setup for multiple images
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

// Routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.post("/", upload.array("images", 5), addProduct); // max 5 images
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/review", protect, addProductReview);

export default router;
