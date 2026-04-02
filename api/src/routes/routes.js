import express from "express"
import authRoutes from "../modules/auth/auth.routes.js"
import noteRoutes from "../modules/note/note.route.js"
import noteShareRoutes from "../modules/noteShare/noteShare.route.js"

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/notes", noteRoutes);
router.use("/shares", noteShareRoutes);

export default router;
