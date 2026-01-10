require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const pageRoutes = require("./routes/pageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const submissions = require("./routes/submissionRoutes");
const authRoutes = require("./routes/auth");
const siteResolver = require("./middleware/siteResolver");

const app = express();

// 🔓 CORS — allow all custom domains
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// 🔓 AUTH (NO siteResolver)
app.use("/api/auth", authRoutes);

// 🔐 TENANT-AWARE ROUTES
app.use(siteResolver);
app.use("/api/page", pageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/submissions", submissions);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend running on", PORT));
