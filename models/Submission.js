// models/Submission.js
const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  // 🔑 MULTI-TENANT OWNER
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true,
    index: true,
  },

  sectionId: String,
  sectionTitle: String,
  name: String,
  phone: String,
  meta: Object,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Submission", SubmissionSchema);
