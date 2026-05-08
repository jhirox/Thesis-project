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

const optionalQueryString = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalized = String(value).trim();
    return normalized === "" ? undefined : normalized;
  },
  z.string().max(100)
).optional();

const optionalPaginationNumber = z.preprocess(
  (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return undefined;
    }

    return Number.parseInt(String(value), 10);
  },
  z.number().int().nonnegative()
).optional();

export const studentAccountFilterSchema = z.object({
  search: optionalQueryString,
  course: optionalQueryString,
  studentType: optionalQueryString,
  status: z.enum(["Active", "Inactive"]).optional(),
  limit: optionalPaginationNumber,
  offset: optionalPaginationNumber,
  page: optionalPaginationNumber,
});

export const submitEnrollmentSchema = z.object({
  firstName: trimmedString.min(1, "firstName is required"),
  middleName: optionalTrimmedString,
  lastName: trimmedString.min(1, "lastName is required"),
  suffix: optionalTrimmedString,
  birthDate: trimmedString.min(1, "birthDate is required"),
  birthPlace: optionalTrimmedString,
  sex: trimmedString.min(1, "sex is required"),
  civilStatus: optionalTrimmedString,
  spouseName: optionalTrimmedString,
  nationality: optionalTrimmedString,
  religion: optionalTrimmedString,
  email: trimmedString.email("A valid email is required"),
  contactNumber: trimmedString.min(1, "contactNumber is required"),
  address: trimmedString.min(1, "address is required"),
  program: trimmedString.min(1, "program is required"),
  learningModality: trimmedString.min(1, "learningModality is required"),
  studentType: trimmedString.min(1, "studentType is required"),
  highestAttainment: trimmedString.min(1, "highestAttainment is required"),
  lastSchool: optionalTrimmedString,
  lastSchoolYear: trimmedString.min(1, "lastSchoolYear is required"),
  yearLevel: trimmedString.min(1, "yearLevel is required"),
  semester: trimmedString.min(1, "semester is required"),
  workingStatus: optionalTrimmedString,
  motherMaiden: optionalTrimmedString,
  fatherName: optionalTrimmedString,
  guardianName: optionalTrimmedString,
  guardianContact: optionalTrimmedString,
  remarks: optionalTrimmedString,
  agreedToTerms: z.preprocess(
    (value) => value === true || value === "true" || value === 1 || value === "1",
    z.literal(true, {
      message: "You must agree to the terms and conditions before submitting.",
    })
  ),
  agreedAt: optionalTrimmedString,
});

export const updateStudentProfileSchema = z
  .object({
    studentId: z.union([z.string().trim(), z.number()]).optional(),
    email: optionalTrimmedString,
    profilePhotoUrl: optionalTrimmedString.optional(),
    contactNumber: optionalTrimmedString.optional(),
    birthDate: optionalTrimmedString.optional(),
    completeAddress: optionalTrimmedString.optional(),
    sex: optionalTrimmedString.optional(),
  })
  .refine((payload) => payload.studentId || payload.email, {
    message: "Student id or email is required to update profile",
    path: ["studentId"],
  });

export const updateStudentReceiptSchema = z
  .object({
    enrollmentId: z.union([z.string().trim(), z.number()]).optional(),
    studentId: z.union([z.string().trim(), z.number()]).optional(),
    email: optionalTrimmedString,
    officialReceiptNumber: optionalTrimmedString,
    officialReceiptFileUrl: optionalTrimmedString.optional(),
    officialReceiptFileName: optionalTrimmedString.optional(),
    officialReceiptFileType: optionalTrimmedString.optional(),
  })
  .refine((payload) => payload.enrollmentId || payload.studentId || payload.email, {
    message: "Enrollment id, student id, or email is required to update official receipt",
    path: ["enrollmentId"],
  });

export const updateEnrollmentStatusSchema = z.object({
  enrollmentId: z.union([z.string().trim(), z.number()]),
  applicationStatus: z.enum([
    "Submitted",
    "Under Review",
    "Approved",
    "Enrolled",
    "On Hold",
    "Rejected",
    "Dropped",
  ]),
});

export const updateStudentStatusSchema = z
  .object({
    studentId: z.union([z.string().trim(), z.number()]).optional(),
    email: optionalTrimmedString,
    status: z.enum(["Active", "Inactive"]),
  })
  .refine((payload) => payload.studentId || payload.email, {
    message: "Student id or email is required to update account status",
    path: ["studentId"],
  });

export const updateStudentAccountSchema = z
  .object({
    studentId: z.union([z.string().trim(), z.number()]).optional(),
    email: trimmedString.email("A valid email is required"),
    originalEmail: optionalTrimmedString,
    fullName: trimmedString.min(1, "fullName is required"),
    course: optionalTrimmedString,
    studentType: optionalTrimmedString,
    status: z.enum(["Active", "Inactive"]),
  })
  .refine((payload) => payload.studentId || payload.originalEmail || payload.email, {
    message: "Student id or email is required to update account",
    path: ["studentId"],
  });

export const registrarApprovalDraftSchema = z.object({
  enrollmentId: z.union([z.string().trim(), z.number()]),
  studentId: z.union([z.string().trim(), z.number()]).optional(),
});

export const rejectedEnrollmentTrashSchema = z.object({
  enrollmentId: z.union([z.string().trim(), z.number()]),
  deletedBy: optionalTrimmedString,
  deleteReason: optionalTrimmedString,
});
