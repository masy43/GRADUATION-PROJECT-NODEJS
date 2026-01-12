import type { NextFunction, Request, Response } from "express";

import AppError from "../utils/AppError";

const allowedTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const currentUser = req.currentUser;
    const userRole =
      currentUser &&
      typeof currentUser === "object" &&
      "role" in currentUser &&
      typeof (currentUser as { role?: unknown }).role === "string"
        ? (currentUser as { role: string }).role
        : undefined;

    if (!userRole || !roles.includes(userRole)) {
      next(new AppError("Unauthorized role", 403));
      return;
    }

    next();
    return;
  };
};

export default allowedTo;
