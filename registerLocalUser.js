require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Site = require("./models/Site");
const Page = require("./models/Page");

async function registerLocalUser() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    // =========================
    // TEST USER DETAILS
    // =========================
    const email = "admin1@localhost.com";
    const password = "admin123";
    const siteName = "Local Test Site";
    const domain = "localhost"; // 🔑 VERY IMPORTANT

    // =========================
    // CLEAN PREVIOUS TEST DATA
    // =========================
    await User.deleteMany({ email });
    await Site.deleteMany({ domain });
    await Page.deleteMany({});

    // =========================
    // CREATE USER
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      siteId: null, // set after site creation
    });

    // =========================
    // CREATE SITE
    // =========================
    const site = await Site.create({
      name: siteName,
      domain,
      owner: user._id,
    });

    // =========================
    // LINK USER → SITE
    // =========================
    user.siteId = site._id;
    await user.save();

    // =========================
    // CREATE PAGE
    // =========================
    await Page.create({
      site: site._id,
      pixelCode: "",
      themeColor: "#ffffff",
      sections: [],
    });

    console.log("✅ LOCAL USER CREATED SUCCESSFULLY");
    console.log("👤 Email:", email);
    console.log("🔑 Password:", password);
    console.log("🌍 Domain:", domain);
    console.log("➡️ Login at: http://localhost:3000/bs-admin");

    process.exit(0);
  } catch (err) {
    console.error("❌ FAILED:", err);
    process.exit(1);
  }
}

registerLocalUser();
