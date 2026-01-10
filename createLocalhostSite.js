require("dotenv").config();
const mongoose = require("mongoose");
const Site = require("./models/Site");
const User = require("./models/User");

async function run() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);

  // 1️⃣ Create or fetch admin user
  let admin = await User.findOne({ email: "admin@localhost.com" });

  if (!admin) {
    admin = await User.create({
      email: "admin@localhost.com",
      password: "dev-only",
    });
    console.log("✅ Admin user created");
  }

  // 2️⃣ Create or fetch site
  let site = await Site.findOne({ domain: "localhost" });

  if (!site) {
    site = await Site.create({
      name: "Local Development Site",
      domain: "localhost",
      owner: admin._id,
    });
    console.log("✅ localhost site created");
  }

  // 3️⃣ Link user → site
  if (!admin.siteId) {
    admin.siteId = site._id;
    await admin.save();
    console.log("🔗 User linked to site");
  }

  console.log("🎉 DONE");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
