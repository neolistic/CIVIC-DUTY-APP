const User = require("../functions/models/user");
const jwtmiddleware = require("../functions/middleware/jwtMiddleware");
const roleMiddleware = require("../functions/middleware/roleMiddleware");
const Notification = require("../functions/models/notification");
const express = require("express");
const router = express.Router();

router.put(
  "/:organizationId/employees",
  jwtmiddleware,
  roleMiddleware(["organization", "admin"], ["admin"]),
  async (req, res) => {
    const { organizationId } = req.params;
    if (req.user.role !== "admin") {
      if (req.user.organization.toString() !== organizationId) {
        return res.status(403).json({
          message:
            "You are not authorized to add employees to this organization",
        });
      }
    }
    const { email, organizationRole } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.organizationRole === "admin" && organizationRole === "admin") {
      return res
        .status(400)
        .json({ message: "Cannot promote user to admin role" });
    }

    if (req.user._id.toString() === user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot change your own role" });
    }

    user.organization = organizationId;
    user.role = "organization";
    user.organizationRole = organizationRole;
    await user.save();

    await Notification.create({
      recipient: user._id,
      message: `You have been added to the organization "${organizationId}".`,
      type: "organization_added",
      organization: organizationId,
    });

    res.json({ message: "User updated successfully" });
  },
);

router.patch(
  "/:organizationId/employees",
  jwtmiddleware,
  roleMiddleware(["organization", "admin"], ["admin", "manager"]),
  async (req, res) => {
    const { organizationId } = req.params;
    const { email, organizationRole } = req.body;

    if (req.user.role !== "admin") {
      if (req.user.organization.toString() !== organizationId) {
        return res.status(403).json({
          message:
            "You are not authorized to update employees in this organization",
        });
      }
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.organization.toString() !== organizationId) {
        return res.status(400).json({
          message: "User does not belong to this organization",
        });
      }

      user.organizationRole = organizationRole;
      await user.save();

      res.json({ message: "Employee role updated successfully", user });
    } catch (error) {
      console.error("Error updating employee role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/:organizationId/employees",
  jwtmiddleware,
  roleMiddleware(["organization", "admin"], ["admin", "manager"]),
  async (req, res) => {
    const { organizationId } = req.params;
    const { email } = req.body;

    if (req.user.role !== "admin") {
      if (req.user.organization.toString() !== organizationId) {
        return res.status(403).json({
          message:
            "You are not authorized to remove employees from this organization",
        });
      }
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.organization.toString() !== organizationId) {
        return res.status(400).json({
          message: "User does not belong to this organization",
        });
      }

      user.organization = undefined;
      user.role = "citizen";
      user.organizationRole = "employee";
      await user.save();

      res.json({ message: "Employee removed successfully", user });
    } catch (error) {
      console.error("Error removing employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/:organizationId/employees",
  jwtmiddleware,
  roleMiddleware(["organization", "admin"], ["admin", "manager"]),
  async (req, res) => {
    const { organizationId } = req.params;

    if (req.user.organization !== organizationId && req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "You are not authorized to view employees of this organization",
      });
    }

    if (
      req.user.role !== "admin" &&
      (req.user.organizationRole === "admin" ||
        req.user.organizationRole === "manager")
    ) {
      const employees = await User.find({
        organization: organizationId,
        role: "organization",
      });
      return res.json({ employees });
    } else if (req.user.role === "admin") {
      const employees = await User.find({ role: "organization" });
      return res.json({ employees });
    }
  },
);

module.exports = router;
