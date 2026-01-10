// middleware/siteResolver.js
const Site = require("../models/Site");

module.exports = async function siteResolver(req, res, next) {
  try {
    const host = req.headers.host;

    if (!host) {
      return res.status(400).json({ error: "No host header" });
    }

    // Remove port if present (example.com:3000)
    const domain = host.split(":")[0].toLowerCase();

    const site = await Site.findOne({ domain });

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    req.site = site;
    next();
  } catch (err) {
    console.error("Site resolver error:", err);
    return res.status(500).json({ error: "Site resolution failed" });
  }
};
