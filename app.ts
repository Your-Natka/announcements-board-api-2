import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./src/routes/auth.routes";
import announcementRoutes from "./src/routes/announcements.routes";
import { getOpenApiDocument } from "./src/openapi";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "./src/logger";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(pinoHttp({ logger }));

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "Announcements Board API", docs: "/api-docs" });
});

app.use("/auth", authRoutes);
app.use("/announcements", announcementRoutes);

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.status(200).json(getOpenApiDocument());
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(getOpenApiDocument()));

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (error?.code === "P2025") {
    res.status(404).json({ message: "Resource not found" });
    return;
  }
  if (error?.code === "P2002") {
    res.status(409).json({ message: "Resource already exists" });
    return;
  }
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () =>
    console.log(`API listening on http://localhost:${port}`),
  );
}

export default app;
