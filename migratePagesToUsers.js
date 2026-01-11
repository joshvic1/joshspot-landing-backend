require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Site = require("./models/Site");
const Page = require("./models/Page");

async function migrate() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const users = await User.find();
    console.log(`👥 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n➡️ Migrating user: ${user.email}`);

      // Skip if already migrated
      if (user.page && user.site?.domain) {
        console.log("⏭️  Already migrated, skipping");
        continue;
      }

      // 1️⃣ Find site owned by this user
      const site = await Site.findOne({ owner: user._id });
      if (!site) {
        console.log("⚠️  No site found for user, skipping");
        continue;
      }

      // 2️⃣ Find page for site
      const page = await Page.findOne({ siteId: site._id });

      // 3️⃣ Attach site to user
      user.site = {
        name: site.name || "Untitled Site",
        domain: site.domain,
      };

      // 4️⃣ Attach page to user
      user.page = {
        pixelCode: page?.pixelCode || "",
        themeColor: page?.themeColor || "#ffffff",
        sections: page?.sections || [],
      };

      await user.save();
      console.log("✅ Migrated successfully");
    }

    console.log("\n🎉 MIGRATION COMPLETE");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
