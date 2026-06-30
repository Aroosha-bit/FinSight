import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ensureAuthenticated from "../middleware/authMiddleware.js";
import {
  forgotPasswordValidation,
  logInValidation,
  registerValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from "../middleware/AuthValidation.js";
import {
  logIn,
  register,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getGeminiAdvice,
} from "../controllers/AuthController.js";

const router = express.Router();

// http://localhost:5000/api/auth/register
router.post("/register", registerValidation, register);

// http://localhost:5000/api/auth/login
router.post("/login", logInValidation, logIn);

// http://localhost:5000/api/auth/forgot-password
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

// http://localhost:5000/api/auth/reset-password
router.post("/reset-password", resetPasswordValidation, resetPassword);

// http://localhost:5000/api/auth/profile
router.get("/profile", ensureAuthenticated, getProfile);
router.put("/profile", ensureAuthenticated, updateProfileValidation, updateProfile);

// http://localhost:5000/api/auth/advice
router.get("/advice", ensureAuthenticated, getGeminiAdvice);

export default router;
