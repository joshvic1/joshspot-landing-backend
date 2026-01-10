const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const auth = require("../middleware/auth");
const siteResolver = require("../middleware/siteResolver");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ⚠️ Storage must be dynamic per site
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    if (!req.site) {
      throw new Error("Site not resolved");
    }

    return {
      folder: `landing_studio/${req.site._id}`,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({ storage });

// =========================================
// UPLOAD IMAGE (ADMIN ONLY)
// =========================================
router.post("/", auth, siteResolver, upload.single("image"), (req, res) => {
  try {
    // 🔒 Ownership check
    if (!req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = req.file.path || req.file.url || req.file.secure_url;

    if (!imageUrl) {
      return res.status(500).json({ error: "Upload failed: No URL returned" });
    }

    return res.json({ url: imageUrl });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return res.status(500).json({ error: "Server upload error" });
  }
});

// =========================================
// DELETE IMAGE (ADMIN ONLY)
// =========================================
router.post("/delete", auth, siteResolver, async (req, res) => {
  try {
    // 🔒 Ownership check
    if (!req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: "No URL provided" });
    }

    // Expected format:
    // landing_studio/{siteId}/filename.jpg
    const parts = url.split("/");
    const folderIndex = parts.findIndex((p) => p === "landing_studio");

    if (folderIndex === -1) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    const siteFolder = parts[folderIndex + 1];
    const filename = parts[parts.length - 1].split(".")[0];
    const publicId = `landing_studio/${siteFolder}/${filename}`;

    // 🔒 Ensure image belongs to this site
    if (siteFolder !== req.site._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return res.json({ success: true });
    }

    return res.json({
      success: false,
      error: "Cloudinary delete failed",
      result,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
