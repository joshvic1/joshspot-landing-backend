require("dotenv").config(); // 👈 LOAD .env FIRST
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    const exists = await User.findOne({ email: "admin@example.com" });
    if (exists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash("admin123", 10);

    await User.create({
      email: "admin@example.com",
      password: hashed,
    });

    console.log("Admin user created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("SEED ERROR:", err);
    process.exit(1);
  }
}

seedAdmin();
