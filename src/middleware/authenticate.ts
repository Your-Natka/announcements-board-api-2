import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;

    // Access token must not be a refresh token.
    if (payload.type !== "access") {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    const sub = Number(payload.sub);

    if (!Number.isInteger(sub) || sub <= 0) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    req.user = {
      sub,
      username:
        typeof payload.username === "string" ? payload.username : undefined,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
