import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.get("/", getSuppliers);
router.post("/", upload.single("image"), addSupplier);
router.put("/:id", upload.single("image"), updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
