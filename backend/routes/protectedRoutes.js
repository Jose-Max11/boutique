import express from "express";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// any authenticated user
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: req.userDetails });
});

// admin-only
router.get("/admin-data", authMiddleware, requireRole("admin"), (req, res) => {
  res.json({ secret: "only admins see this" });
});

export default router;
