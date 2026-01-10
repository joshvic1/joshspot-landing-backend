const express = require("express");
const Page = require("../models/Page");
const router = express.Router();
const auth = require("../middleware/auth");
const siteResolver = require("../middleware/siteResolver");

// =============================
// GET PAGE (PUBLIC - frontend)
// =============================
router.get("/", siteResolver, async (req, res) => {
  try {
    const siteId = req.site._id;

    let page = await Page.findOne({ siteId });

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
    return res.status(500).json({ error: "Failed to load page" });
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
router.post("/", auth, siteResolver, async (req, res) => {
  try {
    // 🔒 Ownership check
    if (!req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { pixelCode, themeColor, sections } = req.body;

    const normalized = sections.map((s) => ({
      id: s.id,
      type: s.type,
      hidden: s.hidden ?? false,

      bgColor: s.bgColor || "#ffffff",
      textColor: s.textColor || "#000000",
      buttonColor: s.buttonColor || "#111111",
      buttonTextColor: s.buttonTextColor || "#ffffff",
      buttonAlign: s.buttonAlign || "left",

      title: s.title || "",
      text: s.text || "",
      description: s.description || "",
      deadline: s.deadline || "",

      buttonText: s.buttonText || "",
      buttonLink: s.buttonLink || "",
      hasForm: s.hasForm || false,
      formNameLabel: s.formNameLabel || "",
      formPhoneLabel: s.formPhoneLabel || "",
      formRedirect: s.formRedirect || "",

      products: s.products || [],
      testimonials: s.testimonials || [],
      images: s.images || [],
      faqs: s.faqs || [],

      html: s.html || "",
    }));

    let page = await Page.findOne({ siteId: req.site._id });

    if (!page) {
      page = new Page({
        siteId: req.site._id,
        pixelCode,
        themeColor,
        sections: normalized,
      });
    } else {
      page.pixelCode = pixelCode;
      page.themeColor = themeColor;
      page.sections = normalized;
    }

    await page.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("SAVE PAGE ERROR:", err);
    return res.status(500).json({ error: "Failed to save page" });
  }
});

module.exports = router;
