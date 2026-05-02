import express from "express";
import {
  clearNotifications,
  createScheduleNotification,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/schedule", createScheduleNotification);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);
router.delete("/:id", deleteNotification);
router.delete("/", clearNotifications);

export default router;
