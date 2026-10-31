import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma/client";

const authorSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
};

export async function listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
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

export async function getAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
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

export async function createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const announcement = await prisma.announcement.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        userId: req.user.sub,
      },
      include: { user: { select: authorSelect } },
    });
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
}

async function findOwnedAnnouncement(id: number, userId: number, res: Response) {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
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

export async function updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const existing = await findOwnedAnnouncement(Number(req.params.id), req.user.sub, res);
    if (!existing) return;

    const announcement = await prisma.announcement.update({
      where: { id: existing.id },
      data: req.body,
      include: { user: { select: authorSelect } },
    });
    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const existing = await findOwnedAnnouncement(Number(req.params.id), req.user.sub, res);
    if (!existing) return;
    await prisma.announcement.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
