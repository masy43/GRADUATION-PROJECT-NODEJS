import "express";

declare global {
  namespace Express {
    // Attach decoded JWT (or similar) to the request.
    // Kept intentionally broad to avoid over-coupling.
    interface Request {
      currentUser?: unknown;
    }
  }
}

export {};
