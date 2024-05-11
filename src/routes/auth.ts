import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { protect } from "../middlewares";

const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.regiter);
router.get("/me", protect, AuthController.getMe);

export default router;
