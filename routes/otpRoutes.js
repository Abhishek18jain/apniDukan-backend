import express, { Router } from "express";
import {resetPasswordOtp , sendForgetOtp , sendSignUpOtp , verifySignUpOtp} from "../controllers/otpController.js";
// import { protect } from "../middlewares/authMiddleware.js";
 const router = express.Router();
router.post("/signup/pre-register" , sendSignUpOtp);
router.post("/signup/verify-otp" ,verifySignUpOtp);
router.post("/forget/send-otp" ,  sendForgetOtp);
router.post("/forget/password" ,  resetPasswordOtp);

export default router;