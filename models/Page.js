// models/Page.js
const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  id: String,
  type: String,
  hidden: { type: Boolean, default: false },

  // universal design settings
  bgColor: String,
  textColor: String,
  buttonColor: String,
  buttonTextColor: String,
  buttonAlign: {
    type: String,
    default: "left",
  },

  // universal content fields
  title: String,
  text: String,
  description: String,
  deadline: { type: String },

  // button
  buttonText: String,
  buttonLink: String,
  formNameLabel: { type: String, default: "" },
  formPhoneLabel: { type: String, default: "" },
  hasForm: { type: Boolean, default: false },
  formRedirect: String,

  // product showcase
  products: [
    {
      name: String,
      desc: String,
      price: String,
      link: String,
      image: String,
    },
  ],

  // testimonials
  testimonials: [
    {
      name: String,
      quote: String,
      stars: Number,
    },
  ],

  // gallery
  images: [String],

  // FAQ
  faqs: [
    {
      q: String,
      a: String,
    },
  ],

  // footer
  html: String,
});

const PageSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    default: null,
  },
  pixelCode: String,
  themeColor: String,
  sections: [SectionSchema],
});

module.exports = mongoose.model("Page", PageSchema);
