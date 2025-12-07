const express = require("express");
const Page = require("../models/Page");
const router = express.Router();
const auth = require("../middleware/auth");

// =============================
// GET PAGE (PUBLIC - frontend)
// =============================
router.get("/", async (req, res) => {
  try {
    let page = await Page.findOne();

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
    return res.status(500).json({ error: "Failed to load page" });
  }
});

// =============================
// GET PAGE (ADMIN - protected)
// =============================
router.get("/admin", auth, async (req, res) => {
  try {
    let page = await Page.findOne();

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
    return res.status(500).json({ error: "Failed to load admin page" });
  }
});

// =============================
// SAVE PAGE (ADMIN ONLY)
// =============================
router.post("/", auth, async (req, res) => {
  try {
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

    let page = await Page.findOne();

    if (!page) {
      page = new Page({ pixelCode, themeColor, sections: normalized });
    } else {
      page.pixelCode = pixelCode;
      page.themeColor = themeColor;
      page.sections = normalized;
    }

    await page.save();
    res.json({ success: true });
  } catch (err) {
    console.error("SAVE PAGE ERROR:", err);
    res.status(500).json({ error: "Failed to save page" });
  }
});

module.exports = router;
