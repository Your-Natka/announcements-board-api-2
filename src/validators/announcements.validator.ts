import { z } from "zod";

const announcementFields = {
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(5000),
  price: z.number().finite().nonnegative(),
  category: z.string().trim().min(1).max(50),
};

export const createAnnouncementSchema = z.object(announcementFields);

export const updateAnnouncementSchema = z.object(announcementFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const announcementIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().trim().optional().default(""),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});
