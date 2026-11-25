import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND");
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode, error.code, error.details);
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      sendError(res, "A record with these values already exists", 409, "DUPLICATE_RECORD");
      return;
    }
    if (error.code === "P2025") {
      sendError(res, "Record not found", 404, "NOT_FOUND");
      return;
    }
    sendError(res, "Database request failed", 400, "DATABASE_ERROR", error.meta);
    return;
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    sendError(res, "Invalid database query", 400, "DATABASE_VALIDATION_ERROR");
    return;
  }
  const message = error instanceof Error ? error.message : "Unexpected server error";
  // eslint-disable-next-line no-console
  console.error("[errorHandler]", error);
  sendError(res, message, 500, "INTERNAL_ERROR");
}