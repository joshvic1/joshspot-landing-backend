const express = require("express");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const auth = require("../middleware/auth");
const siteResolver = require("../middleware/siteResolver");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

router.post("/", auth, siteResolver, async (req, res) => {
  try {
    if (!req.user.siteId.equals(req.site._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    const parts = url.split("/");
    const folderIndex = parts.findIndex((p) => p === "landing_studio");

    if (folderIndex === -1) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    const siteFolder = parts[folderIndex + 1];
    const filename = parts[parts.length - 1].split(".")[0];
    const publicId = `landing_studio/${siteFolder}/${filename}`;

    if (siteFolder !== req.site._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await cloudinary.uploader.destroy(publicId);

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete failed", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

module.exports = router;
