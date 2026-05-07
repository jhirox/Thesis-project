import express from "express";
import {
  clearNotifications,
  createDirectNotification,
  createScheduleNotification,
  deleteNotification,
  getNotifications,
  getStaffNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { authenticateToken, requireRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/schedule", requireRoles("registrar", "admin", "superadmin", "super admin"), createScheduleNotification);
router.post("/send", requireRoles("registrar", "admin", "superadmin", "super admin"), createDirectNotification);
router.get("/staff", requireRoles("admin", "registrar", "superadmin", "super admin"), getStaffNotifications);
router.get("/", authenticateToken, getNotifications);
router.patch("/:id/read", authenticateToken, markNotificationRead);
router.patch("/read-all", authenticateToken, markAllNotificationsRead);
router.delete("/:id", authenticateToken, deleteNotification);
router.delete("/", authenticateToken, clearNotifications);

export default router;
