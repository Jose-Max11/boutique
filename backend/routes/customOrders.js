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

// ===== Create custom order (logged-in users only) =====
router.post(
  "/",
  protect,
  upload.fields([
    { name: "referenceImage" },
    { name: "fabricImage" },
    { name: "neckDesignImage" },
    { name: "sleeveDesignImage" },
    { name: "inspirationImage" }
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      const body = req.body;

      const newOrder = new CustomOrder({
        ...body,
        user: req.user._id, // attach logged-in user
        referenceImage: files?.referenceImage?.[0]?.filename || "",
        fabricImage: files?.fabricImage?.[0]?.filename || "",
        neckDesignImage: files?.neckDesignImage?.[0]?.filename || "",
        sleeveDesignImage: files?.sleeveDesignImage?.[0]?.filename || "",
        inspirationImage: files?.inspirationImage?.[0]?.filename || ""
      });

      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Get all orders of the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const orders = await CustomOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ===== Get all orders (public) =====
router.get("/", async (req, res) => {
  try {
    const orders = await CustomOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ===== Get a single order (public) =====
router.get("/:id", async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ===== Update order (logged-in users only) =====
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "referenceImage" },
    { name: "fabricImage" },
    { name: "neckDesignImage" },
    { name: "sleeveDesignImage" },
    { name: "inspirationImage" }
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      const body = req.body;

      const updatedOrder = await CustomOrder.findByIdAndUpdate(
        req.params.id,
        {
          ...body,
          referenceImage: files?.referenceImage?.[0]?.filename || body.referenceImage,
          fabricImage: files?.fabricImage?.[0]?.filename || body.fabricImage,
          neckDesignImage: files?.neckDesignImage?.[0]?.filename || body.neckDesignImage,
          sleeveDesignImage: files?.sleeveDesignImage?.[0]?.filename || body.sleeveDesignImage,
          inspirationImage: files?.inspirationImage?.[0]?.filename || body.inspirationImage
        },
        { new: true }
      );

      if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

      res.json(updatedOrder);
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ===== Delete order (logged-in users only) =====
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await CustomOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
