const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  id: String,
  type: String,
  hidden: { type: Boolean, default: false },

  bgColor: String,
  textColor: String,
  buttonColor: String,
  buttonTextColor: String,
  buttonAlign: { type: String, default: "left" },

  title: String,
  text: String,
  description: String,
  deadline: String,

  buttonText: String,
  buttonLink: String,

  products: Array,
  testimonials: Array,
  images: Array,
  faqs: Array,
  html: String,
});

const PageSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true,
    index: true,
  },

  pixelCode: { type: String, default: "" },
  themeColor: { type: String, default: "#ffffff" },
  sections: { type: [SectionSchema], default: [] },
});

module.exports = mongoose.model("Page", PageSchema);
