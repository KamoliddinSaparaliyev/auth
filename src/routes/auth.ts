import { Router } from "express";
import { AuthController } from "../controllers/auth";

const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.regiter);

export default router;
