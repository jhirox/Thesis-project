import { z } from "zod";

const trimmedString = z.string().trim();
const optionalTrimmedString = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = String(value).trim();
    return normalized === "" ? null : normalized;
  },
  z.string().nullable()
).optional().transform((value) => value ?? null);

export const createScheduleNotificationSchema = z.object({
  enrollmentId: z.union([z.string().trim(), z.number()]),
  studentId: z.union([z.string().trim(), z.number()]).optional(),
  studentEmail: trimmedString.email("A valid student email is required"),
  appointmentDate: trimmedString.min(1, "appointmentDate is required"),
  appointmentTime: trimmedString.min(1, "appointmentTime is required"),
  message: optionalTrimmedString,
  includesSoftCopy: z.boolean().default(true),
});

export const listNotificationsSchema = z.object({
  email: trimmedString.email("A valid email is required"),
});

export const markNotificationReadSchema = z.object({
  notificationId: z.union([z.string().trim(), z.number()]),
});

export const clearNotificationsSchema = z.object({
  email: trimmedString.email("A valid email is required"),
});
