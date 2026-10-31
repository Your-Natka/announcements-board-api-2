import { Router } from "express";
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcements.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdSchema,
  announcementQuerySchema,
} from "../validators/announcements.validator";

const router = Router();

router.get("/", validateQuery(announcementQuerySchema), listAnnouncements);
router.get("/:id", validateParams(announcementIdSchema), getAnnouncement);
router.post("/", authenticate, validateBody(createAnnouncementSchema), createAnnouncement);
router.patch("/:id", authenticate, validateParams(announcementIdSchema), validateBody(updateAnnouncementSchema), updateAnnouncement);
router.delete("/:id", authenticate, validateParams(announcementIdSchema), deleteAnnouncement);

export default router;
