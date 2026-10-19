require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../functions/models/user");
const bcrypt = require("bcrypt");
const jwtMiddleware = require("../functions/middleware/jwtMiddleware");
const roleMiddleware = require("../functions/middleware/roleMiddleware");
const jwt = require("jsonwebtoken");

// Auth-related endpoints for user registration and login.
// These routes create users, validate credentials, and issue JWT tokens.

// Register a new user and create the account record in the database.
router.post("/register", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (await User.findOne({ email })) {
    return res.status(409).json({ error: "Email already exists" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    User.create({
      name: name,
      email: email,
      password: hashedPassword,
    })
      .then((user) => {
        const token = jwt.sign(
          {
            id: user._id,
            role: user.role,
            organizationRole: user.organizationRole,
            organization: user.organization,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          },
        );

        res.status(201).json({
          message: "User registered successfully",
          token,
        });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Authenticate a user and issue a JWT so the client can access protected routes.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizationRole: user.organizationRole,
        organization: user.organization,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
