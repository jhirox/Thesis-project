import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as studentService from "../services/studentService.js";
import { buildStoredFileUrl } from "../config/uploadStorage.js";
import {
  registrarApprovalDraftSchema,
  submitEnrollmentSchema,
  updateEnrollmentStatusSchema,
  updateStudentProfileSchema,
  updateStudentReceiptSchema,
} from "../validators/studentSchemas.js";

export const getStudents = asyncHandler(async (req, res) => {
  const result = await studentService.findStudents(req.query);

  res.status(200).json({
    success: true,
    message: "Students retrieved successfully",
    totalStudents: result.total,
    pagination: {
      limit: result.limit,
      offset: result.offset,
      count: result.data.length,
    },
    data: result.data,
  });
});

export const getStudentByID = asyncHandler(async (req, res) => {
  const studentDetails = await studentService.findStudentById(req.params.id);

  res.status(200).json({
    success: true,
    studentDetails,
  });
});

export const submitEnrollment = asyncHandler(async (req, res) => {
  const payload = submitEnrollmentSchema.parse(req.body);
  const result = await studentService.submitEnrollment(payload);

  res.status(201).json({
    success: true,
    message: "Enrollment submitted successfully",
    studentId: result.studentId,
    enrollmentId: result.enrollmentId,
    queueNumber: result.queueNumber,
  });
});

export const getEnrollments = asyncHandler(async (req, res) => {
  const result = await studentService.findEnrollments(req.query);

  res.status(200).json({
    success: true,
    message: "Enrollments retrieved successfully",
    totalEnrollments: result.total,
    pagination: {
      limit: result.limit,
      offset: result.offset,
      count: result.data.length,
    },
    data: result.data,
  });
});

export const getRecentEnrollments = asyncHandler(async (req, res) => {
  const result = await studentService.findRecentEnrollments(req.query);

  res.status(200).json({
    success: true,
    message: "Recent enrollments retrieved successfully",
    totalRecentEnrollments: result.data.length,
    limit: result.limit,
    data: result.data,
  });
});

export const getEnrollmentApplicantDetails = asyncHandler(async (req, res) => {
  const enrollment = await studentService.findEnrollmentApplicantDetails(req.params.id);

  res.status(200).json({
    success: true,
    message: "Enrollment applicant details retrieved successfully",
    data: enrollment,
  });
});

export const getStudentProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.findStudentProfile({
    studentId: req.params.id,
    email: req.query.email,
  });

  res.status(200).json({
    success: true,
    data: profile,
  });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const payload = updateStudentProfileSchema.parse(req.body);

  if (req.file) {
    payload.profilePhotoUrl = buildStoredFileUrl(req.file.filename);
  }

  const profile = await studentService.updateStudentProfile(payload);

  res.status(200).json({
    success: true,
    data: profile,
  });
});

export const updateStudentReceipt = asyncHandler(async (req, res) => {
  const payload = updateStudentReceiptSchema.parse(req.body);

  if (req.file) {
    payload.officialReceiptFileUrl = buildStoredFileUrl(req.file.filename);
    payload.officialReceiptFileName = req.file.originalname;
    payload.officialReceiptFileType = req.file.mimetype;
  }

  const profile = await studentService.updateStudentReceipt(payload);

  res.status(200).json({
    success: true,
    data: profile,
  });
});

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const payload = updateEnrollmentStatusSchema.parse(req.body);
  const enrollment = await studentService.updateEnrollmentStatus(payload);

  res.status(200).json({
    success: true,
    message: "Enrollment status updated successfully",
    data: enrollment,
  });
});

export const getRegistrarApprovalDrafts = asyncHandler(async (_req, res) => {
  const drafts = await studentService.findRegistrarApprovalDrafts();

  res.status(200).json({
    success: true,
    data: drafts,
  });
});

export const saveRegistrarApprovalDraft = asyncHandler(async (req, res) => {
  const payload = registrarApprovalDraftSchema.parse(req.body);
  const draft = await studentService.saveRegistrarApprovalDraft(payload);

  res.status(200).json({
    success: true,
    message: "Registrar approval draft saved successfully",
    data: draft,
  });
});

export const deleteRegistrarApprovalDraft = asyncHandler(async (req, res) => {
  const payload = registrarApprovalDraftSchema.parse(req.body);
  const draft = await studentService.deleteRegistrarApprovalDraft(payload);

  res.status(200).json({
    success: true,
    message: "Registrar approval draft removed successfully",
    data: draft,
  });
});
