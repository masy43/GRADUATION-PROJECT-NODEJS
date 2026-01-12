import type { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.status(401).json({ message: "Authorization header not found" });
    return;
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Invalid token format" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "Missing required parameter: JWT_SECRET" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload | string;
    req.currentUser = decoded;
    next();
    return;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
});

export default verifyToken;
