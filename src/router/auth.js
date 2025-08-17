import express from 'express';
import auth from '../controllers/authController.js';
import { loginSecurity } from '../middleware/security.middleware.js';

const router = express.Router();


// Admin-only routes with enhanced security
router.post('/admin/login', loginSecurity, auth.adminLogin);
router.post('/admin/forgot-password', loginSecurity, auth.adminForgotPassword);
router.post('/admin/verify-otp', loginSecurity, auth.adminVerifyOtp);
router.post('/admin/reset-password', loginSecurity, auth.adminResetPassword);
router.post('/admin/resend-otp', loginSecurity, auth.adminResendOtp);

export default router;