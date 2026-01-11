// middleware/siteResolver.js

const Site = require("../models/Site");

module.exports = async function siteResolver(req, res, next) {
  try {
    const domain =
      req.headers["x-site-domain"] || req.headers.host?.split(":")[0];

    if (!domain) {
      return res.status(400).json({ error: "No domain provided" });
    }

    const site = await Site.findOne({ domain: domain.toLowerCase() });

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
