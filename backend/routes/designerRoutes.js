import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getDesigners,
  addDesigner,
  updateDesigner,
  deleteDesigner,
} from "../controllers/designerController.js";

const router = express.Router();

// 🔹 Configure multer for file uploads
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

// ✅ Routes
router.get("/", getDesigners);
router.post("/", upload.single("profile_image"), addDesigner);
router.put("/:id", upload.single("profile_image"), updateDesigner);
router.delete("/:id", deleteDesigner);

export default router;
