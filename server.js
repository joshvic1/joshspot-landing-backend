require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const pageRoutes = require("./routes/pageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const submissions = require("./routes/submissionRoutes");
const auth = require("./routes/auth");

const app = express();

// CORS for your frontend
app.use(
  cors({
    origin: ["https://myfanstore.vercel.app", "http://localhost:3000"],
    // Your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/page", pageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/submissions", submissions);
app.use("/api/auth", auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend running on", PORT));
