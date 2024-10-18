import express from "express";
const router = express.Router();
import { registerUser, authUser } from "../controllers/authController.mjs";
import loginLimiter from "../middleware/loginLimiter.mjs";

router.route("/login").post(loginLimiter, authUser);

router.route("/register").post(registerUser);

export default router;
