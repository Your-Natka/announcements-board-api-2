import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";
import { logger } from "../logger";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

function accessSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

function refreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return secret;
}

function createAccessToken(user: { id: number; username: string }): string {
  return jwt.sign(
    {
      username: user.username,
      type: "access",
    },
    accessSecret(),
    {
      subject: String(user.id),
      expiresIn: ACCESS_TTL,
    },
  );
}

function createRefreshToken(user: { id: number; username: string }): string {
  return jwt.sign(
    {
      username: user.username,
      type: "refresh",
    },
    refreshSecret(),
    {
      subject: String(user.id),
      expiresIn: REFRESH_TTL,
    },
  );
}

function publicUser<T extends { password?: string }>(
  user: T,
): Omit<T, "password"> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, email, password, name } = req.body;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: { id: true },
    });

    if (existing) {
      res.status(409).json({
        message: "Username or email already taken",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    logger.info({ userId: user.id }, "User registered successfully");

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({
        message: "Username or email already taken",
      });
      return;
    }

    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    const valid = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !valid) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    logger.info({ userId: user.id }, "User logged in successfully");

    res.status(200).json({
      user: publicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (typeof refreshToken !== "string" || !refreshToken) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    let payload: jwt.JwtPayload;

    try {
      payload = jwt.verify(refreshToken, refreshSecret()) as jwt.JwtPayload;
    } catch {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    const userId = Number(payload.sub);

    if (
      payload.type !== "refresh" ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.userId !== userId) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });

      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
        },
      }),
    ]);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    await prisma.refreshToken.deleteMany({
      where: { userId: req.user.sub },
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
