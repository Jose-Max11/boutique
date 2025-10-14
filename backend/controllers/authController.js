import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Manual signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: "user" });

    const token = generateToken(user._id, user.role);

    res.status(201).json({ message: "Signup successful", user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manual login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.password) return res.status(400).json({ message: "Please login with Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    res.status(200).json({ message: "Login successful", user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user data
export const getUserData = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { _id, name, email, role } = req.user;
  res.json({ _id, name, email, role });
};

// Google OAuth login callback
export const googleCallback = async (req, res) => {
  const user = req.user; // passport sets this
  const token = generateToken(user._id, user.role);

  // Redirect to frontend with JWT
  res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
};
