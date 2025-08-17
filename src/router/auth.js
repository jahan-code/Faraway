import express from 'express';
import auth from '../controllers/authController.js';
// Removed security middleware temporarily

const router = express.Router();


// Admin-only routes (no security for now)
router.post('/admin/login', auth.adminLogin);
router.post('/admin/forgot-password', auth.adminForgotPassword);
router.post('/admin/verify-otp', auth.adminVerifyOtp);
router.post('/admin/reset-password', auth.adminResetPassword);
router.post('/admin/resend-otp', auth.adminResendOtp);

export default router;