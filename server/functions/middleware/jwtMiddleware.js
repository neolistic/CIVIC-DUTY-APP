const jwt = require("jsonwebtoken");

// Verifies the bearer token on protected requests.
// If valid, it stores the decoded user payload on req.user for downstream routes.
const jwtMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized Access." });
  }
};

module.exports = jwtMiddleware;
