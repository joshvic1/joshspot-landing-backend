const express = require("express");
const Page = require("../models/Page");
const router = express.Router();
const auth = require("../middleware/auth");
const siteResolver = require("../middleware/siteResolver");

// GET PAGE (PUBLIC)
router.get("/", async (req, res) => {
  try {
    let page = await Page.findOne({ siteId: req.site._id });

    if (!page) {
      page = await Page.create({
        siteId: req.site._id,
        pixelCode: "",
        themeColor: "#ffffff",
        sections: [],
      });
    }

    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load page" });
  }
});

// SAVE PAGE (ADMIN)
router.post("/", auth, async (req, res) => {
  try {
    const { pixelCode, themeColor, sections } = req.body;

    let page = await Page.findOne({ siteId: req.site._id });

    if (!page) {
      page = new Page({
        siteId: req.site._id,
        pixelCode,
        themeColor,
        sections,
      });
    } else {
      page.pixelCode = pixelCode;
      page.themeColor = themeColor;
      page.sections = sections;
    }

    await page.save();
    res.json({ success: true });
  } catch (err) {
    console.error("SAVE PAGE ERROR:", err);
    res.status(500).json({ error: "Failed to save page" });
  }
});

// =============================
// GET PAGE (ADMIN - protected)
// =============================
router.get("/admin", auth, siteResolver, async (req, res) => {
  try {
    // 🔒 Ensure user belongs to this site
    if (!req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let page = await Page.findOne({ siteId: req.site._id });

    if (!page) {
      return res.json({
        pixelCode: "",
        themeColor: "#ffffff",
        sections: [],
      });
    }

    return res.json({
      pixelCode: page.pixelCode,
      themeColor: page.themeColor,
      sections: page.sections,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load admin page" });
  }
});

// =============================
// SAVE PAGE (ADMIN ONLY)
// =============================
router.post("/", auth, async (req, res) => {
  try {
    const { pixelCode, themeColor, sections } = req.body;

    let page = await Page.findOne({ siteId: req.site._id });

    if (!page) {
      page = new Page({
        siteId: req.site._id,
        pixelCode,
        themeColor,
        sections,
      });
    } else {
      page.pixelCode = pixelCode;
      page.themeColor = themeColor;
      page.sections = sections;
    }

    await page.save();
    res.json({ success: true });
  } catch (err) {
    console.error("SAVE PAGE ERROR:", err);
    res.status(500).json({ error: "Failed to save page" });
  }
});

module.exports = router;
