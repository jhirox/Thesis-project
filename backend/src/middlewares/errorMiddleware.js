import { ZodError } from "zod";

export default function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || "Internal Server Error",
  };

  if (error.details) {
    response.details = error.details;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json(response);
}
