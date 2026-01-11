const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middleware/auth");
const siteResolver = require("../middleware/siteResolver");

/**
 * =====================================================
 * GET PAGE (PUBLIC)
 * Used by:
 * - Homepage
 * - TikTokInjector
 * - Public visitors
 * =====================================================
 */
router.get("/", siteResolver, async (req, res) => {
  try {
    // siteResolver already found the user
    const user = req.siteUser;

    if (!user) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Always return page object
    return res.json({
      pixelCode: user.page?.pixelCode || "",
      themeColor: user.page?.themeColor || "#ffffff",
      sections: user.page?.sections || [],
    });
  } catch (err) {
    console.error("GET PAGE ERROR:", err);
    return res.status(500).json({ error: "Failed to load page" });
  }
});

/**
 * =====================================================
 * SAVE PAGE (ADMIN – AUTOSAVE)
 * Used by:
 * - BS Admin Editor
 * =====================================================
 */
router.post("/", auth, siteResolver, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔐 Make sure admin owns this site
    if (user.site.domain !== req.siteUser.site.domain) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { pixelCode, themeColor, sections } = req.body;

    // 🪄 AUTOSAVE MAGIC
    user.page = {
      pixelCode: pixelCode || "",
      themeColor: themeColor || "#ffffff",
      sections: Array.isArray(sections) ? sections : [],
    };

    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("SAVE PAGE ERROR:", err);
    return res.status(500).json({ error: "Failed to save page" });
  }
});

module.exports = router;
