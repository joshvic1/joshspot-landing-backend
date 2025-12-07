const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

// ---------------------------------------------------
// REGISTER (create admin account)
// ---------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({
        success: false,
        message: "Email and password required",
      });

    // Check existing
    const existing = await User.findOne({ email });
    if (existing)
      return res.json({ success: false, message: "User already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
    });

    await user.save();

    return res.json({ success: true, message: "Admin created" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------------------------------------
// LOGIN
// ---------------------------------------------------
router.post("/login", async (req, res) => {
  console.log("🟡 JWT SECRET IN MIDDLEWARE:", process.env.JWT_SECRET);
  console.log("🟡 TOKEN RECEIVED:", req.headers.authorization);
  console.log("🟢 JWT SECRET DURING LOGIN:", JWT_SECRET);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
