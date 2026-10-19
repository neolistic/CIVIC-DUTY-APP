require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes");
const issueRoutes = require("../routes/issueRoutes");
const adminRoutes = require("../routes/adminRoutes");
const organizationRoutes = require("../routes/organizationRoutes");
const notificationRoutes = require("../routes/notificationRoutes");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // Add your deployed frontend URL here later.
    ],
  }),
);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoutes);
app.use("/api", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;
