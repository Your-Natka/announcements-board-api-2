import { Router } from "express";
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcements.controller";
import { authenticate } from "../middleware/authenticate";
import { upload } from "../middleware/upload";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdSchema,
  announcementQuerySchema,
} from "../validators/announcements.validator";

const router = Router();

router.get("/", validateQuery(announcementQuerySchema), listAnnouncements);

router.get("/:id", validateParams(announcementIdSchema), getAnnouncement);

router.post(
  "/",
  authenticate,
  upload.single("image"),
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);

router.patch(
  "/:id",
  authenticate,
  validateParams(announcementIdSchema),
  upload.single("image"),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);

router.delete(
  "/:id",
  authenticate,
  validateParams(announcementIdSchema),
  deleteAnnouncement,
);

export default router;
