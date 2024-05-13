import { Router } from "express";
import { protect } from "../middlewares";
import { AuthController } from "../controllers/auth";
import { AuthService } from "../services/auth.service";
import { AuthValidator } from "../validators/auth.validator";
import { AuthUtil } from "../utils/auth.util";

const router = Router();

const authUtil = new AuthUtil();
const authService = new AuthService(authUtil);
const authValidator = new AuthValidator();
const authController = new AuthController(authService, authValidator);

router.post("/login", authController.login);
router.post("/register", authController.regiter);
router.get("/me", protect, authController.getMe);

export default router;
