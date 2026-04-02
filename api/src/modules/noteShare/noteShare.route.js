import express from "express";
import NoteShareController from "./noteShare.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, NoteShareController.createShare);
router.get("/:token", NoteShareController.getSharedNote);
router.post("/:token/join", protect, NoteShareController.joinShare);

export default router;
