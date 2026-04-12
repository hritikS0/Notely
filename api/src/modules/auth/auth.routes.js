import express from "express"
import AuthController from "./auth.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register",AuthController.register);
router.post("/login",AuthController.login);
router.post("/logout",AuthController.logout);
router.put("/avatar",protect,AuthController.updateAvatar);
export default router;
