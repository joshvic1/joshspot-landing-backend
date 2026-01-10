const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Site = require("../models/Site");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

// ---------------------------------------------------
// REGISTER (create site + admin)
// ---------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password, siteName, domain } = req.body;

    if (!email || !password || !siteName || !domain) {
      return res.json({
        success: false,
        message: "Email, password, site name and domain are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const existingSite = await Site.findOne({ domain });
    if (existingSite) {
      return res.json({ success: false, message: "Domain already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1️⃣ Create site
    const site = await Site.create({
      name: siteName,
      domain: domain.toLowerCase(),
      owner: null, // temporary
    });

    // 2️⃣ Create user linked to site
    const user = await User.create({
      email,
      password: hashed,
      siteId: site._id,
    });

    // 3️⃣ Attach owner to site
    site.owner = user._id;
    await site.save();

    return res.json({
      success: true,
      message: "Site and admin created successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------------------------------------
// LOGIN
// ---------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

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
