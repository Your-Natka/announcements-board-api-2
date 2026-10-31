import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";

type RequestPart = "body" | "params" | "query";

function validate(schema: ZodType, part: RequestPart): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    // Express query/params are not safely assignable as generic records; body can be normalized.
    if (part === "body") req.body = result.data;
    if (part === "params") Object.assign(req.params, result.data);
    if (part === "query") Object.assign(req.query, result.data);
    next();
  };
}

export const validateBody = (schema: ZodType): RequestHandler => validate(schema, "body");
export const validateParams = (schema: ZodType): RequestHandler => validate(schema, "params");
export const validateQuery = (schema: ZodType): RequestHandler => validate(schema, "query");
