const express = require("express");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

router.post("/", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: "No URL provided" });

    // Extract public_id from URL
    const parts = url.split("/");
    const filename = parts[parts.length - 1]; // abcde.png
    const folder = parts[parts.length - 2]; // landing_studio
    const publicId = `${folder}/${filename.split(".")[0]}`; // landing_studio/abcde

    await cloudinary.uploader.destroy(publicId);

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete failed", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

module.exports = router;
