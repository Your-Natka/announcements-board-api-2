import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const ErrorSchema = z.object({ message: z.string() });
const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime().optional(),
});
const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
const AnnouncementSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: UserSchema,
});
const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});
const LoginSchema = z.object({ username: z.string(), password: z.string() });
const RefreshSchema = z.object({ refreshToken: z.string() });
const CreateAnnouncementSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  category: z.string().min(1),
});

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a user",
  request: {
    body: { content: { "application/json": { schema: RegisterSchema } } },
  },
  responses: {
    201: {
      description: "User registered",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    409: {
      description: "Username or email already taken",
      content: { "application/json": { schema: ErrorSchema } },
    },
    400: { description: "Validation failed" },
  },
});
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Log in",
  request: {
    body: { content: { "application/json": { schema: LoginSchema } } },
  },
  responses: {
    200: {
      description: "Logged in",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    401: { description: "Invalid credentials" },
  },
});
registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Rotate refresh token",
  request: {
    body: { content: { "application/json": { schema: RefreshSchema } } },
  },
  responses: {
    200: {
      description: "New token pair",
      content: { "application/json": { schema: TokenPairSchema } },
    },
    401: { description: "Invalid refresh token" },
  },
});
registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Log out",
  security: [{ bearerAuth: [] }],
  responses: {
    204: { description: "Logged out" },
    401: { description: "Unauthorized" },
  },
});
registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Get current user",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current user",
      content: { "application/json": { schema: UserSchema } },
    },
    401: { description: "Unauthorized" },
  },
});
registry.registerPath({
  method: "get",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "List announcements",
  request: {
    query: z.object({
      page: z.coerce.number().int().positive().optional(),
      search: z.string().optional(),
      sort: z.enum(["newest", "oldest"]).optional(),
    }),
  },
  responses: { 200: { description: "Paginated announcements" } },
});
registry.registerPath({
  method: "get",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Get announcement",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Announcement",
      content: { "application/json": { schema: AnnouncementSchema } },
    },
    404: { description: "Announcement not found" },
  },
});
registry.registerPath({
  method: "post",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Create announcement",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateAnnouncementSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: AnnouncementSchema } },
    },
    400: { description: "Validation failed" },
    401: { description: "Unauthorized" },
  },
});
registry.registerPath({
  method: "patch",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Update own announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CreateAnnouncementSchema.partial().refine(
            (v) => Object.keys(v).length > 0,
          ),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated",
      content: {
        "application/json": { schema: AnnouncementSchema },
      },
    },
    403: { description: "Access denied" },
    404: { description: "Announcement not found" },
  },
});
registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Delete own announcement",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: "Deleted" },
    403: { description: "Access denied" },
    404: { description: "Announcement not found" },
  },
});

export function getOpenApiDocument() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Announcements Board API",
      version: "1.0.0",
      description: "JSON REST API for an announcements board.",
    },
    servers: [{ url: "http://localhost:3000", description: "Local server" }],
  });
}
