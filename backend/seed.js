import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config(); // load .env

async function createAdmin() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Check if admin already exists
    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      // 3️⃣ Hash password
      const hashedPassword = await bcrypt.hash("admin123", 10);

      // 4️⃣ Create admin
      const admin = new User({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log("✅ Admin created:", adminEmail);
    } else {
      console.log("Admin already exists:", adminEmail);
    }

    // 5️⃣ Close DB connection
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
}

createAdmin();
