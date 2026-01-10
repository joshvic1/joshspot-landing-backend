const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const auth = require("../middleware/auth");
const siteResolver = require("../middleware/siteResolver");

// =========================================
// PUBLIC — create submission (NO auth)
// =========================================
router.post("/", siteResolver, async (req, res) => {
  try {
    const { sectionId, sectionTitle, name, phone, meta } = req.body;
    const siteId = req.site._id;

    const fiveMinAgo = Date.now() - 5 * 60 * 1000;

    const recent = await Submission.findOne({
      siteId,
      phone,
      createdAt: { $gte: fiveMinAgo },
    });

    if (recent) {
      return res.json({
        success: false,
        message: "You recently submitted. Please wait a few minutes.",
      });
    }

    await Submission.create({
      siteId,
      sectionId,
      sectionTitle,
      name,
      phone,
      meta,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save submission" });
  }
});

// =========================================
// ADMIN — get submissions (Protected)
// =========================================
router.get("/", auth, siteResolver, async (req, res) => {
  try {
    // 🔒 Site ownership check
    if (!req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const items = await Submission.find({
      siteId: req.site._id,
    })
      .sort({ createdAt: -1 })
      .limit(1000);

    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load submissions" });
  }
});

// =========================================
// ADMIN — delete submission (Protected)
// =========================================
router.delete("/:id", auth, siteResolver, async (req, res) => {
  try {
    // 🔒 Ownership check
    if (!req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const submission = await Submission.findOne({
      _id: req.params.id,
      siteId: req.site._id,
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    await submission.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;
