import express from "express";
import {
  saveCompare,
  getCompare,
  clearCompare,
} from "../controllers/compareController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// SAVE / UPDATE
router.post("/", protect, saveCompare);

// GET
router.get("/", protect, getCompare);

// DELETE
router.delete("/", protect, clearCompare);

export default router;