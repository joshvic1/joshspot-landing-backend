const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  sectionId: String,
  sectionTitle: String,
  name: String,
  phone: String,
  meta: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Submission", SubmissionSchema);
