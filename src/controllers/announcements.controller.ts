import { Request, Response, NextFunction } from "express";
import { unlink } from "node:fs/promises";
import { prisma } from "../../prisma/client";
import { logger } from "../logger";
import { cloudinary } from "../config/cloudinary";

const authorSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
};

async function uploadImage(file: Express.Multer.File): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "announcements",
      resource_type: "image",
    });

    logger.info(
      { publicId: result.public_id },
      "Announcement photo uploaded successfully",
    );

    return result.secure_url;
  } finally {
    try {
      await unlink(file.path);
    } catch (error) {
      logger.warn({ error }, "Could not delete temporary upload file");
    }
  }
}

export async function listAnnouncements(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query.page ?? 1);
    const search = String(req.query.search ?? "").trim();
    const sort = String(req.query.sort ?? "newest");
    const perPage = 10;

    const where = search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {};

    const [total, data] = await Promise.all([
      prisma.announcement.count({ where }),
      prisma.announcement.findMany({
        where,
        orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { user: { select: authorSelect } },
      }),
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / perPage),
        perPage,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { user: { select: authorSelect } },
    });

    if (!announcement) {
      res.status(404).json({ message: "Announcement not found" });
      return;
    }

    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
}

export async function createAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const imageUrl = req.file ? await uploadImage(req.file) : undefined;

    const announcement = await prisma.announcement.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        userId: req.user.sub,
        ...(imageUrl ? { imageUrl } : {}),
      },
      include: { user: { select: authorSelect } },
    });

    logger.info(
      {
        announcementId: announcement.id,
        userId: req.user.sub,
      },
      "Announcement created successfully",
    );

    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
}

async function findOwnedAnnouncement(
  id: number,
  userId: number,
  res: Response,
) {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    res.status(404).json({ message: "Announcement not found" });
    return null;
  }

  if (announcement.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return null;
  }

  return announcement;
}

export async function updateAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existing = await findOwnedAnnouncement(
      Number(req.params.id),
      req.user.sub,
      res,
    );

    if (!existing) return;

    const data: {
      title?: string;
      description?: string;
      price?: number;
      category?: string;
      imageUrl?: string;
    } = {};

    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.description !== undefined) {
      data.description = req.body.description;
    }
    if (req.body.price !== undefined) data.price = req.body.price;
    if (req.body.category !== undefined) data.category = req.body.category;

    if (req.file) {
      data.imageUrl = await uploadImage(req.file);
    }

    const announcement = await prisma.announcement.update({
      where: { id: existing.id },
      data,
      include: { user: { select: authorSelect } },
    });

    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existing = await findOwnedAnnouncement(
      Number(req.params.id),
      req.user.sub,
      res,
    );

    if (!existing) return;

    await prisma.announcement.delete({ where: { id: existing.id } });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
