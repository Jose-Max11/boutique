import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can access full dashboard
router.get("/", protect, authorize(["admin"]), getDashboardData);

export default router;
