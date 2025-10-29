import express from "express";
import multer from "multer";
import CustomOrder from "../models/CustomOrder.js";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ===== Middleware: Admin check =====
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// ===== Create custom order (user only) =====
router.post(
  "/",
  protect,
  upload.fields([
    { name: "referenceImage" },
    { name: "fabricImage" },
    { name: "neckDesignImage" },
    { name: "sleeveDesignImage" },
    { name: "inspirationImage" },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      const body = req.body;

      const newOrder = new CustomOrder({
        ...body,
        user: req.user._id,
        referenceImage: files?.referenceImage?.[0]?.filename || "",
        fabricImage: files?.fabricImage?.[0]?.filename || "",
        neckDesignImage: files?.neckDesignImage?.[0]?.filename || "",
        sleeveDesignImage: files?.sleeveDesignImage?.[0]?.filename || "",
        inspirationImage: files?.inspirationImage?.[0]?.filename || "",
      });

      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (err) {
      console.error("❌ Error creating custom order:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ===== USER: Get only their own custom orders =====
router.get("/", protect, async (req, res) => {
  try {
    const orders = await CustomOrder.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ===== ADMIN: Get all custom orders =====
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const orders = await CustomOrder.find({}, "-__v")
      .populate("user", "name email")
      .populate("designer", "name email") // ✅ add this line
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((order) => ({
      ...order,
      designer:
        order.designer?.name
          ? `${order.designer.name} (${order.designer.email})`
          : "Not Assigned",
      status: order.status || "Pending",
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error("❌ Error fetching admin orders:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// ===== Get single order (public) =====
router.get("/:id", async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ===== Update order (user only) =====
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "referenceImage" },
    { name: "fabricImage" },
    { name: "neckDesignImage" },
    { name: "sleeveDesignImage" },
    { name: "inspirationImage" },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      const body = req.body;

      const updateData = {
        ...body,
        referenceImage: files?.referenceImage?.[0]?.filename || body.referenceImage,
        fabricImage: files?.fabricImage?.[0]?.filename || body.fabricImage,
        neckDesignImage: files?.neckDesignImage?.[0]?.filename || body.neckDesignImage,
        sleeveDesignImage: files?.sleeveDesignImage?.[0]?.filename || body.sleeveDesignImage,
        inspirationImage: files?.inspirationImage?.[0]?.filename || body.inspirationImage,
      };

      const updatedOrder = await CustomOrder.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, lean: true }
      );

      if (!updatedOrder)
        return res.status(404).json({ message: "Order not found" });

      res.json(updatedOrder);
    } catch (err) {
      console.error("❌ Error updating order:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ===== Delete order (user only) =====
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await CustomOrder.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
// ===== ADMIN: Update order status =====
router.put("/admin/update-status/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate allowed values
    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.json({
      message: `Order ${status} successfully`,
      order: updatedOrder,
    });
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
