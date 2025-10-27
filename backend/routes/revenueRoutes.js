import express from "express";
import {
  createRevenueEntry,
  markCollected,
  markPaidToAdmin,
  getTotalRevenue,
  getAllRevenues,
} from "../controllers/revenueController.js";

const router = express.Router();

router.post("/create", createRevenueEntry);
router.patch("/collect/:id", markCollected);
router.patch("/pay/:id", markPaidToAdmin);
router.get("/total", getTotalRevenue);
router.get("/", getAllRevenues);

export default router;
