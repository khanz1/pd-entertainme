import { Router } from "express";
import * as AuthController from "./auth.controller";
import { authenticatation } from "@middleware/authentication";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/login/google", AuthController.loginWithGoogle);
router.get("/me", authenticatation, AuthController.getMe);

export default router;