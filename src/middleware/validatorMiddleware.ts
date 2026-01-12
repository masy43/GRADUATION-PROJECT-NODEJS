import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const validatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorData = errors.array().map((error) => {
      const err = error as { msg?: unknown; path?: unknown; param?: unknown };

      const field =
        typeof err.path === "string"
          ? err.path
          : typeof err.param === "string"
            ? err.param
            : "unknown";
      const message = typeof err.msg === "string" ? err.msg : String(err.msg);

      return { field, message };
    });

    const errorMessage = errorData.map((error) => error.message);

    res.status(400).json({
      status: "fail",
      httpCode: 400,
      data: { errors: errorData },
      message: errorMessage,
    });
    return;
  }

  next();
  return;
};

export default validatorMiddleware;
