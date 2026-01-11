// middleware/siteResolver.js

const Site = require("../models/Site");

module.exports = async function siteResolver(req, res, next) {
  try {
    let domain = req.headers["x-site-domain"] || req.headers.host;

    if (!domain) {
      return res.status(400).json({ error: "No domain provided" });
    }

    domain = domain
      .toLowerCase()
      .replace(/^www\./, "") // 🔥 STRIP WWW
      .split(":")[0]; // strip port

    const site = await Site.findOne({ domain });

    if (!site) {
      return res.status(404).json({
        error: "Site not found",
        domainTried: domain, // 👈 helpful for debugging
      });
    }

    req.site = site;
    next();
  } catch (err) {
    console.error("Site resolver error:", err);
    return res.status(500).json({ error: "Site resolution failed" });
  }
};
