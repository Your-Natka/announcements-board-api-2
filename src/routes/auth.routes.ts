import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validator";
import { authRateLimiter } from "../middleware/authRateLimiter";

const router = Router();

router.use(authRateLimiter);

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
