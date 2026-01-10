const express = require("express");
const Page = require("../models/Page");
const auth = require("../middleware/auth");
const siteResolver = require("../middleware/siteResolver");

const router = express.Router();

/* =============================
   PUBLIC — GET PAGE
============================= */
router.get("/", siteResolver, async (req, res) => {
  try {
    let page = await Page.findOne({ site: req.site._id });

    if (!page) {
      page = await Page.create({
        site: req.site._id,
        pixelCode: "",
        themeColor: "#ffffff",
        sections: [],
      });
    }

    res.json({
      pixelCode: page.pixelCode,
      themeColor: page.themeColor,
      sections: page.sections,
    });
  } catch (err) {
    console.error("GET PAGE ERROR:", err);
    res.status(500).json({ error: "Failed to load page" });
  }
});

/* =============================
   ADMIN — GET PAGE
============================= */
router.get("/admin", auth, siteResolver, async (req, res) => {
  try {
    if (!req.user.siteId || !req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const page = await Page.findOne({ site: req.site._id });

    if (!page) {
      return res.json({
        pixelCode: "",
        themeColor: "#ffffff",
        sections: [],
      });
    }

    res.json({
      pixelCode: page.pixelCode,
      themeColor: page.themeColor,
      sections: page.sections,
    });
  } catch (err) {
    console.error("ADMIN GET PAGE ERROR:", err);
    res.status(500).json({ error: "Failed to load admin page" });
  }
});

/* =============================
   ADMIN — SAVE PAGE (AUTOSAVE)
============================= */
router.post("/", auth, siteResolver, async (req, res) => {
  try {
    if (!req.user.siteId || !req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { pixelCode, themeColor, sections } = req.body;

    let page = await Page.findOne({ site: req.site._id });

    if (!page) {
      page = new Page({
        site: req.site._id,
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
