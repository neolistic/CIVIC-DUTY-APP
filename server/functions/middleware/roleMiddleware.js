const roleMiddleware = (requiredRole, requiredOrganizationRole) => {
  return (req, res, next) => {
    if (req.user.role === "admin") {
      return next();
    }
    if (!req.user || !requiredRole.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }
    if (
      requiredOrganizationRole &&
      !requiredOrganizationRole.includes(req.user.organizationRole)
    ) {
      return res.status(403).json({
        error: "Access denied. Insufficient organization permissions.",
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
