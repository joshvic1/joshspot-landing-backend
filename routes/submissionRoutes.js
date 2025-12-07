const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const auth = require("../middleware/auth");

// =========================================
// PUBLIC — create submission (NO auth)
// =========================================
router.post("/", async (req, res) => {
  try {
    const { sectionId, sectionTitle, name, phone, meta } = req.body;

    const fiveMinAgo = Date.now() - 5 * 60 * 1000;

    const recent = await Submission.findOne({
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
      sectionId,
      sectionTitle,
      name,
      phone,
      meta,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save submission" });
  }
});

// =========================================
// ADMIN — get all submissions (Protected)
// =========================================
router.get("/", auth, async (req, res) => {
  try {
    const items = await Submission.find().sort({ createdAt: -1 }).limit(1000);

    return res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load submissions" });
  }
});

// =========================================
// ADMIN — delete submission (Protected)
// =========================================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;
