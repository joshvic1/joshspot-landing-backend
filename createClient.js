/**
 * PowerShell usage:
 * node scripts/createClient.js --email=client@email.com --password="pass123" --domain=example.com --sitename="Client Brand"
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Site = require("./models/Site");
const Page = require("./models/Page");

// ------------------ ARG PARSER ------------------
const args = process.argv.slice(2).reduce((acc, curr) => {
  const [key, value] = curr.replace("--", "").split("=");
  acc[key] = value;
  return acc;
}, {});

const { email, password, domain, sitename } = args;

if (!email || !password || !domain || !sitename) {
  console.error("❌ Missing required arguments");
  process.exit(1);
}

async function run() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    const normalizedDomain = domain.replace(/^www\./, "").toLowerCase();

    // ---------------- VALIDATION ----------------
    if (await User.findOne({ email })) {
      throw new Error("User already exists");
    }

    if (await Site.findOne({ domain: normalizedDomain })) {
      throw new Error("Site already exists for this domain");
    }

    // ---------------- PRE-GENERATE IDS ----------------
    const userId = new mongoose.Types.ObjectId();
    const siteId = new mongoose.Types.ObjectId();

    // ---------------- CREATE USER ----------------
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      _id: userId,
      email,
      password: hashed,
      siteId: siteId, // 🔗 link to site
    });

    // ---------------- CREATE SITE ----------------
    const site = new Site({
      _id: siteId,
      name: sitename,
      domain: normalizedDomain,
      owner: userId, // 🔗 link to user
    });

    // ---------------- SAVE BOTH ----------------
    await site.save();
    await user.save();

    console.log("✅ User & Site created and linked");

    // ---------------- CREATE PAGE ----------------
    await Page.create({
      siteId: siteId,
      pixelCode: "",
      themeColor: "#ffffff",
      sections: [],
    });

    console.log("✅ Page created");

    console.log(`
🎉 CLIENT ONBOARDING COMPLETE

Login Email: ${email}
Password: ${password}
Domain: https://${normalizedDomain}
Admin: https://${normalizedDomain}/bs-admin
`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Onboarding failed:", err.message);
    process.exit(1);
  }
}

run();
