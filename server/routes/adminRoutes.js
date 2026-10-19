const Organization = require("../functions/models/organization");
const jwtmiddleware = require("../functions/middleware/jwtMiddleware");
const roleMiddleware = require("../functions/middleware/roleMiddleware");
const express = require("express");
const router = express.Router();

router.post(
  "/organizations",
  jwtmiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { name, email, phone, category, address, description } = req.body;

    try {
      const organization = new Organization({
        name,
        email,
        phone,
        category,
        address,
        description,
      });

      await organization.save();
      res
        .status(201)
        .json({ message: "Organization created successfully", organization });
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.put(
  "/organizations/:organizationId",
  jwtmiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { organizationId } = req.params;
    const { name, email, phone, category, address, description } = req.body;

    try {
      const organization = await Organization.findByIdAndUpdate(
        organizationId,
        { name, email, phone, category, address, description },
        { new: true, runValidators: true },
      );

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json({
        message: "Organization updated successfully",
        organization,
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/organizations/:organizationId",
  jwtmiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { organizationId } = req.params;

    try {
      const organization = await Organization.findByIdAndDelete(organizationId);

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json({ message: "Organization deleted successfully" });
    } catch (error) {
      console.error("Error deleting organization:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
