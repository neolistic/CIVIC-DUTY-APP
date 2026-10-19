const Notification = require("../functions/models/notification");
const express = require("express");
const router = express.Router();
const jwtmiddleware = require("../functions/middleware/jwtMiddleware");
const mongoose = require("mongoose");

router.get("/notification", jwtmiddleware, async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user.id,
  }).sort({ createdAt: -1 });
  res.json({ notifications });
});

router.put(
  "/notification/:notificationId/read",
  jwtmiddleware,
  async (req, res) => {
    const { notificationId } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      if (notification.recipient.toString() !== req.user.id) {
        return res.status(403).json({
          error: "You are not authorized to update this notification",
        });
      }
      notification.read = true;
      await notification.save();
      res.json({ notification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
