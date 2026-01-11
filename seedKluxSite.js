require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Site = require("./models/Site");
const Page = require("./models/Page");

async function run() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    const DOMAIN = "kluxmasterpiece.store";
    const EMAIL = "kluxmasterpiece47@gmail.com";
    const PASSWORD = "Klux100@#123";

    // 1️⃣ Check if site already exists
    let site = await Site.findOne({ domain: DOMAIN });
    if (site) {
      console.log("⚠️ Site already exists:", DOMAIN);
    } else {
      console.log("🌍 Creating site...");
      site = await Site.create({
        name: "Klux Masterpiece",
        domain: DOMAIN,
        owner: new mongoose.Types.ObjectId(), // temp
      });
    }

    // 2️⃣ Check if user exists
    let user = await User.findOne({ email: EMAIL });
    if (user) {
      console.log("⚠️ User already exists:", EMAIL);
    } else {
      console.log("👤 Creating admin user...");
      const hash = await bcrypt.hash(PASSWORD, 10);

      user = await User.create({
        email: EMAIL,
        password: hash,
        siteId: site._id, // ✅ REQUIRED
      });
    }

    // 3️⃣ Link site owner
    if (!site.owner || !site.owner.equals(user._id)) {
      console.log("🔗 Linking site owner...");
      site.owner = user._id;
      await site.save();
    }

    // 4️⃣ Create page if missing
    const existingPage = await Page.findOne({ site: site._id });
    if (!existingPage) {
      console.log("📄 Creating page...");
      await Page.create({
        site: site._id,
        pixelCode: "",
        themeColor: "#ffffff",
        sections: [],
      });
    } else {
      console.log("📄 Page already exists");
    }

    console.log("✅ DONE!");
    console.log("================================");
    console.log("LOGIN DETAILS");
    console.log("Email:", EMAIL);
    console.log("Password:", PASSWORD);
    console.log("Domain:", DOMAIN);
    console.log("Admin URL: https://your-frontend-domain/bs-admin");
    console.log("================================");

    process.exit(0);
  } catch (err) {
    console.error("❌ FAILED:", err);
    process.exit(1);
  }
}

run();
