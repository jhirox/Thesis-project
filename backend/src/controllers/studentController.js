import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as studentService from "../services/studentService.js";
import {
  submitEnrollmentSchema,
  updateStudentProfileSchema,
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
    id: req.params.id,
    email: req.query.email,
  });

  res.status(200).json({
    success: true,
    data: profile,
  });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const payload = updateStudentProfileSchema.parse(req.body);
  const profile = await studentService.updateStudentProfile(payload);

  res.status(200).json({
    success: true,
    data: profile,
  });
});
