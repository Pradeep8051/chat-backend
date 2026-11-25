import type { Response } from "express";

export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  payload: Omit<SuccessResponse<T>, "success"> = {},
  statusCode = 200,
): Response {
  return res.status(statusCode).json({ success: true, ...payload });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code = "INTERNAL_ERROR",
  details?: unknown,
): Response {
  const body: ErrorResponse = { success: false, message, code };
  if (details !== undefined) body.details = details;
  return res.status(statusCode).json(body);
}