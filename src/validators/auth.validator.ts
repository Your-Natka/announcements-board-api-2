import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username may contain letters, numbers and underscores only"),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(100),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
