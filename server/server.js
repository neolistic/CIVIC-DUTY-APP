require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const connectDB = require("./functions/config/db");
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const adminRoutes = require("./routes/adminRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const cors = require("cors");

// Main Express server setup for the civic issue reporting app.
// This file wires up middleware, API routes, and database startup.

app.use(express.json());
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
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

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
