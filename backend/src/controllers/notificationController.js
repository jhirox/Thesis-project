import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as notificationService from "../services/notificationService.js";
import {
  clearNotificationsSchema,
  createDirectNotificationSchema,
  createScheduleNotificationSchema,
  listNotificationsSchema,
  markNotificationReadSchema,
} from "../validators/notificationSchemas.js";

export const createScheduleNotification = asyncHandler(async (req, res) => {
  const payload = createScheduleNotificationSchema.parse(req.body);
  const result = await notificationService.createScheduleNotification(payload);

  res.status(201).json({
    success: true,
    message: "Schedule notification created successfully.",
    data: result,
  });
});

export const createDirectNotification = asyncHandler(async (req, res) => {
  const payload = createDirectNotificationSchema.parse(req.body);
  const result = await notificationService.createDirectNotification(payload);

  res.status(201).json({
    success: true,
    message: "Notification sent successfully.",
    data: result,
  });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const query = listNotificationsSchema.parse(req.query);
  const notifications = await notificationService.listNotificationsByEmail(query.email);

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const payload = markNotificationReadSchema.parse({
    notificationId: req.params.id,
  });

  await notificationService.markNotificationRead(payload.notificationId);

  res.status(200).json({
    success: true,
    message: "Notification marked as read.",
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const payload = clearNotificationsSchema.parse(req.body);
  await notificationService.markAllNotificationsRead(payload.email);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});

export const clearNotifications = asyncHandler(async (req, res) => {
  const payload = clearNotificationsSchema.parse(req.body);
  await notificationService.clearNotificationsByEmail(payload.email);

  res.status(200).json({
    success: true,
    message: "Notifications cleared successfully.",
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const payload = markNotificationReadSchema.parse({
    notificationId: req.params.id,
  });

  await notificationService.deleteNotification(payload.notificationId);

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully.",
  });
});
