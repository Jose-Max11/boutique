import express from "express";
import passport from "passport";
import { signup, login, getUserData, googleCallback } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manual login/signup
router.post("/signup", signup);
router.post("/login", login);
router.get("/user-data", protect, getUserData);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }), googleCallback);

export default router;
