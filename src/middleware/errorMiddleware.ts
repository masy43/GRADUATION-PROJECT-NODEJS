import type { NextFunction, Request, Response } from "express";

import httpStatusText from "../utils/httpStatusText";

type AnyError = {
  statusCode?: number;
  status?: string;
  message?: unknown;
  stack?: unknown;
} & Record<string, unknown>;

const formatErrorMessage = (message: unknown): string[] => {
  if (typeof message !== "string") {
    return ["Unexpected error"];
  }

  return message
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
};

const errorsInDevelopment = (err: AnyError, res: Response) => {
  const formattedMessage = formatErrorMessage(err.message);
  res.status(err.statusCode as number).json({
    status: err.status,
    httpCode: err.statusCode,
    message: formattedMessage,
    data: null,
    error: err,
    stack: err.stack,
  });
};

const errorsInProduction = (err: AnyError, res: Response) => {
  const formattedMessage = formatErrorMessage(err.message);
  res.status(err.statusCode as number).json({
    status: err.status,
    httpCode: err.statusCode,
    message: formattedMessage,
    data: null,
  });
};

const globalErrorHandler = (err: AnyError, _req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || httpStatusText.Error;

  if (process.env.NODE_ENV === "development") {
    errorsInDevelopment(err, res);
  } else {
    errorsInProduction(err, res);
  }
};

export default globalErrorHandler;
