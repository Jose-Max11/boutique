// routes/userRoutes.js
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize(["user"]), (req, res) => {
  res.json({ message: `Welcome ${req.user.name} to user dashboard` });
});

export default router;
