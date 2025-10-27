import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ========================
// Middleware to protect routes (JWT verification)
// ========================
export const protect = async (req, res, next) => {
  try {
    let token;

    // Token format: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from token
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(401).json({ message: "User not found, invalid token" });
    }

    // Attach the user info to req for later use
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

// ========================
// Role-based authorization (for admin routes)
// ========================
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden: insufficient rights" });
    }

    next();
  };
};
