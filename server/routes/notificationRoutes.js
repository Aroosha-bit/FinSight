import express from "express";
import Notification from "../models/Notifications.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// http://localhost:5000/api/notifications/allNotifications
router.get("/allNotifications", protect, async (req, res) => {
  try {
    const Notifications = await Notification.find();
    res.json(Notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// http://localhost:5000/api/notifications/updateNotification/6a33bb51c6cc26fef262a318
router.put("/updateNotification/:id", protect, async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        message: req.body.message,
        title: req.body.title,
      },
      { new: true },
    );
    if (!updatedNotification)
      return res
        .status(404)
        .json({ message: "Notification not Found to update" });
    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
