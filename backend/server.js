import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import designerRoutes from "./routes/designerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminOrdersRoutes from "./routes/adminOrders.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboard.js";
import userRoutes from "./routes/user.js";
import customOrdersRoutes from "./routes/customOrders.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";

import { protect, authorize } from "./middleware/authMiddleware.js";
import "./config/passport.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Allow CORS for all routes + static images
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Manually add CORS headers for static files
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// ✅ Serve uploaded images with correct headers
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.JWT_SECRET || "supersecret123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/designers", designerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);
app.use("/auth", authRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/custom-orders", customOrdersRoutes);
app.use("/api/revenue", revenueRoutes);

// --- Example protected routes ---
app.get("/admin-data", protect, authorize(["admin"]), (req, res) => {
  res.json({ message: "This is admin data", user: req.user });
});

app.get("/user-data", protect, authorize(["user"]), (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// --- MongoDB connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
