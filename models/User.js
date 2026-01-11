const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // 🔐 MULTI-TENANCY
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
