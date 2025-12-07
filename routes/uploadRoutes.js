const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "landing_studio",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
  try {
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

router.post("/delete", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: "No URL provided" });
    }

    // Extract public_id from Cloudinary URL
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const publicId = "landing_studio/" + filename.split(".")[0];

    console.log("🗑 Deleting Cloudinary image:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return res.json({ success: true });
    } else {
      return res.json({
        success: false,
        error: "Cloudinary delete failed",
        result,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
