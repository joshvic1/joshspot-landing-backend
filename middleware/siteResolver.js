const User = require("../models/User");

module.exports = async function siteResolver(req, res, next) {
  try {
    const host = req.headers.host;
    if (!host) {
      return res.status(400).json({ error: "No host header" });
    }

    const domain = host.split(":")[0].toLowerCase();

    const user = await User.findOne({ "site.domain": domain });

    if (!user) {
      return res.status(404).json({ error: "Site not found" });
    }

    req.siteUser = user;
    next();
  } catch (err) {
    console.error("Site resolver error:", err);
    return res.status(500).json({ error: "Site resolution failed" });
  }
};
