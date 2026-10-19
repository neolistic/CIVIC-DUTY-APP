const Issue = require("../functions/models/issue");
const jwtmiddleware = require("../functions/middleware/jwtMiddleware");
const roleMiddleware = require("../functions/middleware/roleMiddleware");
const express = require("express");
const router = express.Router();
const Notification = require("../functions/models/notification");
const Organization = require("../functions/models/organization");
const User = require("../functions/models/user");
const mongoose = require("mongoose");

// Issue routes manage civic reports from creation to status changes,
// assignment, upvotes, and visibility in user/organization dashboards.

// Create a new issue report from a citizen. This validates the input,
// checks for nearby duplicate reports, and stores the issue with its location.
router.post("/issues", jwtmiddleware, async (req, res) => {
  const {
    title,
    description,
    category,
    address,
    longitude,
    latitude,
    forceCreate,
  } = req.body;

  if (
    !title ||
    !description ||
    !category ||
    !address ||
    !longitude ||
    !latitude
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const longitudeNum = parseFloat(longitude);
  const latitudeNum = parseFloat(latitude);

  if (
    !Number.isFinite(longitudeNum) ||
    !Number.isFinite(latitudeNum) ||
    longitudeNum < -180 ||
    longitudeNum > 180 ||
    latitudeNum < -90 ||
    latitudeNum > 90
  ) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  if (!forceCreate) {
    const issueFound = await Issue.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 500,
        },
      },
      category: category,
    });

    if (issueFound) {
      return res.status(409).json({
        duplicate: true,
        message: "A similar issue has already been reported nearby.",
        issue: issueFound,
      });
    }
  }

  await Issue.create({
    title,
    description,
    category,
    location: {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
    address,
    reporter: req.user.id,
    history: [
      {
        status: "reported",
        performedBy: req.user.id,
        action: "reported",
      },
    ],
  })
    .then((issue) => {
      Notification.create({
        recipient: req.user.id,
        message: `Your issue "${title}" has been reported successfully.`,
        type: "issue_reported",
        issue: issue._id,
      });
      res.status(201).json({ message: "Issue reported successfully", issue });
    })
    .catch((error) => {
      console.error("Error creating issue:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Return all issues within a short radius of the user's current coordinates.
// This powers the map view and helps users see relevant problems nearby.
router.get("/issues/nearby", jwtmiddleware, async (req, res) => {
  const { longitude, latitude } = req.query;

  const longitudeNum = parseFloat(longitude);
  const latitudeNum = parseFloat(latitude);

  if (
    !Number.isFinite(longitudeNum) ||
    !Number.isFinite(latitudeNum) ||
    longitudeNum < -180 ||
    longitudeNum > 180 ||
    latitudeNum < -90 ||
    latitudeNum > 90
  ) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  Issue.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: 500,
      },
    },
  })
    .then((issues) => {
      res.json({ issues });
    })
    .catch((error) => {
      console.error("Error fetching nearby issues:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

router.get(
  "/issues/allusers",
  jwtmiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find().select(
        "name email role organization organizationRole",
      );
      res.json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/issues/allorganizations",
  jwtmiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const organizations = await Organization.find().select("name email");
      res.json({ organizations });
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Toggle the current user's upvote status for an issue.
// If the user already voted, the vote is removed; otherwise it is added.
router.post("/issues/:id/upvote", jwtmiddleware, async (req, res) => {
  const issueId = req.params.id;
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ error: "Invalid issue ID" });
    }
    const issue = await Issue.findById(issueId)
      .populate("reporter", "name")
      .populate("history.performedBy", "name");
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const upvoteIndex = issue.upvotes.indexOf(userId);
    if (upvoteIndex === -1) {
      issue.upvotes.push(userId);
    } else {
      issue.upvotes.splice(upvoteIndex, 1);
    }

    await issue.save();
    res.json({
      message: "Upvote updated successfully",
      upvoted: upvoteIndex === -1,
      upvoteCount: issue.upvotes.length,
      issue,
    });
  } catch (error) {
    console.error("Error updating upvote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch all issues assigned to the currently logged-in employee.
// This is used on employee dashboards for their active workload.
router.get(
  "/issues/employee",
  jwtmiddleware,
  roleMiddleware(["organization"], ["employee"]),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const issues = await Issue.find({ assignedTo: req.user.id })
        .populate("reporter", "name email")
        .populate("assignedOrganization")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

      res.json({ issues });
    } catch (error) {
      console.error("Error fetching employee issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Assign an issue to an organization for handling by admin-level staff.
// This updates the issue owner and records the assignment in history.
router.put(
  "/issues/:id/assign",
  jwtmiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const issueId = req.params.id;
    const { assignedOrganization } = req.body;

    try {
      const issue = await Issue.findById(issueId);

      if (!issue) {
        return res.status(404).json({
          error: "Issue not found",
        });
      }

      const organization = await Organization.findById(assignedOrganization);

      if (!organization) {
        return res.status(404).json({
          error: "Organization not found",
        });
      }

      issue.assignedOrganization = assignedOrganization;
      issue.status = "assigned";

      issue.history.push({
        action: "assigned",
        performedBy: req.user.id,
      });

      await issue.save();

      res.json({
        message: "Issue assigned successfully",
        issue,
      });

      await Notification.create({
        recipient: assignedOrganization,
        message: `A new issue "${issue.title}" has been assigned to your organization.`,
        type: "issue_assigned",
        issue: issueId,
      });
    } catch (error) {
      console.error("Error assigning issue:", error);

      res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);

// Assign a specific employee to the issue and mark it as in progress.
// This ensures only employees from the same organization can be assigned.
router.put(
  "/issues/:id/assignemployee",
  jwtmiddleware,
  roleMiddleware(["admin", "organization"], ["admin"]),
  async (req, res) => {
    const issueId = req.params.id;
    const { assignedTo } = req.body;

    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      const employee = await User.findById(assignedTo);

      if (!employee || employee.role !== "organization") {
        return res.status(404).json({
          error: "Employee not found or not an organization employee",
        });
      }

      if (
        employee.organization.toString() !==
        issue.assignedOrganization.toString()
      ) {
        return res.status(403).json({
          error: "Employee does not belong to the assigned organization",
        });
      }

      issue.assignedTo = assignedTo;
      issue.status = "in_progress";
      issue.history.push({
        action: "assigned_employee",
        performedBy: req.user.id,
      });
      await issue.save();

      res.json({
        message: "Employee assigned to issue successfully",
        issue,
      });

      await Notification.create({
        recipient: assignedTo,
        message: `You have been assigned to the issue "${issue.title}".`,
        type: "issue_assigned",
        issue: issueId,
      });
    } catch (error) {
      console.error("Error assigning employee to issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Update the status of an issue and notify the reporter of the new state.
// Organization admins and employees have different restrictions on allowed status values.
router.patch(
  "/issues/:id/status",
  jwtmiddleware,
  roleMiddleware(["admin", "organization"]),
  async (req, res) => {
    const issueId = req.params.id;
    const { status } = req.body;

    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      if (req.user.role === "organization") {
        if (req.user.organizationRole === "employee") {
          if (!issue.assignedTo) {
            return res.status(400).json({
              error: "No employee assigned to this issue",
            });
          }

          if (issue.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
              error:
                "You are not authorized to update the status of this issue",
            });
          }
        } else {
          if (
            !issue.assignedOrganization ||
            issue.assignedOrganization.toString() !==
              req.user.organization.toString()
          ) {
            return res.status(403).json({
              error:
                "You are not authorized to update this organization's issue",
            });
          }
        }
      }

      if (
        req.user.organizationRole === "employee" &&
        status !== "in_progress" &&
        status !== "resolved"
      ) {
        return res.status(403).json({
          error:
            "Employees can only change status to 'in_progress' or 'resolved'",
        });
      }

      const validStatuses = [
        "reported",
        "under_review",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
        "duplicate",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      issue.status = status;
      issue.history.push({
        action: `status_changed_to_${status}`,
        performedBy: req.user.id,
      });
      await issue.save();
      await Notification.create({
        recipient: issue.reporter,
        message: `The status of your issue "${issue.title}" has been updated to "${status}".`,
        type: "issue_status_updated",
        issue: issueId,
      });
      res.json({ message: "Issue status updated successfully", issue });
    } catch (error) {
      console.error("Error updating issue status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Return issues assigned to the current employee or organization user.
// This supports assignment tracking and task lists.
router.get(
  "/issues/assigned",
  jwtmiddleware,
  roleMiddleware(["admin", "organization"], ["employee"]),
  async (req, res) => {
    try {
      const issues = await Issue.find({ assignedTo: req.user.id })
        .populate("reporter", "name email")
        .populate("assignedOrganization")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
      res.json({ issues });
    } catch (error) {
      console.error("Error fetching assigned issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Fetch all issues for the current organization, or all issues if the user is an admin.
// This powers the main organization dashboard view.
router.get(
  "/issues/organization",
  jwtmiddleware,
  roleMiddleware(["admin", "organization"], ["admin", "manager"]),
  async (req, res) => {
    try {
      if (req.user.role === "admin") {
        const issues = await Issue.find()
          .populate("reporter", "name email")
          .populate("assignedOrganization")
          .populate("assignedTo", "name email")
          .sort({ createdAt: -1 });
        return res.json({ issues });
      }

      const issues = await Issue.find({
        assignedOrganization: req.user.organization,
      })
        .populate("reporter", "name email")
        .populate("assignedOrganization")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
      res.json({ issues });
    } catch (error) {
      console.error("Error fetching organization issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Fetch all issues reported by the currently authenticated user.
// This is useful for user dashboards and issue history screens.
router.get("/issues/user", jwtmiddleware, async (req, res) => {
  try {
    const issues = await Issue.find({ reporter: req.user.id });
    res.json({ issues });
  } catch (error) {
    console.error("Error fetching user issues:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an issue only when the user is authorized to do so.
// Rules differ by role, organization access, and the issue status.
router.delete("/issues/:id", jwtmiddleware, async (req, res) => {
  const issueId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ error: "Invalid issue ID" });
    }
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (req.user.role === "admin") {
      await Issue.findByIdAndDelete(issueId);
      return res.json({ message: "Issue deleted successfully" });
    }

    if (issue.assignedOrganization) {
      if (
        req.user.organization !== issue.assignedOrganization.toString() &&
        req.user.role === "organization"
      ) {
        return res.status(403).json({
          error: "You are not authorized to delete this issue",
        });
      }
    }

    if (
      req.user.role === "organization" &&
      req.user.organizationRole === "admin"
    ) {
      if (issue.assignedOrganization) {
        if (req.user.organization === issue.assignedOrganization.toString()) {
          await Issue.findByIdAndDelete(issueId);
          return res.json({ message: "Issue deleted successfully" });
        }
      }
    }

    if (
      req.user.role === "citizen" &&
      req.user.id === issue.reporter.toString()
    ) {
      if (issue.status === "reported" || issue.status === "under_review") {
        await Issue.findByIdAndDelete(issueId);
        return res.json({ message: "Issue deleted successfully" });
      }
    }

    return res
      .status(403)
      .json({ error: "You are not authorized to delete this issue" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Return a single issue with its reporter and history details.
// Used for the issue details screen and status validation UI.
router.get("/issues/:id", jwtmiddleware, async (req, res) => {
  const issueId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ error: "Invalid issue ID" });
    }
    const issue = await Issue.findById(issueId)
      .populate("reporter", "name")
      .populate("history.performedBy", "name");
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json({ issue });
  } catch (error) {
    console.error("Error fetching issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an existing issue's information when the reporter is allowed to edit it.
// This validates coordinates and ensures only early-stage issues can be modified.
router.put("/issues/:id", jwtmiddleware, async (req, res) => {
  const issueId = req.params.id;
  const { title, description, category, address, longitude, latitude } =
    req.body;

  if (
    !title ||
    !description ||
    !category ||
    !address ||
    !longitude ||
    !latitude
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const longitudeNum = parseFloat(longitude);
  const latitudeNum = parseFloat(latitude);

  if (
    !Number.isFinite(longitudeNum) ||
    !Number.isFinite(latitudeNum) ||
    longitudeNum < -180 ||
    longitudeNum > 180 ||
    latitudeNum < -90 ||
    latitudeNum > 90
  ) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  if (!mongoose.Types.ObjectId.isValid(issueId)) {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (
      req.user.role === "citizen" &&
      req.user.id !== issue.reporter.toString()
    ) {
      return res.status(403).json({
        error: "You are not authorized to update this issue",
      });
    }

    if (
      req.user.role === "organization" &&
      req.user.organizationRole === "admin"
    ) {
      return res.status(403).json({
        error: "You are not authorized to update this issue",
      });
    }

    if (
      req.user.role === "organization" &&
      req.user.organizationRole === "employee"
    ) {
      return res.status(403).json({
        error: "You are not authorized to update this issue",
      });
    }

    if (req.user.role !== "admin") {
      if (issue.status !== "reported" && issue.status !== "under_review") {
        return res.status(403).json({
          error:
            "You can only update issues that are in 'reported' or 'under_review' status",
        });
      }
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      {
        title,
        description,
        category,
        address,
        location: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        history: [
          ...issue.history,
          {
            action: "updated",
            performedBy: req.user.id,
          },
        ],
      },
      { new: true },
    );

    res.json({ issue: updatedIssue });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Return the full history trail for an issue, including status changes and actions.
// This helps show a timeline or audit log in the frontend.
router.get("/issues/:id/history", jwtmiddleware, async (req, res) => {
  const issueId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(issueId)) {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  try {
    const issue = await Issue.findById(issueId).populate(
      "history.performedBy",
      "name email role organizationRole organization",
    );
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json({ history: issue.history });
  } catch (error) {
    console.error("Error fetching issue history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/issues/:id/history/details", jwtmiddleware, async (req, res) => {
  const issueId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(issueId)) {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  try {
    const issue = await Issue.findById(issueId)
      .populate(
        "history.performedBy",
        "name email role organizationRole organization",
      )
      .populate("reporter", "name email")
      .populate("assignedOrganization")
      .populate("assignedTo", "name email");

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json({ issue, history: issue.history });
  } catch (error) {
    console.error("Error fetching issue history details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
