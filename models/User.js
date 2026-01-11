const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
  {
    id: String,
    type: String,
    hidden: Boolean,
    bgColor: String,
    textColor: String,

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
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // 🔐 MULTI-TENANCY
  site: {
    name: String,
    domain: { type: String, unique: true },
  },

  // 🧠 PAGE LIVES HERE
  page: {
    pixelCode: { type: String, default: "" },
    themeColor: { type: String, default: "#ffffff" },
    sections: { type: [SectionSchema], default: [] },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
